# VehicleGuard AI 🚗⚡

> **Unsupervised Multi-Model Vehicle Telemetry Anomaly Detection System**

VehicleGuard AI is a real-time, full-stack vehicle telemetry monitoring, root-cause analysis, and anomaly intelligence platform. It standardizes raw CAN-Bus and OBD-II telemetry logs, trains an ensemble of unsupervised machine learning algorithms (Isolation Forest, Local Outlier Factor, One-Class SVM), groups consecutive anomalies into episodes, and streams real-time telemetry playback with visual explainability.

---

## 🌟 Key Features & Advanced Intelligence

### 1. Anomaly Intelligence & Root-Cause Analysis
- **Ensemble Consensus**: Combines predictions from Isolation Forest, Local Outlier Factor (LOF), and One-Class SVM.
- **Deterministic Confidence Calculation**: Evaluates confidence percentages (0%–100%) based on model agreement and metric z-score deviation.
- **Feature Contribution Weights**: Calculates relative feature impact percentages for every anomaly event.
- **Data-Driven Explanations**: Generates human-readable, context-aware explanation statements describing exact value deviations and model consensus.

### 2. Historical Analytics & Anomaly Episode Grouping
- **Backend Episode Grouping**: Groups consecutive or near-consecutive anomalous telemetry records within a configurable time window into unified **Anomaly Episodes** with start/end time, duration, peak metrics, and baseline normal ranges.
- **5 Real-Data Visualizations (Recharts)**:
  1. *Anomalies Over Time & Confidence Curve*
  2. *Anomaly Severity Distribution (Pie Chart)*
  3. *Most Affected Features (Horizontal Bar Chart)*
  4. *Model Agreement & Consensus Intersection Matrix*
  5. *Peak Z-Score Deviation Trend*

### 3. ML Model Comparison & Configuration Center
- **Performance Matrix**: Compares Isolation Forest, LOF, and One-Class SVM on anomalies detected, normal records, consensus agreement percentage, and fit runtime (ms).
- **Interactive Hyperparameter Tuning**: Live configuration panel for Isolation Forest (`n_estimators`, `contamination`), LOF (`n_neighbors`, `metric`), and One-Class SVM (`kernel`, `nu`, `gamma`).
- **Safe Validation & Live Retraining**: Parameter boundary validation with a 1-click **RETRAIN MODELS** action that re-fits models, recalculates episodes, and updates UI analytics.

---

## 🔍 How VehicleGuard AI Detects Anomalies

```
  Raw Telemetry CSV (CAN-Bus / OBD-II)
                │
                ▼
      1. Data Ingestion & Cleaning
      (Fuzzy Header Matching & Median Imputation)
                │
                ▼
      2. Feature Engineering
      (Speed Acceleration Δspeed & RPM Change Δrpm)
                │
                ▼
      3. Feature Scaling (StandardScaler)
      (Normalizes metrics to Z-Scores: μ=0, σ=1)
                │
                ▼
      4. Multi-Model ML Ensemble
      ┌──────────────────┬─────────────────┬──────────────────┐
      │ Isolation Forest │  LOF Detector   │  One-Class SVM   │
      └────────┬─────────┴────────┬────────┴────────┬─────────┘
               │                  │                 │
               └──────────────────┼─────────────────┘
                                  │
                                  ▼
      5. Consensus Voting (0–3 Votes)
      (Weak: 1 Vote | Consensus: 2 Votes | Strong: 3 Votes)
                                  │
                                  ▼
      6. Confidence & Root-Cause Calculation
      (Confidence % & Feature Contribution Breakdown)
                                  │
                                  ▼
      7. Anomaly Episode Grouping
      (Sequential Windowing into Unified Episodes)
                                  │
                                  ▼
      8. Vehicle Health & Real-Time SSE Stream
      (Circular Gauge, Timeline, & Recharts Visualizations)
```

### Anomaly Confidence Methodology
$$\text{Base Confidence} = \begin{cases} 0.0\% & \text{if } 0 \text{ votes} \\ 50.0\% & \text{if } 1 \text{ vote (Weak)} \\ 75.0\% & \text{if } 2 \text{ votes (Consensus)} \\ 90.0\% & \text{if } 3 \text{ votes (Strong)} \end{cases}$$

$$\text{Z-Score Bonus} = \min\left(10.0, \max\left(0.0, (z_{\max} - 2.0) \times 3.0\right)\right)$$

$$\text{Total Confidence} = \min\left(100.0, \text{Base Confidence} + \text{Z-Score Bonus}\right)$$

### Anomaly Episode Grouping Methodology
Consecutive anomalous telemetry records ($t_1, t_2, \dots, t_k$) occurring within a time gap threshold ($\le 2$ frames) are grouped into a single **Anomaly Episode**:
- **Duration**: $T_{\text{end}} - T_{\text{start}}$
- **Peak Metrics**: Max observed value for affected features during episode window.
- **Normal Range**: Baseline $25^{\text{th}} - 75^{\text{th}}$ percentiles ($Q_1 - Q_3$) and min-max bounds.

---

## 📂 Repository Architecture

```
Project/
├── backend/
│   ├── main.py               # REST API & SSE streaming endpoints
│   ├── data_processor.py     # Fuzzy header mapping, cleaning, & feature engineering
│   ├── ml_engine.py          # Isolation Forest, LOF, & OCSVM ensemble + Episodes
│   ├── database.py           # SQLite SQLAlchemy connection
│   ├── models.py             # Session, AnomalyLog, AnomalyEpisode, & ModelConfigLog schemas
│   ├── create_samples.py     # Generator for sample telemetry CSVs
│   ├── tests/                # Unit test suite for ML engine & analytics
│   └── vehicleguard.db       # SQLite database file
├── frontend/
│   ├── src/app/              # Next.js App Router (page.tsx, globals.css)
│   ├── src/components/       # UI Components:
│   │   ├── Dashboard.tsx               # Main Dashboard coordinator with tabs
│   │   ├── AnomalyIntelligence.tsx     # Root-cause analysis & confidence view
│   │   ├── AnomalyEpisodeCard.tsx      # Episode card component
│   │   ├── HistoricalAnalytics.tsx     # KPI summary & 5 Recharts visualizations
│   │   ├── ModelComparison.tsx         # Performance matrix & agreement distribution
│   │   ├── ModelConfiguration.tsx      # Hyperparameter tuning form
│   │   ├── TelemetryChart.tsx          # Dual-channel live telemetry graph
│   │   ├── HealthScore.tsx             # Circular health score gauge
│   │   ├── AnomalyTimeline.tsx         # Real-time event feed
│   │   └── DataUploader.tsx            # CSV ingestion & sample loader
│   └── public/samples/       # Pre-loaded sample datasets for 1-click testing
├── sample_data/              # Sample CSV files for manual uploads
└── README.md                 # Documentation
```

---

## 🔌 API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check endpoint |
| `/api/upload` | `POST` | Ingest CSV, train ML ensemble, group episodes, store in DB |
| `/api/stream/{session_id}` | `GET` | Real-time SSE telemetry event stream |
| `/api/sessions/{session_id}/analytics` | `GET` | Full historical analytics & episode list |
| `/api/sessions/{session_id}/episodes` | `GET` | Grouped anomaly episode list |
| `/api/sessions/{session_id}/models` | `GET` | Model comparison stats & current configuration |
| `/api/sessions/{session_id}/models/retrain` | `POST` | Validate hyperparameters, retrain models, update analytics |

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Unit Tests

```powershell
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run unit tests
python -m unittest discover -s tests

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- API Base: `http://127.0.0.1:8000`
- Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

```powershell
cd frontend

# Install Node dependencies (if needed)
npm install

# Run development server
npm run dev
```
Open `http://localhost:3000` in your browser.
