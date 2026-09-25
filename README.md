# VehicleGuard AI 🚗⚡

> **Unsupervised Multi-Model Vehicle Telemetry Anomaly Detection System**

VehicleGuard AI is a real-time, full-stack vehicle telemetry monitoring and anomaly detection platform. It standardizes raw CAN-Bus and OBD-II telemetry logs, trains an ensemble of unsupervised machine learning algorithms (Isolation Forest, Local Outlier Factor, One-Class SVM), and streams real-time telemetry playback with visual explainability.

---

## 🌟 Key Features

- **Automated Feature Standardization**: Uses fuzzy matching (`thefuzz`) to map raw CAN-bus headers (`VehSpd_kmh`, `EngineRPM`, `CoolantTemp`, etc.) to standard telemetry channels.
- **Multi-Model ML Ensemble**:
  - **Isolation Forest**: Detects global metric outliers.
  - **Local Outlier Factor (LOF)**: Identifies density-based localized anomalies.
  - **One-Class SVM**: Learns normal operating boundaries.
- **Consensus Voting & Explainability**: Calculates consensus votes across models (`weak`, `consensus`, or `strong` anomaly) and pinpoints root-cause metrics via z-score analysis.
- **Real-Time Stream Dashboard**: Server-Sent Events (SSE) telemetry playback with line charts (Speed, RPM, Engine Load, Thermal), dynamic Vehicle Health Score gauge, and live AI event timeline.
- **Persistent Storage**: Stores session metadata and anomaly event logs in SQLite database (`vehicleguard.db`).

---

## 📁 Repository Structure

```
Project/
├── backend/                  # FastAPI Python Backend
│   ├── main.py               # REST API & SSE streaming endpoints
│   ├── data_processor.py     # Fuzzy mapping, cleaning, & feature engineering
│   ├── ml_engine.py          # Isolation Forest, LOF, & One-Class SVM ensemble
│   ├── database.py           # SQLite SQLAlchemy connection
│   ├── models.py             # Session & AnomalyLog database schemas
│   └── create_samples.py     # Generator for sample telemetry CSVs
├── frontend/                 # Next.js 16 + React 19 + Recharts Frontend
│   ├── src/app/              # Next.js App Router (page.tsx, globals.css)
│   ├── src/components/       # UI Components (Dashboard, TelemetryChart, etc.)
│   └── public/samples/       # Pre-loaded sample datasets for 1-click testing
├── sample_data/              # Sample CSV files for manual uploads
└── README.md                 # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ & `npm`

---

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment (if needed)
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pandas numpy scikit-learn thefuzz Levenshtein

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

The backend server will run on `http://127.0.0.1:8000`.  
View interactive API documentation at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup (Next.js)

```bash
cd frontend

# Install Node dependencies
npm install

# Run development server
npm run dev
```

Open `http://localhost:3000` in your browser to access the application UI.

---

## 📊 Sample Datasets

The platform includes two built-in sample datasets for 1-click testing directly from the UI:
1. **Standard Telemetry**: Pre-mapped vehicle channels (`speed`, `rpm`, `coolant_temp`, `engine_load`).
2. **Raw CAN-Bus Log**: Unstandardized headers (`VehSpd_kmh`, `EngineRPM`, `CoolantTemp`, `EngLoad`) demonstrating fuzzy feature matching.

---

## 📄 License

This project is licensed under the MIT License.
