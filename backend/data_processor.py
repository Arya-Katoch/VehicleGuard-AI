import pandas as pd
import numpy as np
from thefuzz import process, fuzz
import json
import uuid
import os

# Standard names we want to map to
STANDARD_FEATURES = {
    "speed": ["speed", "vehspd", "velocity", "kmh", "mph", "vehicle_speed", "vehicle speed"],
    "rpm": ["rpm", "engine_speed", "enginerpm", "engine_rpm", "engine rpm"],
    "engine_load": ["load", "engine_load", "engload", "engine load", "calculated engine load", "absolute load value"],
    "coolant_temp": ["coolant", "temp", "temperature", "ect", "coolant_temp", "engine coolant temperature", "ambient air temperature"],
    "throttle": ["throttle", "pedal", "accel_pos", "throttle_pos", "throttle position", "relative throttle position", "absolute throttle position b"],
    "timestamp": ["time", "timestamp", "date", "datetime", "timemili"]
}

class DataProcessor:
    def __init__(self):
        pass

    def _fuzzy_match_column(self, col_name, choices):
        col_clean = col_name.strip().lower()
        # 1. Exact match check
        for c in choices:
            if col_clean == c.lower():
                return True
        # 2. Token sort ratio check
        best_match, score = process.extractOne(col_clean, [ch.lower() for ch in choices], scorer=fuzz.token_sort_ratio)
        if score >= 75:
            return True
        return False

    def process_csv(self, file_path):
        df = pd.read_csv(file_path)
        raw_rows, raw_cols = df.shape

        # 0. Key-Value Long Log Pivoting (e.g. Telematicsdata.csv)
        cols_lower = {c.lower(): c for c in df.columns}
        if "variable" in cols_lower and "value" in cols_lower:
            var_col = cols_lower["variable"]
            val_col = cols_lower["value"]
            time_col = None
            for tc in ["timestamp", "timemili", "time", "date"]:
                if tc in cols_lower:
                    time_col = cols_lower[tc]
                    break

            df["_num_val"] = pd.to_numeric(df[val_col], errors="coerce")
            index_col = time_col if time_col else df.index
            df_pivoted = df.pivot_table(index=index_col, columns=var_col, values="_num_val", aggfunc="first").ffill().bfill().reset_index()
            df = df_pivoted

        # Convert Datetime string timestamp to numerical elapsed seconds
        if "timestamp" in df.columns:
            try:
                ts_parsed = pd.to_datetime(df["timestamp"], errors="coerce")
                if not ts_parsed.isna().all():
                    df["timestamp"] = (ts_parsed - ts_parsed.iloc[0]).dt.total_seconds().fillna(0.0)
            except Exception:
                df["timestamp"] = np.arange(len(df), dtype=float)

        # Subsample large datasets (> 1000 rows) for responsive stream playback
        if len(df) > 1000:
            step = int(np.ceil(len(df) / 1000.0))
            df = df.iloc[::step].reset_index(drop=True)
        
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
        # Deduplicate column names if any duplicates occurred
        df = df.loc[:, ~df.columns.duplicated()].copy()
        
        # Ensure timestamp exists or create a dummy one
        if "timestamp" not in df.columns:
            df["timestamp"] = np.arange(len(df), dtype=float)
        
        # 2. Cleaning
        missing_handled = int(df.isna().sum().sum())
        # Impute missing values with median for numeric
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            try:
                col_data = df[col]
                if isinstance(col_data, pd.DataFrame):
                    col_data = col_data.iloc[:, 0]
                med = col_data.median()
                fill_val = 0.0 if pd.isna(med) else float(med)
            except Exception:
                fill_val = 0.0
            df[col] = df[col].fillna(fill_val)
        
        duplicates = int(df.duplicated().sum())
        df.drop_duplicates(inplace=True)
        
        # 3. Feature Engineering
        engineered_features = []
        if "speed" in df.columns and "timestamp" in df.columns:
            try:
                df = df.sort_values("timestamp")
                speed_series = df['speed'].iloc[:, 0] if isinstance(df['speed'], pd.DataFrame) else df['speed']
                df['acceleration'] = pd.to_numeric(speed_series, errors='coerce').diff().fillna(0.0)
                engineered_features.append("acceleration")
            except Exception as e:
                print("Acceleration engineering warning:", e)
                
        if "rpm" in df.columns:
            try:
                rpm_series = df['rpm'].iloc[:, 0] if isinstance(df['rpm'], pd.DataFrame) else df['rpm']
                df['rpm_change'] = pd.to_numeric(rpm_series, errors='coerce').diff().fillna(0.0)
                engineered_features.append("rpm_change")
            except Exception as e:
                print("RPM change engineering warning:", e)
            
        final_rows, final_cols = df.shape
        
        summary = {
            "raw_records": int(raw_rows),
            "processed_records": int(final_rows),
            "columns_detected": int(raw_cols),
            "columns_mapped": {str(k): str(v) for k, v in mapping.items() if k != v},
            "missing_values_handled": int(missing_handled),
            "duplicates_handled": int(duplicates),
            "features_generated": [str(x) for x in engineered_features]
        }
        
        # Save processed CSV for playback
        processed_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
        os.makedirs(processed_dir, exist_ok=True)
        processed_filename = f"processed_{uuid.uuid4().hex}.csv"
        processed_filepath = os.path.join(processed_dir, processed_filename)
        df.to_csv(processed_filepath, index=False)
        
        return processed_filepath, summary
