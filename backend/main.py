from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import shutil
import os
import uuid
import json
import pandas as pd
import asyncio

from database import engine, Base, get_db
import models
from data_processor import DataProcessor
from ml_engine import AnomalyDetector, DEFAULT_CONFIG, sanitize_json_obj

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VehicleGuard AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = DataProcessor()
# Active detectors in memory mapped by session ID
active_detectors = {}
# Active dataframes in memory mapped by session ID
active_dataframes = {}
# Active analysis results mapped by session ID
active_analytics = {}

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _get_or_restore_session_data(session_id: int, db: Session):
    """
    Ensures active_dataframes, active_detectors, and active_analytics are populated,
    restoring from disk/DB if needed after server restart.
    """
    if session_id in active_dataframes and session_id in active_detectors and session_id in active_analytics:
        return active_dataframes[session_id], active_detectors[session_id], active_analytics[session_id]

    db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found in database.")

    # Locate processed file or fallback to uploads
    processed_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    processed_files = [os.path.join(processed_dir, f) for f in os.listdir(processed_dir) if f.endswith(".csv")] if os.path.exists(processed_dir) else []

    df = None
    if processed_files:
        # Sort by modification time to get matching file
        processed_files.sort(key=os.path.getmtime, reverse=True)
        for pfile in processed_files:
            try:
                temp_df = pd.read_csv(pfile)
                df = temp_df
                break
            except Exception:
                continue

    if df is None:
        raise HTTPException(status_code=404, detail="Processed telemetry dataset not found on server disk.")

    detector = AnomalyDetector()
    success = detector.train(df)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to initialize ML detection models.")

    analytics = detector.analyze_dataset(df)

    active_dataframes[session_id] = df
    active_detectors[session_id] = detector
    active_analytics[session_id] = analytics

    return df, detector, analytics

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "VehicleGuard AI Core API", "version": "2.0.0"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
        
    file_id = str(uuid.uuid4())
    filepath = os.path.join(UPLOAD_DIR, f"{file_id}.csv")
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Process the CSV intelligently
    processed_filepath, summary = processor.process_csv(filepath)
    
    # Store session in DB
    db_session = models.Session(filename=file.filename, summary=summary, status="ready")
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Load processed dataframe & train default models
    df = pd.read_csv(processed_filepath)
    active_dataframes[db_session.id] = df
    
    detector = AnomalyDetector()
    success = detector.train(df)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to train anomaly detection models.")
    
    active_detectors[db_session.id] = detector
    
    # Analyze full dataset & group episodes
    analytics = detector.analyze_dataset(df)
    active_analytics[db_session.id] = analytics

    # Save initial episodes to DB
    for ep in analytics.get("episodes", []):
        try:
            ep_model = models.AnomalyEpisode(
                session_id=db_session.id,
                episode_number=ep["episode_number"],
                start_time=ep["start_time"],
                end_time=ep["end_time"],
                duration_seconds=ep["duration_seconds"],
                record_count=ep["record_count"],
                severity=ep["severity"],
                peak_confidence=ep["peak_confidence"],
                affected_features=ep["affected_features"],
                details=ep
            )
            db.add(ep_model)
        except Exception as ep_err:
            print("Error persisting episode:", ep_err)
    
    try:
        db.commit()
    except Exception:
        db.rollback()
    
    return sanitize_json_obj({
        "session_id": db_session.id,
        "summary": summary,
        "analytics_summary": analytics.get("summary_stats", {}),
        "episodes_count": len(analytics.get("episodes", []))
    })

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.get("/api/sessions/{session_id}/analytics")
async def get_session_analytics(session_id: int, db: Session = Depends(get_db)):
    _, _, analytics = _get_or_restore_session_data(session_id, db)
    return sanitize_json_obj(analytics)

@app.get("/api/sessions/{session_id}/episodes")
async def get_session_episodes(session_id: int, db: Session = Depends(get_db)):
    _, _, analytics = _get_or_restore_session_data(session_id, db)
    return sanitize_json_obj(analytics.get("episodes", []))

@app.get("/api/sessions/{session_id}/models")
async def get_session_models(session_id: int, db: Session = Depends(get_db)):
    _, detector, analytics = _get_or_restore_session_data(session_id, db)
    return sanitize_json_obj({
        "config": detector.config,
        "model_comparison": analytics.get("model_comparison", {}),
        "model_agreement_distribution": analytics.get("model_agreement_distribution", {})
    })

@app.post("/api/sessions/{session_id}/models/retrain")
async def retrain_session_models(session_id: int, config: dict = Body(...), db: Session = Depends(get_db)):
    df, detector, _ = _get_or_restore_session_data(session_id, db)
    
    # Validate and train with new configuration
    validated_config = AnomalyDetector.validate_config(config)
    success = detector.train(df, config=validated_config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to retrain ML models with provided configuration.")

    # Re-analyze dataset
    updated_analytics = detector.analyze_dataset(df)
    active_detectors[session_id] = detector
    active_analytics[session_id] = updated_analytics

    # Log config change to DB
    try:
        cfg_log = models.ModelConfigLog(
            session_id=session_id,
            config=validated_config,
            metrics=updated_analytics.get("model_comparison", {})
        )
        db.add(cfg_log)

        # Update episodes in DB
        db.query(models.AnomalyEpisode).filter(models.AnomalyEpisode.session_id == session_id).delete()
        for ep in updated_analytics.get("episodes", []):
            ep_model = models.AnomalyEpisode(
                session_id=session_id,
                episode_number=ep["episode_number"],
                start_time=ep["start_time"],
                end_time=ep["end_time"],
                duration_seconds=ep["duration_seconds"],
                record_count=ep["record_count"],
                severity=ep["severity"],
                peak_confidence=ep["peak_confidence"],
                affected_features=ep["affected_features"],
                details=ep
            )
            db.add(ep_model)
        db.commit()
    except Exception as db_err:
        print("DB update error during retrain:", db_err)
        db.rollback()

    return sanitize_json_obj({
        "status": "success",
        "message": "Models successfully retrained with updated hyperparameter configuration.",
        "config": validated_config,
        "model_comparison": updated_analytics.get("model_comparison", {}),
        "analytics_summary": updated_analytics.get("summary_stats", {}),
        "analytics": updated_analytics
    })

@app.get("/api/stream/{session_id}")
async def stream_telemetry(session_id: int, db: Session = Depends(get_db)):
    df, detector, _ = _get_or_restore_session_data(session_id, db)
    
    async def event_generator():
        for index, row in df.iterrows():
            row_dict = row.to_dict()
            analysis = detector.predict_row(row_dict)
            
            # Log anomaly event to DB if detected
            if analysis and analysis.get("votes", 0) > 0:
                try:
                    log_entry = models.AnomalyLog(
                        session_id=session_id,
                        timestamp=float(row_dict.get("timestamp", index)),
                        severity=analysis.get("severity", "weak_anomaly"),
                        details=analysis
                    )
                    db.add(log_entry)
                    db.commit()
                except Exception as db_err:
                    db.rollback()

            payload = {
                "telemetry": row_dict,
                "analysis": analysis,
                "progress": (index + 1) / len(df) * 100
            }
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(0.3) # playback speed
            
        yield f"data: {json.dumps({'status': 'completed'})}\n\n"
        
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/sessions/{session_id}/anomalies")
async def get_session_anomalies(session_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.AnomalyLog).filter(models.AnomalyLog.session_id == session_id).all()
    return logs
