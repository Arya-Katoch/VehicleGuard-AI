import pandas as pd
import numpy as np
import os

def generate_sample_data():
    np.random.seed(42)
    n_points = 120
    timestamps = np.arange(n_points)
    
    # Base signals
    speed = 40 + 20 * np.sin(np.linspace(0, 4*np.pi, n_points)) + np.random.normal(0, 2, n_points)
    rpm = 1500 + speed * 35 + np.random.normal(0, 50, n_points)
    coolant_temp = 85 + 0.1 * timestamps + np.random.normal(0, 0.5, n_points)
    engine_load = 20 + 0.5 * speed + np.random.normal(0, 3, n_points)
    throttle = 15 + 0.4 * speed + np.random.normal(0, 2, n_points)

    # Inject realistic anomalies
    # Anomaly 1: Sudden RPM spike & misfire (points 35-38)
    rpm[35:38] += 2500
    
    # Anomaly 2: Coolant Overheating spike (points 70-75)
    coolant_temp[70:75] += 35.0
    
    # Anomaly 3: Sudden speed drop / brake lock (points 95-97)
    speed[95:97] = 5.0
    engine_load[95:97] += 50.0

    # Dataset 1: Standard feature names
    df_std = pd.DataFrame({
        "timestamp": timestamps,
        "speed": np.round(speed, 2),
        "rpm": np.round(rpm, 0),
        "coolant_temp": np.round(coolant_temp, 1),
        "engine_load": np.round(engine_load, 1),
        "throttle": np.round(throttle, 1)
    })
    
    # Dataset 2: Unstandardized CAN bus column names
    df_can = pd.DataFrame({
        "time": timestamps,
        "VehSpd_kmh": np.round(speed, 2),
        "EngineRPM": np.round(rpm, 0),
        "CoolantTemp": np.round(coolant_temp, 1),
        "EngLoad": np.round(engine_load, 1),
        "Throttle_Pos": np.round(throttle, 1)
    })

    out_dir = os.path.join(os.path.dirname(__file__), "..", "sample_data")
    os.makedirs(out_dir, exist_ok=True)

    df_std.to_csv(os.path.join(out_dir, "sample_vehicle_telemetry.csv"), index=False)
    df_can.to_csv(os.path.join(out_dir, "sample_can_bus_unstandardized.csv"), index=False)
    print(f"Sample datasets created successfully in {os.path.abspath(out_dir)}")

if __name__ == "__main__":
    generate_sample_data()
