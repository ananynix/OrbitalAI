import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt

print("Loading Data...")
# Load the raw features and the calculated errors
features_df = pd.read_csv("starlink_64157_history.csv")
errors_df = pd.read_csv("sgp4_residuals.csv")

# Merge them on the timestamp
features_df['EPOCH'] = pd.to_datetime(features_df['EPOCH'])
errors_df['EPOCH'] = pd.to_datetime(errors_df['EPOCH'])
df = pd.merge(features_df, errors_df, on='EPOCH', how='inner')

# 1. Feature Selection
features = ['BSTAR', 'ECCENTRICITY', 'INCLINATION']

# 2. Normalize the Data
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(df[features])

# 3. The "Peaceful Orbit" Training Split
# We train the AI ONLY on the first 75% of the chronological data (before the collision happened)
train_size = int(len(df) * 0.75)
X_train = X_scaled[:train_size]

# 4. Build the Autoencoder (The "Burglar Alarm")
print("Building Autoencoder Model...")
model = Sequential([
    # Encoder (Compressing the data)
    Dense(16, activation='relu', input_shape=(len(features),)),
    Dense(8, activation='relu'),
    
    # The Bottleneck (The core "blueprint" of a normal orbit)
    Dense(3, activation='relu'),
    
    # Decoder (Rebuilding the data)
    Dense(8, activation='relu'),
    Dense(16, activation='relu'),
    Dense(len(features), activation='linear') # Output matches input size
])

model.compile(optimizer='adam', loss='mse')

# 5. Train the Model (Notice it trains to predict its own input: X_train -> X_train)
print("Training Autoencoder on normal orbits... (This will take a few seconds)")
# verbose=0 hides the epoch spam so your terminal stays clean
model.fit(X_train, X_train, epochs=50, batch_size=16, validation_split=0.1, verbose=0)
print("Training Complete!")

# 6. Test the whole timeline to find the anomaly
print("Scanning entire timeline for anomalies...")
X_predictions = model.predict(X_scaled)

# Calculate "Reconstruction Error" (How badly did the AI fail to rebuild the data?)
reconstruction_errors = np.mean(np.abs(X_scaled - X_predictions), axis=1)

# 7. Visualization: The Grand Finale
fig, ax1 = plt.subplots(figsize=(14, 7))

# Plot 1: The Ground Truth (Physics Error) on the left Y-axis
color = 'tab:red'
ax1.set_xlabel('Date')
ax1.set_ylabel('SGP4 Physics Error (km)', color=color)
ax1.plot(df['EPOCH'], df['SGP4_ERROR_KM'], label="Ground Truth: Actual Collision", color=color, alpha=0.4, marker='o')
ax1.tick_params(axis='y', labelcolor=color)

# Plot 2: The AI Alarm (Reconstruction Error) on the right Y-axis
ax2 = ax1.twinx()  
color = 'tab:blue'
ax2.set_ylabel('AI Panic Level (Reconstruction Error)', color=color)  
ax2.plot(df['EPOCH'], reconstruction_errors, label="AI Anomaly Detection Trigger", color=color, linestyle='--', linewidth=3)
ax2.tick_params(axis='y', labelcolor=color)

# Draw an automated threshold line (3 standard deviations above normal)
threshold = np.mean(reconstruction_errors[:train_size]) + (3 * np.std(reconstruction_errors[:train_size]))
ax2.axhline(y=threshold, color='orange', linestyle=':', linewidth=2, label="Alarm Threshold")

plt.title("Defense Grade PoC: Autoencoder Anomaly Detection vs Physical Collision")
fig.tight_layout()
plt.grid(True, linestyle='--', alpha=0.3)
fig.legend(loc="upper left", bbox_to_anchor=(0.1, 0.9))

print("Displaying final PoC graph...")
plt.show()