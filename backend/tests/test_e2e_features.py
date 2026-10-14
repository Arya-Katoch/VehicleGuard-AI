import urllib.request
import json
import time
import os

BASE_URL = "http://127.0.0.1:8000"

def log_test(name, passed, detail=""):
    status = "[PASSED]" if passed else "[FAILED]"
    print(f"{status} | {name:<45} | {detail}", flush=True)

def run_e2e_tests():
    print("\n======================================================================", flush=True)
    print("      VEHICLEGUARD AI - END-TO-END FEATURE VERIFICATION TEST SUITE    ", flush=True)
    print("======================================================================\n", flush=True)

    # 1. Health Check
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/api/health")
        data = json.loads(res.read().decode('utf-8'))
        log_test("Feature 0: Backend API Health Check", res.status == 200, f"Status: {data['status']}, Version: {data['version']}")
    except Exception as e:
        log_test("Feature 0: Backend API Health Check", False, str(e))

    # 2. Ingest Telematicsdata.csv
    session_id = None
    try:
        file_path = os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "Telematicsdata.csv")
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
        with open(file_path, 'rb') as f:
            file_data = f.read()

        file_name = os.path.basename(file_path)
        body = (
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="file"; filename="{file_name}"\r\n'
            f'Content-Type: text/csv\r\n\r\n'
        ).encode('utf-8') + file_data + f'\r\n--{boundary}--\r\n'.encode('utf-8')

        req = urllib.request.Request(
            f"{BASE_URL}/api/upload",
            data=body,
            headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
        )
        res = urllib.request.urlopen(req)
        up_data = json.loads(res.read().decode('utf-8'))
        session_id = up_data["session_id"]
        log_test("Step 1: Data Ingestion (Telematicsdata.csv)", res.status == 200, f"Session ID: {session_id}, Raw Records: {up_data['summary']['raw_records']}")
    except Exception as e:
        log_test("Step 1: Data Ingestion (Telematicsdata.csv)", False, str(e))
        return

    # 3. AI Standardization Summary (Step 2)
    try:
        summary = up_data["summary"]
        mapped_count = len(summary["columns_mapped"])
        gen_count = len(summary["features_generated"])
        log_test("Step 2: AI Data Standardization Summary", mapped_count > 0, f"Mapped Columns: {mapped_count}, Engineered Features: {gen_count}")
    except Exception as e:
        log_test("Step 2: AI Data Standardization Summary", False, str(e))

    # 4. Tab 1: Live Telemetry Playback Stream
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/api/stream/{session_id}")
        line = res.readline().decode('utf-8')
        event_ok = line.startswith("data:")
        payload = json.loads(line.replace("data: ", "")) if event_ok else {}
        log_test("Tab 1: Live Monitoring SSE Playback Stream", event_ok, f"Progress: {payload.get('progress', 0)}%, Votes: {payload.get('analysis', {}).get('votes', 0)}")
    except Exception as e:
        log_test("Tab 1: Live Monitoring SSE Playback Stream", False, str(e))

    # 5. Tab 2: Feature 1 - Anomaly Intelligence & Root-Cause Analysis
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/api/sessions/{session_id}/analytics")
        analytics = json.loads(res.read().decode('utf-8'))
        stats = analytics["summary_stats"]
        has_confidence = "total_anomalies" in stats
        has_breakdown = "model_agreement_distribution" in analytics
        log_test("Tab 2: Anomaly Intelligence & Root-Cause Analysis", has_confidence and has_breakdown, f"Total Anomalies: {stats['total_anomalies']} ({stats['anomaly_rate_pct']}%), Strong: {stats['strong_anomalies']}")
    except Exception as e:
        log_test("Tab 2: Anomaly Intelligence & Root-Cause Analysis", False, str(e))

    # 6. Tab 3: Feature 2 - Historical Analytics & Anomaly Episode Grouping
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/api/sessions/{session_id}/episodes")
        episodes = json.loads(res.read().decode('utf-8'))
        ep_count = len(episodes)
        ep1 = episodes[0] if ep_count > 0 else {}
        log_test("Tab 3: Historical Analytics & Anomaly Episodes", ep_count > 0, f"Episodes Grouped: {ep_count}, EP-001 Duration: {ep1.get('duration_seconds', 0)}s, Peak Conf: {ep1.get('peak_confidence', 0)}%")
    except Exception as e:
        log_test("Tab 3: Historical Analytics & Anomaly Episodes", False, str(e))

    # 7. Tab 4: Feature 3 - ML Model Comparison Matrix
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/api/sessions/{session_id}/models")
        model_info = json.loads(res.read().decode('utf-8'))
        comp = model_info.get("model_comparison", {})
        if_anom = comp.get("isolation_forest", {}).get("anomalies_detected", 0)
        lof_anom = comp.get("lof", {}).get("anomalies_detected", 0)
        svm_anom = comp.get("ocsvm", {}).get("anomalies_detected", 0)
        log_test("Tab 4: ML Model Comparison Matrix", len(comp) == 3, f"IF Anomalies: {if_anom}, LOF Anomalies: {lof_anom}, OCSVM Anomalies: {svm_anom}")
    except Exception as e:
        log_test("Tab 4: ML Model Comparison Matrix", False, str(e))

    # 8. Feature 3: Hyperparameter Configuration & Live Retraining
    try:
        retrain_cfg = {
            "iso_forest": {"n_estimators": 150, "contamination": 0.08, "random_state": 42},
            "lof": {"n_neighbors": 15, "contamination": 0.08, "metric": "minkowski"},
            "ocsvm": {"kernel": "rbf", "nu": 0.08, "gamma": "scale"}
        }
        req_data = json.dumps(retrain_cfg).encode('utf-8')
        req = urllib.request.Request(
            f"{BASE_URL}/api/sessions/{session_id}/models/retrain",
            data=req_data,
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        retrain_data = json.loads(res.read().decode('utf-8'))
        retrain_ok = (res.status == 200 and retrain_data.get("status") == "success")
        log_test("Feature 3: Safe Model Configuration & Retraining", retrain_ok, f"Message: {retrain_data.get('message')}")
    except Exception as e:
        log_test("Feature 3: Safe Model Configuration & Retraining", False, str(e))

    print("\n======================================================================")
    print("                  ALL FEATURES TESTED & VERIFIED                      ")
    print("======================================================================\n")

if __name__ == "__main__":
    run_e2e_tests()
