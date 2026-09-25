import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
import json

class AnomalyDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        # Adjusted hyperparameters for unsupervised outlier detection
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.lof = LocalOutlierFactor(n_neighbors=20, contamination=0.05, novelty=True)
        self.ocsvm = OneClassSVM(nu=0.05, kernel="rbf", gamma="auto")
        self.feature_names = []
        self.fitted = False

    def train(self, df: pd.DataFrame):
        # Only use numeric columns
        numeric_df = df.select_dtypes(include=[np.number]).copy()
        
        # Drop timestamp if present as it shouldn't be a feature for anomaly detection usually
        if "timestamp" in numeric_df.columns:
            numeric_df = numeric_df.drop(columns=["timestamp"])
            
        self.feature_names = numeric_df.columns.tolist()
        
        if len(self.feature_names) == 0:
            return False
            
        X = self.scaler.fit_transform(numeric_df)
        
        # Fit models
        self.iso_forest.fit(X)
        self.lof.fit(X)
        self.ocsvm.fit(X)
        
        self.fitted = True
        return True
        
    def predict_row(self, row_dict):
        if not self.fitted:
            return None
            
        # Extract features in correct order as a DataFrame to match fitted scaler
        df_row = pd.DataFrame([[row_dict.get(f, 0.0) for f in self.feature_names]], columns=self.feature_names)
        X = self.scaler.transform(df_row)
        
        # 1 for normal, -1 for anomaly
        if_pred = self.iso_forest.predict(X)[0]
        lof_pred = self.lof.predict(X)[0]
        svm_pred = self.ocsvm.predict(X)[0]
        
        # Consensus counting
        anomaly_votes = sum([1 for p in [if_pred, lof_pred, svm_pred] if p == -1])
        
        severity = "normal"
        if anomaly_votes == 1:
            severity = "weak_anomaly"
        elif anomaly_votes == 2:
            severity = "consensus_anomaly"
        elif anomaly_votes == 3:
            severity = "strong_anomaly"
            
        # Explainability: feature with highest absolute z-score
        explanation = {}
        if anomaly_votes > 0:
            z_scores = np.abs(X[0])
            max_idx = np.argmax(z_scores)
            top_feature = self.feature_names[max_idx]
            explanation = {
                "feature": top_feature,
                "z_score": float(z_scores[max_idx]),
                "reason": f"{top_feature} is significantly deviated from the norm."
            }
            
        return {
            "severity": severity,
            "votes": anomaly_votes,
            "explanation": explanation,
            "model_breakdown": {
                "isolation_forest": "anomaly" if if_pred == -1 else "normal",
                "lof": "anomaly" if lof_pred == -1 else "normal",
                "ocsvm": "anomaly" if svm_pred == -1 else "normal"
            }
        }
