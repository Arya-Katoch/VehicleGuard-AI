import unittest
import pandas as pd
import numpy as np
import os
import sys

# Ensure backend directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml_engine import AnomalyDetector, DEFAULT_CONFIG
from data_processor import DataProcessor

class TestVehicleGuardEngine(unittest.TestCase):
    def setUp(self):
        np.random.seed(42)
        n = 50
        timestamps = np.arange(n)
        speed = 50 + np.random.normal(0, 2, n)
        rpm = 2000 + np.random.normal(0, 50, n)
        coolant = 88 + np.random.normal(0, 0.5, n)

        # Inject anomalies
        rpm[10:13] += 3000 # episode 1 (3 consecutive rows)
        coolant[30] += 40.0 # isolated anomaly

        self.df = pd.DataFrame({
            "timestamp": timestamps,
            "speed": speed,
            "rpm": rpm,
            "coolant_temp": coolant
        })
        self.detector = AnomalyDetector()

    def test_train_and_confidence(self):
        success = self.detector.train(self.df)
        self.assertTrue(success)
        self.assertTrue(self.detector.fitted)

        # Confidence bounds test
        conf0 = self.detector.calculate_confidence(0, 0.5)
        self.assertEqual(conf0, 0.0)

        conf1 = self.detector.calculate_confidence(1, 2.5)
        self.assertTrue(50.0 <= conf1 <= 60.0)

        conf2 = self.detector.calculate_confidence(2, 3.0)
        self.assertTrue(75.0 <= conf2 <= 85.0)

        conf3 = self.detector.calculate_confidence(3, 4.0)
        self.assertTrue(90.0 <= conf3 <= 100.0)

    def test_predict_row(self):
        self.detector.train(self.df)
        normal_row = {"timestamp": 0, "speed": 50.0, "rpm": 2000.0, "coolant_temp": 88.0}
        pred_normal = self.detector.predict_row(normal_row)
        self.assertIsNotNone(pred_normal)
        self.assertIn("anomaly_id", pred_normal)
        self.assertIn("confidence", pred_normal)
        self.assertIn("model_agreement", pred_normal)

        anom_row = {"timestamp": 10, "speed": 50.0, "rpm": 6000.0, "coolant_temp": 88.0}
        pred_anom = self.detector.predict_row(anom_row)
        self.assertGreater(pred_anom["votes"], 0)
        self.assertGreater(len(pred_anom["contributing_features"]), 0)
        self.assertIn("reason", pred_anom["explanation"])

    def test_episode_grouping_and_analytics(self):
        self.detector.train(self.df)
        analytics = self.detector.analyze_dataset(self.df)

        self.assertIn("summary_stats", analytics)
        self.assertIn("episodes", analytics)
        self.assertIn("model_comparison", analytics)
        self.assertIn("model_agreement_distribution", analytics)

        summary = analytics["summary_stats"]
        self.assertEqual(summary["total_records"], 50)
        self.assertGreaterEqual(summary["total_anomalies"], 1)

        # Ensure episodes were grouped
        episodes = analytics["episodes"]
        self.assertIsInstance(episodes, list)
        if len(episodes) > 0:
            ep = episodes[0]
            self.assertIn("episode_id", ep)
            self.assertIn("peak_confidence", ep)
            self.assertIn("affected_features", ep)

    def test_config_validation_and_retrain(self):
        invalid_config = {
            "iso_forest": {"n_estimators": -999, "contamination": 2.5},
            "lof": {"n_neighbors": 1000},
            "ocsvm": {"kernel": "invalid_kernel"}
        }
        validated = AnomalyDetector.validate_config(invalid_config)

        # Fallback to safe defaults
        self.assertEqual(validated["iso_forest"]["n_estimators"], DEFAULT_CONFIG["iso_forest"]["n_estimators"])
        self.assertEqual(validated["iso_forest"]["contamination"], DEFAULT_CONFIG["iso_forest"]["contamination"])
        self.assertEqual(validated["ocsvm"]["kernel"], DEFAULT_CONFIG["ocsvm"]["kernel"])

        # Test valid custom config
        valid_config = {
            "iso_forest": {"n_estimators": 150, "contamination": 0.08, "random_state": 123},
            "lof": {"n_neighbors": 15, "contamination": 0.08, "metric": "euclidean"},
            "ocsvm": {"kernel": "rbf", "nu": 0.08, "gamma": "auto"}
        }
        retrain_ok = self.detector.train(self.df, config=valid_config)
        self.assertTrue(retrain_ok)
        self.assertEqual(self.detector.config["iso_forest"]["n_estimators"], 150)

    def test_edge_cases(self):
        # Edge case 1: clean dataset structure check
        clean_df = pd.DataFrame({
            "timestamp": np.arange(20),
            "speed": [50.0] * 20,
            "rpm": [2000.0] * 20
        })
        detector2 = AnomalyDetector()
        detector2.train(clean_df)
        analytics_clean = detector2.analyze_dataset(clean_df)
        self.assertEqual(analytics_clean["summary_stats"]["total_records"], 20)
        self.assertIn("summary_stats", analytics_clean)

        # Edge case 2: Dataset with missing values handled by DataProcessor
        df_missing = pd.DataFrame({
            "speed": [50.0, np.nan, 52.0, 51.0],
            "rpm": [2000.0, 2100.0, np.nan, 2050.0]
        })
        # Save temporary CSV to run through DataProcessor
        temp_path = os.path.join(os.path.dirname(__file__), "temp_missing.csv")
        df_missing.to_csv(temp_path, index=False)
        try:
            processed_path, summary = DataProcessor().process_csv(temp_path)
            processed_df = pd.read_csv(processed_path)
            self.assertFalse(processed_df.isna().any().any())
            self.assertGreater(summary["missing_values_handled"], 0)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        # Edge case 3: Single anomaly episode vs consecutive anomalies
        timestamps = np.arange(30)
        rpm = [2000.0] * 30
        rpm[10] = 8000.0
        rpm[11] = 8200.0
        rpm[12] = 8100.0
        df_single = pd.DataFrame({
            "timestamp": timestamps,
            "speed": [50.0] * 30,
            "rpm": rpm
        })
        det_single = AnomalyDetector()
        det_single.train(df_single)
        anal_single = det_single.analyze_dataset(df_single)
        self.assertGreaterEqual(len(anal_single["episodes"]), 1)

if __name__ == "__main__":
    unittest.main()



