import pandas as pd
import numpy as np
from thefuzz import process, fuzz
import json
import uuid
import os

# Standard names we want to map to
STANDARD_FEATURES = {
    "speed": ["speed", "vehspd", "velocity", "kmh", "mph", "vehicle_speed"],
    "rpm": ["rpm", "engine_speed", "enginerpm", "engine_rpm"],
    "engine_load": ["load", "engine_load", "engload", "engine load"],
    "coolant_temp": ["coolant", "temp", "temperature", "ect", "coolant_temp"],
    "throttle": ["throttle", "pedal", "accel_pos", "throttle_pos"],
    "timestamp": ["time", "timestamp", "date", "datetime"]
}

class DataProcessor:
    def __init__(self):
        pass

    def _fuzzy_match_column(self, col_name, choices):
        # find best match if score >= 75
        best_match, score = process.extractOne(col_name.lower(), choices, scorer=fuzz.partial_ratio)
        if score >= 75:
            return True
        return False

    def process_csv(self, file_path):
        df = pd.read_csv(file_path)
        raw_rows, raw_cols = df.shape
        
        mapping = {}
        processed_cols = set()
        
        # 1. Column Mapping
        for col in df.columns:
            matched = False
            for std_name, aliases in STANDARD_FEATURES.items():
                if std_name in processed_cols: continue
                if self._fuzzy_match_column(col, aliases):
                    mapping[col] = std_name
                    processed_cols.add(std_name)
                    matched = True
                    break
            if not matched:
                mapping[col] = col # keep original
                
        df.rename(columns=mapping, inplace=True)
        
        # Ensure timestamp exists or create a dummy one
        if "timestamp" not in df.columns:
            df["timestamp"] = np.arange(len(df)) # dummy incremental timestamp
        
        # 2. Cleaning
        missing_handled = int(df.isna().sum().sum())
        # Impute missing values with median for numeric
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].median() if not pd.isna(df[col].median()) else 0)
        
        duplicates = int(df.duplicated().sum())
        df.drop_duplicates(inplace=True)
        
        # 3. Feature Engineering
        engineered_features = []
        if "speed" in df.columns and "timestamp" in df.columns:
            try:
                df = df.sort_values("timestamp")
                df['acceleration'] = df['speed'].diff().fillna(0)
                engineered_features.append("acceleration")
            except:
                pass
                
        if "rpm" in df.columns:
            df['rpm_change'] = df['rpm'].diff().fillna(0)
            engineered_features.append("rpm_change")
            
        final_rows, final_cols = df.shape
        
        summary = {
            "raw_records": raw_rows,
            "processed_records": final_rows,
            "columns_detected": raw_cols,
            "columns_mapped": {k: v for k, v in mapping.items() if k != v},
            "missing_values_handled": missing_handled,
            "duplicates_handled": duplicates,
            "features_generated": engineered_features
        }
        
        # Save processed CSV for playback
        processed_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
        os.makedirs(processed_dir, exist_ok=True)
        processed_filename = f"processed_{uuid.uuid4().hex}.csv"
        processed_filepath = os.path.join(processed_dir, processed_filename)
        df.to_csv(processed_filepath, index=False)
        
        return processed_filepath, summary
