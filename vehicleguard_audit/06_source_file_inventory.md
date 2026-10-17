# VehicleGuard AI — Codebase & Source File Inventory

**Audit Date:** October 14, 2026  
**Auditor:** Senior Python Developer, Machine Learning Engineer, Software Tester & Data Analyst  
**Total Source Files Inspected:** 28 files across Backend, Frontend, Data, and Documentation  

---

## 1. Backend Modules & Configuration

| File Path | Component / Layer | Primary Functions / Classes | Specific Information Contributed to Audit |
| :--- | :--- | :--- | :--- |
| [`backend/main.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/main.py) | REST API & Stream Layer | `upload_file()`, `stream_telemetry()`, `retrain_session_models()`, `get_session_analytics()`, `health_check()`, `_get_or_restore_session_data()` | Extracted all 9 API endpoints, HTTP status codes, request schemas, SSE playback delay ($300$ ms), and disk restoration logic. |
| [`backend/data_processor.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/data_processor.py) | Ingestion & ETL Engine | `DataProcessor`, `process_csv()`, `_fuzzy_match_column()` | Extracted canonical feature dictionary, fuzzy matching algorithm (`token_sort_ratio`, threshold 75), key-value pivoting, subsampling rule ($>1000$ rows), median imputation, and acceleration/RPM derivation formulas. |
| [`backend/ml_engine.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/ml_engine.py) | Machine Learning Core | `AnomalyDetector`, `DEFAULT_CONFIG`, `validate_config()`, `train()`, `calculate_confidence()`, `predict_row()`, `analyze_dataset()`, `_build_episode()` | Extracted hyperparameter configurations, bounds validation, StandardScaler scaling, tri-model consensus voting, deterministic confidence formula, feature contribution weighting, and episode clustering algorithm. |
| [`backend/models.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/models.py) | Persistence & ORM | `Session`, `AnomalyLog`, `AnomalyEpisode`, `ModelConfigLog` | Extracted database schema definitions, primary keys, JSON column structures, and verified lack of database-enforced foreign key constraints. |
| [`backend/database.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/database.py) | Database Connection | `engine`, `SessionLocal`, `Base`, `get_db()` | Extracted SQLite database connection URL (`sqlite:///./vehicleguard.db`) and session dependency injection. |
| [`backend/create_samples.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/create_samples.py) | Data Generator | `generate_sample_data()` | Extracted ground truth formulas and injected fault locations: RPM spike (35–37), Coolant overheating (70–74), and Speed drop / Load surge (95–96). |
| [`backend/vehicleguard.db`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/vehicleguard.db) | SQLite Database File | 4 tables: `sessions` (38), `anomaly_logs` (1294), `anomaly_episodes` (825), `model_config_logs` (5) | Extracted historical production runs, verified schema alignment, and audited empirical hyperparameter tuning records. |
| [`backend/tests/test_vehicle_guard.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/tests/test_vehicle_guard.py) | Automated Unit Testing | `TestVehicleGuardEngine` (5 test methods) | Extracted test coverage for model training, confidence boundaries, row prediction, episode clustering, and configuration validation. |
| [`backend/tests/test_e2e_features.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/tests/test_e2e_features.py) | Integration Testing | `run_e2e_tests()`, `log_test()` | Extracted end-to-end verification protocol for health check, data ingestion, SSE playback, analytics retrieval, and live model retraining. |

---

## 2. Frontend Components & User Interface

| File Path | Component / Layer | Primary Role | Specific Information Contributed to Audit |
| :--- | :--- | :--- | :--- |
| [`frontend/src/app/page.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/app/page.tsx) | Page Orchestrator | 3-step state controller (`upload` $\rightarrow$ `summary` $\rightarrow$ `dashboard`) | Extracted workflow state transitions, header navigation, and component conditional mounting. |
| [`frontend/src/components/Dashboard.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/Dashboard.tsx) | Master Dashboard | 4-tab coordinator & EventSource listener | Extracted SSE streaming listener, 60-frame sliding chart buffer, and the exact dynamic vehicle health score mathematical state machine. |
| [`frontend/src/components/HealthScore.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/HealthScore.tsx) | Health Visualization | Circular SVG gauge | Extracted vehicle health color thresholds: Critical ($<50$, red), Warning ($50-79$, amber), and Healthy ($\ge 80$, green). |
| [`frontend/src/components/AnomalyTimeline.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/AnomalyTimeline.tsx) | Real-time Feed | Live event cards | Extracted severity labeling, reverse-chronological event sorting, and individual model vote badges (IF, LOF, SVM). |
| [`frontend/src/components/AnomalyIntelligence.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/AnomalyIntelligence.tsx) | Root-Cause Analysis | Anomaly deep dive & explanations | Extracted relative feature contribution percentage bars, confidence meter color scaling, and natural-language explanation container. |
| [`frontend/src/components/AnomalyEpisodeCard.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/AnomalyEpisodeCard.tsx) | Episode Cards | Grouped incident viewer | Extracted peak metric display against baseline normal interquartile ranges ($Q_1$ to $Q_3$), start/end duration, and severity tagging. |
| [`frontend/src/components/HistoricalAnalytics.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/HistoricalAnalytics.tsx) | Analytical Visualizations | 5 Recharts graphs + KPI cards | Extracted 5 chart specifications: Timeline Area Chart, Severity Pie Chart, Affected Features Bar Chart, Agreement Matrix, and Z-Score Scatter/Area. |
| [`frontend/src/components/ModelComparison.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/ModelComparison.tsx) | Model Benchmarking | Comparison matrix | Extracted side-by-side performance table metrics (Anomalies, Normal, Consensus Agreement %, Latency ms) and consensus intersection cards. |
| [`frontend/src/components/ModelConfiguration.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/ModelConfiguration.tsx) | Live Retraining | Parameter tuning panel | Extracted client-side input boundaries: `n_estimators` [10–1000], `contamination` [0.001–0.5], `n_neighbors` [2–200], and kernel dropdowns. |
| [`frontend/src/components/TelemetryChart.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/TelemetryChart.tsx) | Real-time Line Graph | Dual-channel line chart | Extracted dual-axis configuration (`speed` + `rpm`, `engine_load` + `coolant_temp`) and dynamic key fallback handling. |
| [`frontend/src/components/DataUploader.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/DataUploader.tsx) | File Ingestion Dropzone | Drag & drop + Sample loader | Extracted file extension validation (`.csv`), multipart upload packaging, and 1-click sample dataset triggers. |
| [`frontend/src/components/DataTransformationSummary.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/DataTransformationSummary.tsx) | ETL Review Panel | Mapping & cleaning stats | Extracted visual transformation feedback cards: raw vs processed record counts, missing value imputation stats, and column mapping list. |
| [`frontend/package.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/package.json) | Dependency Config | Node package manifest | Extracted frontend framework versions: Next.js 16.3.5, React 19.2.8, Recharts 3.10.1, Axios 1.20.0, Lucide-React 1.47.0. |

---

## 3. Data Files & Datasets

| File Path | Format / Size | Description & Schema | Specific Information Contributed to Audit |
| :--- | :--- | :--- | :--- |
| [`sample_data/sample_vehicle_telemetry.csv`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/sample_data/sample_vehicle_telemetry.csv) | CSV (3.8 KB, 120 rows) | Canonical wide format: `timestamp`, `speed`, `rpm`, `coolant_temp`, `engine_load`, `throttle` | Served as input for TC1, synthetic baseline evaluation, per-model agreement distributions, and injected fault ground truth testing. |
| [`sample_data/sample_can_bus_unstandardized.csv`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/sample_data/sample_can_bus_unstandardized.csv) | CSV (3.8 KB, 120 rows) | Non-standard CAN format: `time`, `VehSpd_kmh`, `EngineRPM`, `CoolantTemp`, `EngLoad`, `Throttle_Pos` | Served as input for TC2, verifying 100% fuzzy column mapping capability. |
| [`sample_data/Telematicsdata.csv`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/sample_data/Telematicsdata.csv) | CSV (16.8 MB, 173,853 rows) | Industrial long format: `deviceId`, `timeMili`, `timestamp`, `value`, `variable`, `alarmClass` | Served as input for TC4, verifying pivoting, subsampling (to 974 rows), 54-column matrix creation, and high-volume anomaly detection. |

---

## 4. Documentation & Research Artifacts

| File Path | Document Type | Key Content | Specific Information Contributed to Audit |
| :--- | :--- | :--- | :--- |
| [`PROJECT_DOCUMENTATION.md`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/PROJECT_DOCUMENTATION.md) | Capstone Defense Guide | 11 comprehensive chapters: Elevator pitch, problem statement, architecture, ensemble theory, formulas, database, frontend, presentation script, viva Q&A | Provided author-documented formulations, theoretical background, design rationale, and expected model behaviors. |
| [`README.md`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/README.md) | Repository Overview | Architecture flowchart, mathematical confidence formulation, API reference, quick-start setup | Corroborated formulas, endpoint paths, and project features. |
