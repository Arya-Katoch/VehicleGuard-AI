import numpy as np
import pandas as pd
import time
import uuid
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

def sanitize_json_obj(obj):
    if isinstance(obj, dict):
        return {str(k): sanitize_json_obj(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_json_obj(v) for v in obj]
    elif isinstance(obj, (np.integer, int)):
        return int(obj)
    elif isinstance(obj, (np.floating, float)):
        return float(obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return [sanitize_json_obj(v) for v in obj.tolist()]
    elif pd.isna(obj):
        return None
    return obj

# Safe default hyperparameter configuration
DEFAULT_CONFIG = {
    "iso_forest": {
        "n_estimators": 200,
        "contamination": 0.05,
        "random_state": 42
    },
    "lof": {
        "n_neighbors": 20,
        "contamination": 0.05,
        "metric": "minkowski"
    },
    "ocsvm": {
        "kernel": "rbf",
        "nu": 0.05,
        "gamma": "scale"
    }
}

class AnomalyDetector:
    def __init__(self, config=None):
        self.scaler = StandardScaler()
        self.config = self.validate_config(config or DEFAULT_CONFIG)
        self.feature_names = []
        self.fitted = False
        self.fit_runtimes = {}
        self.normal_ranges = {}
        self._init_models()

    @staticmethod
    def validate_config(config: dict) -> dict:
        """
        Validates hyperparameter bounds safely. Falls back to defaults if out of bounds.
        """
        validated = {
            "iso_forest": dict(DEFAULT_CONFIG["iso_forest"]),
            "lof": dict(DEFAULT_CONFIG["lof"]),
            "ocsvm": dict(DEFAULT_CONFIG["ocsvm"])
        }

        if not isinstance(config, dict):
            return validated

        # Iso Forest validation
        iso_cfg = config.get("iso_forest", {})
        if isinstance(iso_cfg, dict):
            n_est = iso_cfg.get("n_estimators")
            if isinstance(n_est, int) and 10 <= n_est <= 1000:
                validated["iso_forest"]["n_estimators"] = n_est

            cont = iso_cfg.get("contamination")
            if isinstance(cont, (int, float)) and 0.001 <= cont <= 0.5:
                validated["iso_forest"]["contamination"] = float(cont)

            rs = iso_cfg.get("random_state")
            if isinstance(rs, int):
                validated["iso_forest"]["random_state"] = rs

        # LOF validation
        lof_cfg = config.get("lof", {})
        if isinstance(lof_cfg, dict):
            n_neigh = lof_cfg.get("n_neighbors")
            if isinstance(n_neigh, int) and 2 <= n_neigh <= 200:
                validated["lof"]["n_neighbors"] = n_neigh

            cont = lof_cfg.get("contamination")
            if isinstance(cont, (int, float)) and 0.001 <= cont <= 0.5:
                validated["lof"]["contamination"] = float(cont)

            met = lof_cfg.get("metric")
            if met in ["minkowski", "euclidean", "manhattan"]:
                validated["lof"]["metric"] = met

        # OCSVM validation
        oc_cfg = config.get("ocsvm", {})
        if isinstance(oc_cfg, dict):
            ker = oc_cfg.get("kernel")
            if ker in ["rbf", "linear", "poly", "sigmoid"]:
                validated["ocsvm"]["kernel"] = ker

            nu = oc_cfg.get("nu")
            if isinstance(nu, (int, float)) and 0.001 <= nu <= 0.5:
                validated["ocsvm"]["nu"] = float(nu)

            gam = oc_cfg.get("gamma")
            if gam in ["scale", "auto"] or (isinstance(gam, (int, float)) and gam > 0):
                validated["ocsvm"]["gamma"] = gam

        return validated

    def _init_models(self):
        iso_p = self.config["iso_forest"]
        lof_p = self.config["lof"]
        oc_p = self.config["ocsvm"]

        self.iso_forest = IsolationForest(
            n_estimators=iso_p["n_estimators"],
            contamination=iso_p["contamination"],
            random_state=iso_p["random_state"]
        )

        self.lof = LocalOutlierFactor(
            n_neighbors=lof_p["n_neighbors"],
            contamination=lof_p["contamination"],
            metric=lof_p["metric"],
            novelty=True
        )

        self.ocsvm = OneClassSVM(
            kernel=oc_p["kernel"],
            nu=oc_p["nu"],
            gamma=oc_p["gamma"]
        )

    def train(self, df: pd.DataFrame, config=None):
        if config is not None:
            self.config = self.validate_config(config)
            self._init_models()

        numeric_df = df.select_dtypes(include=[np.number]).copy()
        if "timestamp" in numeric_df.columns:
            numeric_df = numeric_df.drop(columns=["timestamp"])

        self.feature_names = numeric_df.columns.tolist()
        if len(self.feature_names) == 0:
            return False

        # Calculate normal ranges (IQR / quartiles for baseline)
        self.normal_ranges = {}
        for col in self.feature_names:
            q25 = float(numeric_df[col].quantile(0.25))
            q75 = float(numeric_df[col].quantile(0.75))
            min_val = float(numeric_df[col].min())
            max_val = float(numeric_df[col].max())
            median_val = float(numeric_df[col].median())
            self.normal_ranges[col] = {
                "q25": round(q25, 2),
                "q75": round(q75, 2),
                "min": round(min_val, 2),
                "max": round(max_val, 2),
                "median": round(median_val, 2)
            }

        X = self.scaler.fit_transform(numeric_df)

        # Fit Isolation Forest
        t0 = time.time()
        self.iso_forest.fit(X)
        t_iso = (time.time() - t0) * 1000

        # Fit LOF
        t0 = time.time()
        self.lof.fit(X)
        t_lof = (time.time() - t0) * 1000

        # Fit OCSVM
        t0 = time.time()
        self.ocsvm.fit(X)
        t_oc = (time.time() - t0) * 1000

        self.fit_runtimes = {
            "isolation_forest": round(t_iso, 2),
            "lof": round(t_lof, 2),
            "ocsvm": round(t_oc, 2)
        }

        self.fitted = True
        return True

    @staticmethod
    def calculate_confidence(anomaly_votes: int, max_z_score: float) -> float:
        """
        Calculates deterministic anomaly confidence percentage.
        Base confidence:
          0 votes -> 0.0%
          1 vote  -> 50.0%
          2 votes -> 75.0%
          3 votes -> 90.0%
        Z-Score Magnitude Bonus:
          bonus = min(10.0, max(0.0, (max_z_score - 2.0) * 3.0))
        Total = min(100.0, base + bonus)
        """
        if anomaly_votes == 0:
            return 0.0

        base_map = {1: 50.0, 2: 75.0, 3: 90.0}
        base_confidence = base_map.get(anomaly_votes, 50.0)

        bonus = min(10.0, max(0.0, (max_z_score - 2.0) * 3.0))
        confidence = min(100.0, base_confidence + bonus)
        return round(confidence, 1)

    def predict_row(self, row_dict: dict) -> dict:
        if not self.fitted:
            return None

        df_row = pd.DataFrame([[row_dict.get(f, 0.0) for f in self.feature_names]], columns=self.feature_names)
        X = self.scaler.transform(df_row)[0]

        # Model predictions: 1 for normal, -1 for anomaly
        if_pred = int(self.iso_forest.predict([X])[0])
        lof_pred = int(self.lof.predict([X])[0])
        svm_pred = int(self.ocsvm.predict([X])[0])

        if_anomaly = (if_pred == -1)
        lof_anomaly = (lof_pred == -1)
        svm_anomaly = (svm_pred == -1)

        anomaly_votes = sum([1 for p in [if_anomaly, lof_anomaly, svm_anomaly] if p])

        severity = "normal"
        if anomaly_votes == 1:
            severity = "weak_anomaly"
        elif anomaly_votes == 2:
            severity = "consensus_anomaly"
        elif anomaly_votes == 3:
            severity = "strong_anomaly"

        z_scores = np.abs(X)
        max_idx = int(np.argmax(z_scores)) if len(z_scores) > 0 else 0
        max_z = float(z_scores[max_idx]) if len(z_scores) > 0 else 0.0
        primary_feature = self.feature_names[max_idx] if len(self.feature_names) > 0 else "unknown"

        confidence = self.calculate_confidence(anomaly_votes, max_z)

        # Calculate contributing features breakdown
        contributing_features = []
        total_z = sum(z_scores)
        if total_z > 0 and anomaly_votes > 0:
            for idx, f in enumerate(self.feature_names):
                z_val = float(z_scores[idx])
                pct = round((z_val / total_z) * 100, 1)
                contributing_features.append({
                    "feature": f,
                    "percentage": pct,
                    "z_score": round(z_val, 2),
                    "value": round(float(row_dict.get(f, 0.0)), 2)
                })
            contributing_features.sort(key=lambda item: item["percentage"], reverse=True)

        # Dynamic human-readable explanation
        explanation = {}
        if anomaly_votes > 0:
            val = round(float(row_dict.get(primary_feature, 0.0)), 2)
            model_names = []
            if if_anomaly: model_names.append("Isolation Forest")
            if lof_anomaly: model_names.append("LOF")
            if svm_anomaly: model_names.append("One-Class SVM")

            models_str = ", ".join(model_names) if model_names else "none"
            reason_str = (
                f"{primary_feature.replace('_', ' ').title()} (value: {val}) significantly "
                f"deviated from normal baseline (z-score: {max_z:.2f}) and was classified as anomalous "
                f"by {anomaly_votes} of 3 models ({models_str})."
            )
            explanation = {
                "feature": primary_feature,
                "z_score": round(max_z, 2),
                "reason": reason_str
            }

        timestamp_val = row_dict.get("timestamp", row_dict.get("time", 0.0))

        return sanitize_json_obj({
            "anomaly_id": f"ano_{uuid.uuid4().hex[:8]}",
            "timestamp": timestamp_val,
            "severity": severity,
            "confidence": confidence,
            "primary_feature": primary_feature,
            "z_score": round(max_z, 2),
            "votes": anomaly_votes,
            "model_votes": anomaly_votes,
            "model_agreement": {
                "isolation_forest": if_anomaly,
                "lof": lof_anomaly,
                "ocsvm": svm_anomaly
            },
            "model_breakdown": {
                "isolation_forest": "anomaly" if if_anomaly else "normal",
                "lof": "anomaly" if lof_anomaly else "normal",
                "ocsvm": "anomaly" if svm_anomaly else "normal"
            },
            "contributing_features": contributing_features,
            "explanation": explanation
        })

    def analyze_dataset(self, df: pd.DataFrame) -> dict:
        """
        Runs comprehensive analysis over the complete dataset for batch analytics,
        episode grouping, model comparison metrics, and agreement distribution.
        """
        if not self.fitted:
            return {}

        numeric_df = df.select_dtypes(include=[np.number]).copy()
        if "timestamp" in numeric_df.columns:
            features_df = numeric_df.drop(columns=["timestamp"])
        else:
            features_df = numeric_df.copy()

        # Ensure correct column ordering
        features_df = features_df.reindex(columns=self.feature_names, fill_value=0.0)
        X = self.scaler.transform(features_df)

        if_preds = self.iso_forest.predict(X)
        lof_preds = self.lof.predict(X)
        svm_preds = self.ocsvm.predict(X)

        n_records = len(df)
        predictions = []
        anomaly_records = []

        model_counts = {
            "isolation_forest": {"anomalies": 0, "normal": 0, "agreement_with_consensus": 0},
            "lof": {"anomalies": 0, "normal": 0, "agreement_with_consensus": 0},
            "ocsvm": {"anomalies": 0, "normal": 0, "agreement_with_consensus": 0}
        }

        agreement_dist = {
            "all_3_models": 0,
            "if_and_lof": 0,
            "if_and_svm": 0,
            "lof_and_svm": 0,
            "only_if": 0,
            "only_lof": 0,
            "only_svm": 0,
            "normal": 0
        }

        feature_affected_counts = {f: 0 for f in self.feature_names}
        feature_z_sums = {f: 0.0 for f in self.feature_names}
        anomalies_over_time = []

        for idx in range(n_records):
            row_dict = df.iloc[idx].to_dict()
            if_anom = (if_preds[idx] == -1)
            lof_anom = (lof_preds[idx] == -1)
            svm_anom = (svm_preds[idx] == -1)

            votes = sum([if_anom, lof_anom, svm_anom])
            is_anomaly = (votes > 0)

            # Agreement Matrix
            if if_anom and lof_anom and svm_anom:
                agreement_dist["all_3_models"] += 1
            elif if_anom and lof_anom and not svm_anom:
                agreement_dist["if_and_lof"] += 1
            elif if_anom and not lof_anom and svm_anom:
                agreement_dist["if_and_svm"] += 1
            elif not if_anom and lof_anom and svm_anom:
                agreement_dist["lof_and_svm"] += 1
            elif if_anom:
                agreement_dist["only_if"] += 1
            elif lof_anom:
                agreement_dist["only_lof"] += 1
            elif svm_anom:
                agreement_dist["only_svm"] += 1
            else:
                agreement_dist["normal"] += 1

            if if_anom: model_counts["isolation_forest"]["anomalies"] += 1
            else: model_counts["isolation_forest"]["normal"] += 1

            if lof_anom: model_counts["lof"]["anomalies"] += 1
            else: model_counts["lof"]["normal"] += 1

            if svm_anom: model_counts["ocsvm"]["anomalies"] += 1
            else: model_counts["ocsvm"]["normal"] += 1

            # Consensus Agreement
            consensus_is_anomaly = (votes >= 2)
            if (if_anom == consensus_is_anomaly): model_counts["isolation_forest"]["agreement_with_consensus"] += 1
            if (lof_anom == consensus_is_anomaly): model_counts["lof"]["agreement_with_consensus"] += 1
            if (svm_anom == consensus_is_anomaly): model_counts["ocsvm"]["agreement_with_consensus"] += 1

            z_row = np.abs(X[idx])
            max_idx = int(np.argmax(z_row)) if len(z_row) > 0 else 0
            max_z = float(z_row[max_idx]) if len(z_row) > 0 else 0.0
            primary_f = self.feature_names[max_idx] if len(self.feature_names) > 0 else "unknown"

            conf = self.calculate_confidence(votes, max_z)

            sev = "normal"
            if votes == 1: sev = "weak_anomaly"
            elif votes == 2: sev = "consensus_anomaly"
            elif votes == 3: sev = "strong_anomaly"

            ts = float(row_dict.get("timestamp", row_dict.get("time", idx)))

            pred_item = {
                "index": idx,
                "timestamp": ts,
                "severity": sev,
                "votes": votes,
                "confidence": conf,
                "primary_feature": primary_f,
                "z_score": round(max_z, 2),
                "model_breakdown": {
                    "isolation_forest": "anomaly" if if_anom else "normal",
                    "lof": "anomaly" if lof_anom else "normal",
                    "ocsvm": "anomaly" if svm_anom else "normal"
                }
            }
            predictions.append(pred_item)

            if is_anomaly:
                anomaly_records.append(pred_item)
                feature_affected_counts[primary_f] += 1
                feature_z_sums[primary_f] += max_z

            anomalies_over_time.append({
                "timestamp": ts,
                "votes": votes,
                "confidence": conf,
                "is_anomaly": 1 if is_anomaly else 0,
                "z_score": round(max_z, 2)
            })

        # Calculate Episodes (Grouping consecutive or near-consecutive anomalous records)
        episodes = []
        current_ep = []
        gap_threshold = 2 # allow 2 normal frames window between consecutive anomalies

        for p in predictions:
            if p["votes"] > 0:
                if not current_ep:
                    current_ep.append(p)
                else:
                    last_idx = current_ep[-1]["index"]
                    if p["index"] - last_idx <= (gap_threshold + 1):
                        current_ep.append(p)
                    else:
                        episodes.append(self._build_episode(len(episodes) + 1, current_ep, df))
                        current_ep = [p]
        if current_ep:
            episodes.append(self._build_episode(len(episodes) + 1, current_ep, df))

        # Model comparison metrics formatting
        model_comparison = {}
        for m_key, counts in model_counts.items():
            model_comparison[m_key] = {
                "anomalies_detected": counts["anomalies"],
                "normal_detected": counts["normal"],
                "consensus_agreement_pct": round((counts["agreement_with_consensus"] / max(1, n_records)) * 100, 1),
                "runtime_ms": self.fit_runtimes.get(m_key, 0.0),
                "parameters": self.config.get(m_key, {})
            }

        total_anom = len(anomaly_records)
        strong_c = sum(1 for p in predictions if p["severity"] == "strong_anomaly")
        consensus_c = sum(1 for p in predictions if p["severity"] == "consensus_anomaly")
        weak_c = sum(1 for p in predictions if p["severity"] == "weak_anomaly")

        most_affected = []
        for f, cnt in feature_affected_counts.items():
            if cnt > 0:
                avg_z = round(feature_z_sums[f] / cnt, 2)
                most_affected.append({
                    "feature": f,
                    "count": cnt,
                    "avg_z_score": avg_z
                })
        most_affected.sort(key=lambda x: x["count"], reverse=True)

        return sanitize_json_obj({
            "summary_stats": {
                "total_records": n_records,
                "total_anomalies": total_anom,
                "anomaly_rate_pct": round((total_anom / max(1, n_records)) * 100, 2),
                "strong_anomalies": strong_c,
                "consensus_anomalies": consensus_c,
                "weak_anomalies": weak_c,
                "total_episodes": len(episodes)
            },
            "episodes": episodes,
            "model_comparison": model_comparison,
            "model_agreement_distribution": agreement_dist,
            "most_affected_features": most_affected,
            "anomalies_over_time": anomalies_over_time,
            "normal_ranges": self.normal_ranges,
            "config": self.config
        })

    def _build_episode(self, ep_num: int, ep_records: list, raw_df: pd.DataFrame) -> dict:
        start_ts = ep_records[0]["timestamp"]
        end_ts = ep_records[-1]["timestamp"]
        duration = round(abs(end_ts - start_ts), 2)
        if duration == 0:
            duration = round(len(ep_records) * 0.3, 2) # fallback duration based on playback step

        peak_conf = max(r["confidence"] for r in ep_records)

        # Max severity in episode
        severities = [r["severity"] for r in ep_records]
        if "strong_anomaly" in severities: ep_sev = "strong_anomaly"
        elif "consensus_anomaly" in severities: ep_sev = "consensus_anomaly"
        else: ep_sev = "weak_anomaly"

        affected_feats = sorted(list(set(r["primary_feature"] for r in ep_records)))

        # Find peak metrics for affected features
        indices = [r["index"] for r in ep_records]
        sub_df = raw_df.iloc[indices]

        peak_metrics = {}
        for f in affected_feats:
            if f in sub_df.columns:
                peak_metrics[f] = round(float(sub_df[f].max()), 2)

        return sanitize_json_obj({
            "episode_id": f"EP-{ep_num:03d}",
            "episode_number": ep_num,
            "start_time": start_ts,
            "end_time": end_ts,
            "duration_seconds": duration,
            "record_count": len(episodes_records if 'episodes_records' in locals() else ep_records),
            "severity": ep_sev,
            "peak_confidence": peak_conf,
            "affected_features": affected_feats,
            "peak_metrics": peak_metrics,
            "normal_ranges": {f: self.normal_ranges.get(f, {}) for f in affected_feats}
        })
