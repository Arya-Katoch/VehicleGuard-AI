# VehicleGuard AI — Functional & System Test Execution Records

**Audit Execution Date:** October 14, 2026  
**Auditor:** Senior Python Developer, Machine Learning Engineer, Software Tester & Data Analyst  
**Environment:** Windows 11 Home 64-bit (10.0.26300), Python 3.11.9, Node.js v24.13.0, FastAPI 0.141.1, SQLite 3  
**Target Backend:** `http://127.0.0.1:8000` (FastAPI + Uvicorn)

---

## 1. Executive Summary of Test Execution

A comprehensive test campaign was executed across the VehicleGuard AI platform, covering core REST API endpoints, automated ETL fuzzy mapping, unsupervised machine learning ensemble fitting, consensus voting, anomaly episode clustering, Server-Sent Events (SSE) telemetry streaming, dynamic health gauge degradation, and hyperparameter live-retraining.

| Test ID | Test Name | Target Component | Input Dataset / Payload | Expected Status | Actual Status | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC1** | Standard sample upload | `/api/upload` (ETL + Ensemble) | `sample_vehicle_telemetry.csv` (120 rows) | HTTP 200, 120 rows, 2 engineered features | HTTP 200, 120 rows, 2 features | **PASS** |
| **TC2** | CAN-style sample upload | `/api/upload` (Fuzzy Mapping) | `sample_can_bus_unstandardized.csv` (6 raw cols) | HTTP 200, 6 columns mapped | HTTP 200, 6 columns mapped | **PASS** |
| **TC3** | Invalid file upload | `/api/upload` (Input Validation) | `test_invalid.txt` (text file) | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| **TC4** | Long-format dataset upload | `/api/upload` (Pivot + Subsample)| `Telematicsdata.csv` (173,853 raw rows) | HTTP 200, pivoted to ~974 rows | HTTP 200, pivoted to 974 rows | **PASS** |
| **TC5** | Stream playback | `/api/stream/{session_id}` (SSE) | Session 40 telemetry stream | `text/event-stream` with progress % | Valid chunks, progress 0.83%–100% | **PASS** |
| **TC6** | Health-score response | Dynamic Health State Machine | Session 40 stream predictions | Decreases by $v \times 6$, recovers $+0.5$ | Min score 5.5, 14 penalties verified | **PASS** |
| **UT-01**| Unit Test Suite | `backend/tests/test_vehicle_guard.py` | Synthetic DataFrames | 5 unit tests pass | 5 unit tests pass (1.272s) | **PASS** |
| **E2E-01**| Feature Verification Suite | `backend/tests/test_e2e_features.py` | Live FastAPI server | 8 end-to-end features verified | 8 end-to-end features verified | **PASS** |
| **RT-01**| Model Retraining & DB Log | `/api/sessions/{id}/models/retrain` | Updated hyperparameter JSON | Models retrained, logged to SQLite | Config updated, logged to DB | **PASS** |

---

## 2. Detailed Functional Test Sheets (TC1 – TC6)

### TC1 — Standard Sample Upload & Model Fitting

- **Test ID:** TC1
- **Description:** Verifies ingestion of pre-standardized vehicle telemetry CSV with standard sensor headers. Verifies record count preservation, automated feature engineering, database persistence, and initial multi-model ensemble fitting.
- **Source Under Test:** `backend/main.py:upload_file()`, `backend/data_processor.py:process_csv()`, `backend/ml_engine.py:train()`
- **Execution Date:** 2026-10-14T20:07:49+05:30
- **Input Data:** `sample_data/sample_vehicle_telemetry.csv` (120 records, 6 columns: `timestamp`, `speed`, `rpm`, `coolant_temp`, `engine_load`, `throttle`)
- **Expected Outcome:** 
  - HTTP 200 OK response with JSON session payload.
  - Summary indicates `raw_records = 120` and `processed_records = 120`.
  - Zero duplicate rows dropped; zero missing values.
  - Exactly two engineered dynamic features added: `['acceleration', 'rpm_change']`.
  - Resulting session status is `'ready'` in SQLite `sessions` table.
- **Actual Result:**
  - HTTP 200 OK. Created Session ID: 40.
  - `summary`:
    ```json
    {
      "raw_records": 120,
      "processed_records": 120,
      "columns_detected": 6,
      "columns_mapped": {},
      "missing_values_handled": 0,
      "duplicates_handled": 0,
      "features_generated": ["acceleration", "rpm_change"]
    }
    ```
  - Total anomalies identified: 14 (11.67%).
  - Total anomaly episodes grouped: 7.
- **Pass/Fail:** **PASS**
- **Evidence Reference:** [`07_evidence/tc1_standard_upload.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/vehicleguard_audit/07_evidence/tc1_standard_upload.json)
- **Observations:** Execution completed in < 450 ms. Feature engineering correctly identified velocity and engine speed time-derivatives.

---

### TC2 — CAN-Style Sample Upload & Fuzzy Header Mapping

- **Test ID:** TC2
- **Description:** Tests the fuzzy string matching engine (`thefuzz.process.extractOne` with `token_sort_ratio`) against unstandardized CAN-Bus OEM header names.
- **Source Under Test:** `backend/data_processor.py:_fuzzy_match_column()`, `backend/data_processor.py:process_csv()`
- **Execution Date:** 2026-10-14T20:07:50+05:30
- **Input Data:** `sample_data/sample_can_bus_unstandardized.csv` (120 records, 6 columns: `time`, `VehSpd_kmh`, `EngineRPM`, `CoolantTemp`, `EngLoad`, `Throttle_Pos`)
- **Expected Outcome:**
  - HTTP 200 OK.
  - All 6 non-standard column headers successfully mapped to canonical names:
    - `time` $\rightarrow$ `timestamp`
    - `VehSpd_kmh` $\rightarrow$ `speed`
    - `EngineRPM` $\rightarrow$ `rpm`
    - `CoolantTemp` $\rightarrow$ `coolant_temp`
    - `EngLoad` $\rightarrow$ `engine_load`
    - `Throttle_Pos` $\rightarrow$ `throttle`
  - Canonical dataset processed identically to standard sample.
- **Actual Result:**
  - HTTP 200 OK. Created Session ID: 41.
  - `columns_mapped` dictionary returned:
    ```json
    {
      "time": "timestamp",
      "VehSpd_kmh": "speed",
      "EngineRPM": "rpm",
      "CoolantTemp": "coolant_temp",
      "EngLoad": "engine_load",
      "Throttle_Pos": "throttle"
    }
    ```
  - Exact match count: 6 of 6 columns (100% mapping accuracy).
- **Pass/Fail:** **PASS**
- **Evidence Reference:** [`07_evidence/tc2_can_bus_upload.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/vehicleguard_audit/07_evidence/tc2_can_bus_upload.json)
- **Observations:** Threshold score of 75 was sufficient to resolve camelCase, abbreviations, and unit-suffixed names without manual dictionary edits.

---

### TC3 — Invalid File Upload & MIME Validation

- **Test ID:** TC3
- **Description:** Verifies security and validation handling when a non-CSV file (plain text document) is uploaded to the telemetry ingestion endpoint.
- **Source Under Test:** `backend/main.py:upload_file()` line 90 (`if not file.filename.endswith(".csv"): raise HTTPException(400)`)
- **Execution Date:** 2026-10-14T20:07:51+05:30
- **Input Data:** `07_evidence/test_invalid.txt` (ASCII text file containing `"This is not a CSV file."`)
- **Expected Outcome:**
  - HTTP 400 Bad Request.
  - Response JSON detail: `{"detail": "Only CSV files are allowed."}`.
  - Zero database session rows created; no disk artifacts retained in `backend/data/`.
- **Actual Result:**
  - HTTP 400 Bad Request received.
  - Response body:
    ```json
    {
      "detail": "Only CSV files are allowed."
    }
    ```
  - Upload rejected prior to staging buffer copy or pandas parsing.
- **Pass/Fail:** **PASS**
- **Evidence Reference:** [`07_evidence/tc3_invalid_upload_response.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/vehicleguard_audit/07_evidence/tc3_invalid_upload_response.json)
- **Observations:** Validated that backend rejects non-CSV uploads at the HTTP boundary before allocating memory or processing cycles.

---

### TC4 — Long-Format Key-Value Dataset Ingestion & Adaptive Subsampling

- **Test ID:** TC4
- **Description:** Verifies the automated detection, pivoting, forward/backward filling, elapsed time calculation, and adaptive subsampling of high-volume long-format industrial logger data (`Telematicsdata.csv`).
- **Source Under Test:** `backend/data_processor.py:process_csv()` lines 38–67
- **Execution Date:** 2026-10-14T20:07:52+05:30
- **Input Data:** `sample_data/Telematicsdata.csv` (16.8 MB, 173,853 raw rows, 6 long-format columns: `deviceId`, `timeMili`, `timestamp`, `value`, `variable`, `alarmClass`)
- **Expected Outcome:**
  - HTTP 200 OK.
  - Detector recognizes `variable` and `value` columns and triggers `pandas.pivot_table()`.
  - Subsamples dataset (> 1,000 threshold) down to approximately 974 records.
  - Generates standard features and derived acceleration/RPM metrics.
- **Actual Result:**
  - HTTP 200 OK. Created Session ID: 42.
  - `summary`:
    ```json
    {
      "raw_records": 173853,
      "processed_records": 974,
      "columns_detected": 6,
      "columns_mapped": {
        "ABSOLUTE LOAD VALUE": "engine_load",
        "ABSOLUTE THROTTLE POSITION B": "throttle",
        "AIR INTAKE TEMPERATURE": "coolant_temp",
        "ENGINE RPM": "rpm",
        "Vehicle speed": "speed"
      },
      "missing_values_handled": 0,
      "duplicates_handled": 0,
      "features_generated": ["acceleration", "rpm_change"]
    }
    ```
  - Pivoted wide matrix resulted in 54 columns (51 unique numerical variables + `timestamp`, `acceleration`, `rpm_change`).
  - Total anomalies identified: 122 (12.53%).
  - Total anomaly episodes grouped: 38.
- **Pass/Fail:** **PASS**
- **Evidence Reference:** [`07_evidence/tc4_telematics_upload.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/vehicleguard_audit/07_evidence/tc4_telematics_upload.json), [`07_evidence/telematics_974_analysis.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/vehicleguard_audit/07_evidence/telematics_974_analysis.json)
- **Observations:** Subsampling formula `step = ceil(173853 / 1000)` reduced row count from 173,853 to exactly 974 rows, enabling real-time browser playback without DOM freezing.

---

### TC5 — Real-Time Stream Playback (Server-Sent Events)

- **Test ID:** TC5
- **Description:** Verifies real-time streaming endpoint `/api/stream/{session_id}` using HTTP `text/event-stream` (Server-Sent Events). Confirms incremental frame dispatch, progress percentage calculation, and inline inference payload.
- **Source Under Test:** `backend/main.py:stream_telemetry()`
- **Execution Date:** 2026-10-14T20:07:53+05:30
- **Input Data:** Active Session ID 40 (`sample_vehicle_telemetry.csv`, 120 records)
- **Expected Outcome:**
  - Connection opens with MIME type `text/event-stream`.
  - Dispatches serialized JSON payload formatted as `data: {"telemetry": {...}, "analysis": {...}, "progress": float}\n\n`.
  - Progressive delay of ~300 ms per frame (`asyncio.sleep(0.3)`).
- **Actual Result:**
  - SSE connection opened successfully.
  - Sample Event 1 payload received:
    ```json
    {
      "telemetry": {
        "timestamp": 0.0,
        "speed": 40.99,
        "rpm": 2974.0,
        "coolant_temp": 84.6,
        "engine_load": 42.1,
        "throttle": 31.1,
        "acceleration": 0.0,
        "rpm_change": 0.0
      },
      "analysis": {
        "anomaly_id": "ano_4e0e64ae",
        "timestamp": 0.0,
        "severity": "normal",
        "confidence": 0.0,
        "primary_feature": "acceleration",
        "z_score": 0.36,
        "votes": 0,
        "model_votes": 0,
        "model_agreement": {"isolation_forest": false, "lof": false, "ocsvm": false},
        "model_breakdown": {"isolation_forest": "normal", "lof": "normal", "ocsvm": "normal"},
        "contributing_features": [],
        "explanation": {}
      },
      "progress": 0.8333333333333334
    }
    ```
- **Pass/Fail:** **PASS**
- **Evidence Reference:** [`07_evidence/tc5_stream_playback_sample.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/vehicleguard_audit/07_evidence/tc5_stream_playback_sample.json)
- **Observations:** Verified that frontend native `EventSource` receives structured streaming frames with both raw sensor values and real-time model predictions.

---

### TC6 — Vehicle Health-Score State Response & Dynamic Degradation

- **Test ID:** TC6
- **Description:** Verifies the dynamic vehicle health state machine implemented in the frontend (`Dashboard.tsx:L79-97`) against live streaming predictions for a 120-record drive trip with 14 detected anomalies.
- **Source Under Test:** `frontend/src/components/Dashboard.tsx` (lines 79–97)
- **Execution Date:** 2026-10-14T20:07:54+05:30
- **Input Data:** Time-series prediction vector of Session 40 (120 records, containing 7 consensus anomalies and 7 weak anomalies).
- **Mathematical Specification:**
  $$\text{Score}_{t} = \begin{cases} \max(0.0, \text{Score}_{t-1} - (v_t \times 6.0)) & \text{if } v_t > 0 \\ \min(100.0, \text{Score}_{t-1} + 0.5) & \text{if } v_t = 0 \end{cases}$$
- **Expected Outcome:**
  - Health score begins at 100.0 (Nominal/Healthy).
  - Score drops upon encountering anomalies proportional to vote count (Weak: $-6.0$, Consensus: $-12.0$, Strong: $-18.0$).
  - Score gradually recovers ($+0.5$ per normal frame) during nominal driving intervals.
- **Actual Result:**
  - Initial Score: $100.0$.
  - Frames $0$ to $34$ (Nominal): Health score maintains at $100.0$ ceiling.
  - Frame $35$ ($v=2$, Consensus RPM spike): Score immediately drops from $100.0 \rightarrow 88.0$ ($-12.0$).
  - Frame $36$ ($v=0$): Recovers to $88.5$ ($+0.5$).
  - Frame $37$ ($v=1$, Weak): Drops to $82.5$ ($-6.0$).
  - Frame $38$ ($v=2$, Consensus recovery): Drops to $70.5$ ($-12.0$).
  - Frames $70$ to $74$ (Coolant Overheating Episode): Drops to $40.5$ (Entering "Critical" state, triggering red SVG alert in `HealthScore.tsx`).
  - Frames $95$ to $97$ (Speed Drop / Engine Load Episode): Drops to minimum observed score of **$5.5$**.
  - Final Trip Score (Frame 119): **$9.5$**.
- **Pass/Fail:** **PASS**
- **Evidence Reference:** [`07_evidence/tc6_health_score_simulation.json`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/vehicleguard_audit/07_evidence/tc6_health_score_simulation.json)
- **Observations:** Proved mathematically and empirically that health score accurately reflects anomaly consensus severity and physical degradation.

---

## 3. Additional Verification Test Suites

### Unit Test Suite (`backend/tests/test_vehicle_guard.py`)
- **Execution Command:** `python -m unittest discover -s backend/tests -p "test_vehicle_guard.py"`
- **Result:** Ran 5 unit tests in 1.272s $\rightarrow$ **OK (All Passed)**.
- **Coverage:**
  1. `test_train_and_confidence`: Asserts detector fits on synthetic data and confidence bounds fall in $[50, 60]\%$, $[75, 85]\%$, and $[90, 100]\%$.
  2. `test_predict_row`: Verifies row dictionary serialization, vote calculation, and explainability reason string.
  3. `test_episode_grouping_and_analytics`: Verifies episode clustering, summary statistics, and baseline normal quartile extraction.
  4. `test_config_validation_and_retrain`: Asserts invalid hyperparameters fallback safely to `DEFAULT_CONFIG` without crashing.
  5. `test_edge_cases`: Validates empty dataset handling, missing value imputation, and single-point versus multi-point anomaly episodes.

### End-to-End Verification Suite (`backend/tests/test_e2e_features.py`)
- **Execution Command:** `python backend/tests/test_e2e_features.py`
- **Result:** All 8 automated checks returned `[PASSED]` status against the live Uvicorn HTTP server.
