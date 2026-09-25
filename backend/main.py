from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
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
from ml_engine import AnomalyDetector

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VehicleGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = DataProcessor()
# We keep active detectors in memory mapped by session ID
active_detectors = {}
# We keep dataframes in memory for streaming playback
active_dataframes = {}

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
    
    # Store in DB
    db_session = models.Session(filename=file.filename, summary=summary, status="ready")
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Load processed dataframe for memory and train models
    df = pd.read_csv(processed_filepath)
    active_dataframes[db_session.id] = df
    
    detector = AnomalyDetector()
    success = detector.train(df)
    if success:
        active_detectors[db_session.id] = detector
    else:
        raise HTTPException(status_code=500, detail="Failed to train anomaly detection models.")
    
    return {
        "session_id": db_session.id,
        "summary": summary
    }

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.get("/api/stream/{session_id}")
async def stream_telemetry(session_id: int, db: Session = Depends(get_db)):
    if session_id not in active_dataframes or session_id not in active_detectors:
        raise HTTPException(status_code=404, detail="Session not found or not ready.")
        
    df = active_dataframes[session_id]
    detector = active_detectors[session_id]
    
    async def event_generator():
        for index, row in df.iterrows():
            row_dict = row.to_dict()
            analysis = detector.predict_row(row_dict)
            
            # Log anomaly to DB if detected
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
                    print("DB logging error:", db_err)
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

