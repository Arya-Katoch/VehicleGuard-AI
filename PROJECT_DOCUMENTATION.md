# VehicleGuard AI: Complete Project Documentation & Defense Guide 🚗⚡
**Bachelor of Engineering in Computer Science & Engineering (B.E. CSE)**
**Final Year Capstone Project / Research Paper Documentation**

---

## 📑 Table of Contents
1. [Executive Summary (The 60-Second Elevator Pitch)](#1-executive-summary-the-60-second-elevator-pitch)
2. [Problem Statement & Research Motivation](#2-problem-statement--research-motivation)
3. [System Architecture & End-to-End Pipeline](#3-system-architecture--end-to-end-pipeline)
4. [The Machine Learning Ensemble (Deep-Dive)](#4-the-machine-learning-ensemble-deep-dive)
5. [Novel Formulations & Mathematical Algorithms](#5-novel-formulations--mathematical-algorithms)
6. [Data Ingestion, Cleaning & Feature Engineering](#6-data-ingestion-cleaning--feature-engineering)
7. [Database Schema & Persistence Layer](#7-database-schema--persistence-layer)
8. [Frontend Dashboard & Component Architecture](#8-frontend-dashboard--component-architecture)
9. [Step-by-Step Live Presentation Script](#9-step-by-step-live-presentation-script)
10. [Viva / Examiner Q&A Cheat Sheet (Tough Questions & Model Answers)](#10-viva--examiner-qa-cheat-sheet)
11. [Project File Map & Codebase Reference](#11-project-file-map--codebase-reference)

---

## 1. Executive Summary (The 60-Second Elevator Pitch)

> **What to say if an examiner asks: "Tell me about your project in 1 minute."**

*"VehicleGuard AI is a real-time, unsupervised multi-model vehicle telemetry anomaly detection and root-cause intelligence platform. Modern connected vehicles generate thousands of CAN-Bus and OBD-II signals per second, but real-world telemetry is unlabeled, noisy, and differs in sensor naming across manufacturers.*

*To solve this without needing expensive labeled datasets, I developed an end-to-end full-stack system that:*
1. *Uses fuzzy string matching to automatically standardize disparate telemetry formats.*
2. *Deploys an ensemble of three distinct unsupervised ML models—**Isolation Forest**, **Local Outlier Factor (LOF)**, and **One-Class SVM**—to detect mechanical, thermal, and sensor faults.*
3. *Combines model predictions using a **Consensus Voting Matrix** (Weak, Consensus, Strong) and a deterministic confidence scoring algorithm.*
4. *Performs **Root-Cause Analysis** by computing relative feature contribution weights and generating natural-language diagnostic explanations.*
5. *Groups consecutive anomalies into **Incident Episodes** with baseline quartile comparisons.*
6. *Provides an interactive Next.js dashboard featuring live Server-Sent Events (SSE) telemetry playback, 5 analytical Recharts visualizations, and a live ML hyperparameter retraining center.*

---

## 2. Problem Statement & Research Motivation

### The Challenge with Modern Vehicles
- Modern automobiles feature dozens of Electronic Control Units (ECUs) communicating over the **Controller Area Network (CAN-Bus)** and diagnostics via **OBD-II (On-Board Diagnostics)**.
- **Problem 1: Lack of Ground Truth Labels:** Vehicles in the field rarely produce labeled fault datasets. Supervised learning cannot reliably detect zero-day or unexpected mechanical failures.
- **Problem 2: Format Discrepancies:** Different OEMs use different naming conventions (e.g., `vehspd`, `Speed`, `velocity`, `Vehicle Speed (km/h)`), making rigid parsers fail.
- **Problem 3: The "Black Box" Problem:** Even when an anomaly is detected, mechanics and fleet managers need to know *which sensor caused it*, *why*, and *how confident the system is*.
- **Problem 4: Isolated Anomaly Noise:** A single noisy sensor spike is not necessarily a breakdown. Real breakdowns occur as continuous **episodes** over time.

### VehicleGuard AI's Proposed Solutions
- **Tri-Model Ensemble**: Unsupervised detection combining tree-based partitioning (Isolation Forest), density-based clustering (LOF), and boundary-based kernel margin estimation (One-Class SVM).
- **Fuzzy Ingestion Pipeline**: Automates standardizing arbitrary telemetry headers using token sort Levenshtein ratios.
- **Deterministic Confidence & Root Cause**: Quantifies confidence (0% to 100%) and breaks down the exact percentage contribution of each telemetry parameter.
- **Episode Windowing**: Groups consecutive anomalous records into unified diagnostic episodes with start/end duration and peak deviation metrics.

---

## 3. System Architecture & End-to-End Pipeline

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    Raw Telemetry CSV                        │
  │            (CAN-Bus / OBD-II / Telematics Logs)             │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │             1. Data Ingestion & ETL Engine                  │
  │   - Key-Value long-format log pivoting (pivot_table)        │
  │   - Fuzzy header mapping (Levenshtein token sort ratio)     │
  │   - Median imputation & duplicate removal                   │
  │   - Feature engineering (Acceleration Δspd, RPM Change Δrpm)│
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              2. Feature Scaling & Normalization             │
  │   - StandardScaler: Z = (X - μ) / σ                         │
  │   - Precomputes baseline IQR (Q1, Q3, Min, Max, Median)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │             3. Multi-Model ML Ensemble Training             │
  │  ┌──────────────────┬─────────────────┬──────────────────┐  │
  │  │ Isolation Forest │  LOF Detector   │  One-Class SVM   │  │
  │  │ (Tree-Partition) │ (Local Density) │  (RBF Boundary)  │  │
  │  └────────┬─────────┴────────┬────────┴────────┬─────────┘  │
  └───────────┼──────────────────┼─────────────────┼────────────┘
              └──────────────────┼─────────────────┘
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │           4. Consensus Voting & Intelligence Engine         │
  │   - Consensus Voting: 0 (Normal), 1 (Weak),                 │
  │     2 (Consensus), 3 (Strong)                               │
  │   - Deterministic Confidence % (Base + Z-score bonus)       │
  │   - Relative Feature Contribution Weights (w_i %)           │
  │   - Dynamic Natural Language Diagnostic Explanation         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │               5. Episode Grouping Algorithm                 │
  │   - Groups consecutive anomalies within 2-frame gap         │
  │   - Computes duration, peak metrics, and baseline IQR bounds│
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
  ┌──────────────────────────────┐ ┌───────────────────────────┐
  │   SQLite DB (vehicleguard.db)│ │    FastAPI Streaming      │
  │   - Sessions & Summary JSON  │ │    (SSE: /api/stream)     │
  │   - Anomaly Episodes & Logs  │ │    Event-by-Event Stream  │
  │   - Model Config & Retrain   │ └─────────────┬─────────────┘
  └──────────────────────────────┘               │
                                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 Next.js 15 Client Dashboard                 │
  │  - Live Telemetry Chart (Dual-channel 60-frame buffer)      │
  │  - Circular Vehicle Health Gauge (Dynamic score)            │
  │  - Anomaly Intelligence & Explanations                      │
  │  - Anomaly Episode Cards with Baseline Quartile Comparison  │
  │  - 5 Historical Recharts Analytical Visualizations          │
  │  - ML Model Comparison & Hyperparameter Retraining Center   │
  └─────────────────────────────────────────────────────────────┘
```

---

## 4. The Machine Learning Ensemble (Deep-Dive)

Why use three different models instead of just one? **Because each algorithm looks at data through an entirely different mathematical lens.**

| Algorithm | Mathematical Basis | Primary Strength | Weakness if Used Alone |
| :--- | :--- | :--- | :--- |
| **Isolation Forest (iForest)** | Binary Decision Trees (Path Length) | Extremely fast; detects global outliers with extreme values | Can miss subtle local anomalies hidden in dense clusters |
| **Local Outlier Factor (LOF)** | $k$-Nearest Neighbors & Local Reachability Density | Detects local outliers whose density is low relative to their neighbors | Computationally heavier on large datasets |
| **One-Class SVM (OC-SVM)** | RBF Kernel Hyperplane Boundary | Finds non-linear geometric envelopes around normal operating data | Sensitive to hyperparameter $\nu$ and kernel scale |

### 1. Isolation Forest
- **Theory:** Normal points require many random splits to isolate in a tree. Outliers are isolated near the root of the tree with very short path lengths $h(x)$.
- **Default Hyperparameters:**
  - `n_estimators`: `200` (number of isolation trees in ensemble)
  - `contamination`: `0.05` (assumed 5% prior outlier proportion)
  - `random_state`: `42` (ensures reproducible splits)

### 2. Local Outlier Factor (LOF)
- **Theory:** Measures the ratio of local reachability density of point $p$ to the average local reachability density of its $k$ nearest neighbors:
  $$\text{LOF}_k(p) = \frac{\sum_{o \in N_k(p)} \frac{\text{lrd}(o)}{\text{lrd}(p)}}{|N_k(p)|}$$
  If $\text{LOF} \approx 1$, the point is within a homogeneous cluster. If $\text{LOF} > 1$, it is an anomaly.
- **Default Hyperparameters:**
  - `n_neighbors`: `20`
  - `contamination`: `0.05`
  - `metric`: `minkowski` (Euclidean distance)
  - `novelty`: `True` (enables inductive `predict()` on new streaming frames)

### 3. One-Class SVM (Support Vector Machine)
- **Theory:** Maps normalized feature vectors $\Phi(x)$ into an infinite-dimensional feature space using the Radial Basis Function (RBF) kernel:
  $$K(x, x') = \exp\left(-\gamma \|x - x'\|^2\right)$$
  It constructs a maximal margin hyperplane separating normal telemetry vectors from the coordinate origin.
- **Default Hyperparameters:**
  - `kernel`: `rbf`
  - `nu`: `0.05` (upper bound on training errors / outlier fraction)
  - `gamma`: `scale` ($1 / (n\_features \times \text{Var}(X))$)

---

## 5. Novel Formulations & Mathematical Algorithms

### 1. Consensus Voting Matrix
Each model outputs $y_m \in \{1 \text{ (Normal)}, -1 \text{ (Anomaly)}\}$.
Let $v = \sum_{m \in \{\text{iForest}, \text{LOF}, \text{OCSVM}\}} \mathbb{I}(y_m = -1)$ be the total anomaly votes ($v \in [0, 3]$).

- **$v = 0$ (Normal):** All models agree telemetry is nominal.
- **$v = 1$ (Weak Anomaly):** Single model trigger; likely sensor noise or minor edge condition.
- **$v = 2$ (Consensus Anomaly):** Two models agree; genuine telemetry deviation.
- **$v = 3$ (Strong Anomaly):** Unanimous agreement across all 3 distinct algorithms; severe system fault.

### 2. Deterministic Anomaly Confidence Score
Confidence cannot simply be arbitrary. VehicleGuard AI uses a two-tier formula combining model consensus with statistical Z-score deviation:

$$\text{Base Confidence} = \begin{cases} 
0.0\% & \text{if } v = 0 \\ 
50.0\% & \text{if } v = 1 \text{ (Weak)} \\ 
75.0\% & \text{if } v = 2 \text{ (Consensus)} \\ 
90.0\% & \text{if } v = 3 \text{ (Strong)} 
\end{cases}$$

$$\text{Z-Score Bonus} = \min\left(10.0, \max\left(0.0, (z_{\max} - 2.0) \times 3.0\right)\right)$$

$$\text{Total Confidence} = \min\left(100.0, \text{Base Confidence} + \text{Z-Score Bonus}\right)$$

*Example:* If all 3 models flag an anomaly ($90\%$) and the coolant temperature has a Z-score of $4.5$, the bonus is $\min(10.0, (4.5 - 2.0) \times 3.0) = \min(10.0, 7.5) = 7.5\%$. Total confidence = $90\% + 7.5\% = \mathbf{97.5\%}$.

### 3. Feature Contribution Weighting (Root-Cause Analysis)
When an anomaly occurs at vector $X = [z_1, z_2, \dots, z_n]$, the relative contribution of feature $i$ is calculated by:

$$w_i = \left( \frac{|z_i|}{\sum_{j=1}^{n} |z_j|} \right) \times 100\%$$

The UI renders this as a relative percentage bar (e.g., `coolant_temp: 58.2%`, `rpm: 24.1%`, `engine_load: 17.7%`), instantly identifying the primary offender to the technician.

### 4. Dynamic Diagnostic Text Explanation Generation
Rather than outputting raw numbers, the engine generates dynamic natural language diagnostics:
> *"Coolant Temp (value: 114.2 °C) significantly deviated from normal baseline (z-score: 4.12) and was classified as anomalous by 3 of 3 models (Isolation Forest, LOF, One-Class SVM)."*

### 5. Anomaly Episode Windowing Algorithm
Consecutive anomalous records $r_1, r_2, \dots, r_k$ occurring within a tolerance window ($\le 2$ normal frames between them) are clustered into an `AnomalyEpisode`:
- **Start Time / End Time / Duration:** $T_{\text{end}} - T_{\text{start}}$ (seconds)
- **Peak Metrics:** $\max_{r \in \text{episode}} (x_f)$ for all affected features.
- **Baseline Quartiles:** Extracted from the entire trip's $25^{\text{th}}$ percentile ($Q_1$), $75^{\text{th}}$ percentile ($Q_3$), and median.

---

## 6. Data Ingestion, Cleaning & Feature Engineering

Handled inside `backend/data_processor.py`:

1. **Long-Format Key-Value Pivoting:**
   Industrial loggers (like `Telematicsdata.csv`) record data in 3 columns: `timestamp`, `variable`, `value`. The processor automatically detects this format and pivots it into a tidy time-series matrix using `pandas.pivot_table()`.
2. **Fuzzy Sensor Mapping:**
   Using `thefuzz` with a threshold score of 75/100:
   - `speed`: `['speed', 'vehspd', 'velocity', 'kmh', 'mph', 'vehicle_speed']`
   - `rpm`: `['rpm', 'engine_speed', 'enginerpm', 'engine_rpm']`
   - `engine_load`: `['load', 'engine_load', 'engload', 'calculated engine load']`
   - `coolant_temp`: `['coolant', 'temp', 'temperature', 'ect', 'ambient air temperature']`
   - `throttle`: `['throttle', 'pedal', 'accel_pos', 'throttle_pos']`
3. **Median Imputation:** Missing numerical values are filled with the column median (preserving distribution without introducing zero-biases).
4. **Duplicate Removal:** Exact duplicate rows are dropped.
5. **Feature Engineering:**
   - $\text{Acceleration} = \frac{\Delta \text{Speed}}{\Delta t}$ (detects harsh braking and sudden acceleration).
   - $\text{RPM Change} = \frac{\Delta \text{RPM}}{\Delta t}$ (detects engine surges, transmission slippage, or misfires).
6. **Adaptive Subsampling:** If the dataset exceeds 1,000 rows, it is downsampled evenly so real-time streaming playback remains fluid.

---

## 7. Database Schema & Persistence Layer

Built with **SQLAlchemy ORM** and stored in a lightweight, zero-configuration **SQLite** database (`backend/vehicleguard.db`):

- **`Session` (`sessions` table):**
  Stores trip ID, original filename, upload timestamp, processing status, and the JSON transformation summary (rows cleaned, columns mapped, features generated).
- **`AnomalyLog` (`anomaly_logs` table):**
  Stores individual telemetry events flagged during streaming playback (timestamp, severity, explainability JSON).
- **`AnomalyEpisode` (`anomaly_episodes` table):**
  Stores grouped incident episodes (episode number, start/end time, duration in seconds, record count, severity, peak confidence, affected features list, and baseline IQR ranges).
- **`ModelConfigLog` (`model_config_logs` table):**
  Records every hyperparameter tuning event with timestamps, configuration JSON, and the resulting performance metrics (runtimes, consensus agreement %).

---

## 8. Frontend Dashboard & Component Architecture

Built with **Next.js 15 (App Router)** and **TypeScript**, styled using clean, modern **CSS Modules**:

```
frontend/src/
├── app/
│   ├── layout.tsx                # App shell, fonts, metadata
│   ├── page.tsx                  # 3-step state orchestrator (Upload -> Summary -> Dashboard)
│   ├── page.module.css           # Modern dark-mode styling
│   └── globals.css               # Global theme variables & typography
└── components/
    ├── DataUploader.tsx          # Drag & drop CSV dropzone + 1-click sample data buttons
    ├── DataTransformationSummary.tsx # Visual cards showing fuzzy mapping & cleaning stats
    ├── Dashboard.tsx             # Master tab controller & SSE EventSource listener
    ├── TelemetryChart.tsx        # Dual-axis real-time chart (Recharts) with sliding 60-frame buffer
    ├── HealthScore.tsx           # Circular SVG gauge (100% down to 0% with dynamic color change)
    ├── AnomalyTimeline.tsx       # Live reverse-chronological event feed with severity tags
    ├── AnomalyIntelligence.tsx   # Root-cause breakdown, confidence %, and episode listing
    ├── AnomalyEpisodeCard.tsx    # Collapsible episode card with peak vs baseline normal comparison
    ├── HistoricalAnalytics.tsx   # 5 Recharts visualizations + KPI summary cards
    ├── ModelComparison.tsx       # 3-model performance comparison matrix & agreement breakdown
    └── ModelConfiguration.tsx    # Interactive hyperparameter sliders & "Retrain Models" action
```

### The 4 Dashboard Tabs:
1. **Live Telemetry & Event Feed:** Real-time stream playback, dynamic health gauge, multi-sensor dual-line chart, live event cards.
2. **Anomaly Intelligence & Episodes:** Deep dive into each detected anomaly, relative feature impact bars, natural-language explanation, and grouped Anomaly Episodes.
3. **Historical Analytics:** 5 Recharts graphs:
   - *Anomalies Over Time & Confidence Curve* (Dual-axis Line/Area)
   - *Anomaly Severity Distribution* (Pie Chart)
   - *Most Affected Features* (Horizontal Bar Chart)
   - *Model Agreement Matrix* (Consensus Intersection Chart)
   - *Peak Z-Score Deviation Trend* (Scatter/Line)
4. **ML Models & Configuration:** Side-by-side metric comparison (Anomalies detected, Normal records, Consensus Agreement %, Fit Runtime in ms) + live hyperparameter tuning form with boundary validation.

---

## 9. Step-by-Step Live Presentation Script

Use this exact walkthrough during your presentation or viva demonstration:

### Step 1: Launch the Application
- Open two terminals in VS Code:
  - Terminal 1: `cd backend; .\venv\Scripts\python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`
  - Terminal 2: `cd frontend; npm run dev`
- Open the browser at `http://localhost:3000`.

### Step 2: Ingestion & Fuzzy Mapping
- **Say:** *"I begin by uploading raw vehicle telemetry. In real-world telematics, data files often have inconsistent column headers or missing values."*
- Click on one of the pre-loaded sample datasets (e.g., **"CAN-Bus Unstandardized Telemetry"**).
- Point to the **Data Transformation Summary** screen:
  - *"Notice how the system used fuzzy string matching to map non-standard column names like `vehspd` to `speed` and `engload` to `engine_load`.*
  - *"It also engineered two dynamic features: Acceleration and RPM Change."*
- Click **"Launch Real-Time Telemetry Stream"**.

### Step 3: Real-Time Stream & Vehicle Health
- Point to the **Live Monitoring** tab:
  - *"As the telemetry records stream in via Server-Sent Events (SSE), the circular health gauge dynamically calculates the vehicle's health status.*
  - *When normal records stream in, the health score recovers. When an anomaly occurs, it deducts points proportional to model consensus severity.*
  - *The dual-axis chart renders real-time speed and RPM variations over a sliding 60-frame buffer."*

### Step 4: Anomaly Intelligence & Root Cause
- Click on the **Anomaly Intelligence** tab:
  - *"Unlike traditional black-box anomaly detectors, VehicleGuard AI explains its decisions.*
  - *Here, we can see the exact Confidence Percentage, calculated deterministically from model consensus and Z-score deviation.*
  - *The feature impact bar chart indicates that `coolant_temp` contributed 62% of the deviation.*
  - *Below it, the system grouped consecutive anomalies into **Incident Episodes**, showing episode duration, peak temperature reached, and the vehicle's normal baseline interquartile range."*

### Step 5: Historical Analytics
- Click on the **Historical Analytics** tab:
  - *"Here are 5 comprehensive visualizations showing the aggregate behavior of the drive trip: severity distribution, anomaly timeline, the most frequently affected sensors, model consensus intersection, and peak Z-scores."*

### Step 6: Live Hyperparameter Tuning & Retraining
- Click on the **ML Models & Configuration** tab:
  - *"Finally, VehicleGuard AI features an interactive ML Configuration Center.*
  - *We can inspect the exact training runtime (ms) and consensus agreement percentage for Isolation Forest, LOF, and One-Class SVM.*
  - *If an automotive engineer wants to adjust the contamination factor or number of isolation trees, they can adjust the sliders and click **'Retrain Models'**.*
  - *The backend re-fits the models on the fly, logs the configuration change to SQLite, and recalculates the analytics without restarting the server."*

---

## 10. Viva / Examiner Q&A Cheat Sheet

Prepare these exact answers for questions professors commonly ask:

### Q1: "Why did you choose Unsupervised Learning instead of Supervised Learning (e.g., Random Forest or XGBoost)?"
> **Answer:** In automotive telemetry, real-world failures are rare and almost never pre-labeled. A supervised model can only detect faults that were already present in its training dataset (known fault classes). Unsupervised learning detects any departure from normal operational baselines, making it capable of catching novel, unexpected, or zero-day mechanical faults without requiring millions of labeled training instances.

### Q2: "Why use an ensemble of 3 models rather than a single algorithm?"
> **Answer:** Every unsupervised algorithm has inherent inductive biases:
> - **Isolation Forest** relies on random partitioning and can struggle with points hidden within local density variations.
> - **Local Outlier Factor (LOF)** relies on local nearest-neighbor density and can be sensitive to hyperparameter $k$.
> - **One-Class SVM** establishes an RBF geometric boundary in a kernel space.
> By combining all three with a **Consensus Voting Matrix**, we drastically reduce false alarms. A single model trigger is treated as a 'Weak' anomaly (often sensor noise), whereas 2 or 3 model triggers confirm genuine mechanical failure with high confidence.

### Q3: "How is the Anomaly Confidence Score calculated? Is it just a random number?"
> **Answer:** No, it is calculated using a deterministic, two-part mathematical formulation:
> 1. **Base Confidence from Model Agreement:** 1 model vote = 50%, 2 votes (consensus) = 75%, 3 votes (unanimous) = 90%.
> 2. **Z-Score Magnitude Bonus:** Measures how many standard deviations the peak sensor deviated beyond $2\sigma$, adding up to an extra 10% confidence:
>    $$\text{Bonus} = \min(10.0, \max(0.0, (z_{\max} - 2.0) \times 3.0))$$
> This guarantees that confidence increases both with algorithmic agreement and physical signal severity.

### Q4: "How does the system achieve real-time streaming without WebSockets?"
> **Answer:** VehicleGuard AI uses **Server-Sent Events (SSE)** via FastAPI's `StreamingResponse` (`text/event-stream`). Telemetry playback is unidirectional (server to client), so SSE is more lightweight, efficient, and simpler than WebSockets, with built-in browser reconnection handling via the native JavaScript `EventSource` API.

### Q5: "What is Anomaly Episode Grouping and why is it important?"
> **Answer:** In real automotive diagnostics, an overheating engine or braking failure does not happen in a single millisecond; it persists across consecutive frames. Individual point anomalies flood technicians with alert fatigue. Our Episode Grouping algorithm clusters consecutive or near-consecutive anomalies within a 2-frame gap into a single unified incident episode, calculating the start time, end time, total duration, peak sensor values, and comparing them against normal interquartile ranges ($Q_1$ to $Q_3$).

### Q6: "What if a telemetry CSV uses completely different sensor names?"
> **Answer:** The data ingestion engine (`DataProcessor`) uses **Fuzzy String Matching** based on the Levenshtein Token Sort Ratio via the `thefuzz` library. Even if a manufacturer labels vehicle speed as `veh_spd`, `velocity`, or `Vehicle Speed (km/h)`, the algorithm matches it to the standardized canonical `speed` feature with a similarity score threshold of 75%.

### Q7: "How do you evaluate or benchmark unsupervised models without ground truth labels?"
> **Answer:** We evaluate unsupervised performance using three surrogate metrics:
> 1. **Consensus Agreement Rate:** How frequently each individual model agrees with the majority consensus decision.
> 2. **Computational Fit Runtime (ms):** Benchmarking latency between tree partitioning, $k$-NN density queries, and quadratic programming in SVM.
> 3. **Statistical Separation (Z-Score Deviation):** Measuring the separation between nominal distributions and detected outlier clusters.

---

## 11. Project File Map & Codebase Reference

| Path | Purpose |
| :--- | :--- |
| [`backend/main.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/main.py) | FastAPI REST API, SSE streaming endpoints, session state management, DB persistence |
| [`backend/ml_engine.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/ml_engine.py) | Isolation Forest, LOF, One-Class SVM ensemble, consensus voting, confidence scoring, episode grouping |
| [`backend/data_processor.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/data_processor.py) | Fuzzy column matching, key-value pivoting, median imputation, acceleration/rpm feature engineering |
| [`backend/models.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/models.py) | SQLAlchemy DB schemas: `Session`, `AnomalyLog`, `AnomalyEpisode`, `ModelConfigLog` |
| [`backend/database.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/database.py) | SQLite database engine and session factory (`vehicleguard.db`) |
| [`backend/create_samples.py`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/create_samples.py) | Synthetic CAN-Bus / OBD-II dataset generator with simulated fault anomalies |
| [`backend/tests/`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/backend/tests) | Unit tests verifying model fitting, confidence calculation, and episode clustering |
| [`frontend/src/app/page.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/app/page.tsx) | Next.js main entry page managing the 3-step workflow (Upload ➔ Summary ➔ Dashboard) |
| [`frontend/src/components/Dashboard.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/Dashboard.tsx) | Coordinator for the 4 tabs, SSE EventSource stream listener, health score state |
| [`frontend/src/components/AnomalyIntelligence.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/AnomalyIntelligence.tsx) | Real-time confidence meter, root-cause feature contribution bars, episode card list |
| [`frontend/src/components/AnomalyEpisodeCard.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/AnomalyEpisodeCard.tsx) | Detailed episode breakdown card showing peak values vs baseline IQR ranges |
| [`frontend/src/components/HistoricalAnalytics.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/HistoricalAnalytics.tsx) | 5 interactive Recharts visualizations (Time, Severity, Affected features, Agreement, Z-Score) |
| [`frontend/src/components/ModelComparison.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/ModelComparison.tsx) | Performance matrix comparing the 3 models on anomaly counts, agreement %, and fit latency |
| [`frontend/src/components/ModelConfiguration.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/ModelConfiguration.tsx) | Interactive hyperparameter tuning sliders and live Retrain Models button |
| [`frontend/src/components/TelemetryChart.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/TelemetryChart.tsx) | Dual-channel live telemetry line chart with rolling 60-frame buffer |
| [`frontend/src/components/HealthScore.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/HealthScore.tsx) | Circular animated SVG vehicle health gauge |
| [`frontend/src/components/AnomalyTimeline.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/AnomalyTimeline.tsx) | Real-time reverse chronological anomaly event card stream |
| [`frontend/src/components/DataUploader.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/DataUploader.tsx) | File dropzone with 1-click pre-loaded sample datasets |
| [`frontend/src/components/DataTransformationSummary.tsx`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/frontend/src/components/DataTransformationSummary.tsx) | Visual summary of fuzzy mappings, cleaning, and engineered features |
| [`sample_data/`](file:///c:/BE-CSE/4th%20year/Researchpaper/Project/sample_data) | Pre-configured realistic CAN-Bus and OBD-II telemetry CSV test files |
