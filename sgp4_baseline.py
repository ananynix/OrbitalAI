import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sgp4.api import Satrec, jday
from datetime import datetime

print("Loading orbital history...")
# 1. Load and sort the data chronologically (oldest to newest)
df = pd.read_csv("starlink_64157_history.csv")
df['EPOCH'] = pd.to_datetime(df['EPOCH'])
df = df.sort_values('EPOCH').reset_index(drop=True)

errors_km = []
timestamps = []

print("Calculating SGP4 propagation errors...")
# 2. Iterate through the records to calculate the "Residuals"
for i in range(len(df) - 1):
    # Data for Time T (The Starting Point)
    tle1_l1 = df['TLE_LINE1'][i]
    tle1_l2 = df['TLE_LINE2'][i]
    
    # Data for Time T+1 (The Target)
    tle2_l1 = df['TLE_LINE1'][i+1]
    tle2_l2 = df['TLE_LINE2'][i+1]
    epoch_target = df['EPOCH'][i+1]
    
    # Convert target time to SGP4 Julian Date format
    jd, fr = jday(epoch_target.year, epoch_target.month, epoch_target.day, 
                  epoch_target.hour, epoch_target.minute, epoch_target.second + epoch_target.microsecond/1e6)

    # --- THE PHYSICS PREDICTION ---
    # Load Time T into the physics engine and propagate it forward to Time T+1
    sat_pred = Satrec.twoline2rv(tle1_l1, tle1_l2)
    err_code1, r_pred, v_pred = sat_pred.sgp4(jd, fr)
    
    # --- THE GROUND TRUTH ---
    # Load the actual recorded data for Time T+1
    sat_true = Satrec.twoline2rv(tle2_l1, tle2_l2)
    err_code2, r_true, v_true = sat_true.sgp4(jd, fr)
    
    # Calculate Euclidean distance between prediction and reality (in kilometers)
    if err_code1 == 0 and err_code2 == 0: # 0 means SGP4 math was successful
        error = np.linalg.norm(np.array(r_pred) - np.array(r_true))
        errors_km.append(error)
        timestamps.append(epoch_target)

# 3. Visualize the "Dark Object" / Anomaly Gap
plt.figure(figsize=(12, 6))
plt.plot(timestamps, errors_km, marker='o', linestyle='-', color='red', alpha=0.7)
plt.title("SGP4 Physics Error Over Time (Target for ML Correction)")
plt.xlabel("Date")
plt.ylabel("Prediction Error (Kilometers)")
plt.grid(True, linestyle='--', alpha=0.6)
plt.tight_layout()
# Save the errors alongside the timestamps for the ML model
results_df = pd.DataFrame({'EPOCH': timestamps, 'SGP4_ERROR_KM': errors_km})
results_df.to_csv("sgp4_residuals.csv", index=False)
print("💾 Saved residuals to sgp4_residuals.csv")
print(f"Average baseline error: {np.mean(errors_km):.2f} km")
plt.show()