from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from database import Base
import datetime

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="processing")
    summary = Column(JSON, nullable=True)  # Store transformation summary

class AnomalyLog(Base):
    __tablename__ = "anomaly_logs"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    timestamp = Column(Float)
    severity = Column(String) # weak, consensus, strong
    details = Column(JSON) # explainability details

class AnomalyEpisode(Base):
    __tablename__ = "anomaly_episodes"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    episode_number = Column(Integer)
    start_time = Column(Float)
    end_time = Column(Float)
    duration_seconds = Column(Float)
    record_count = Column(Integer)
    severity = Column(String)
    peak_confidence = Column(Float)
    affected_features = Column(JSON)
    details = Column(JSON)

class ModelConfigLog(Base):
    __tablename__ = "model_config_logs"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    config = Column(JSON)
    metrics = Column(JSON)
