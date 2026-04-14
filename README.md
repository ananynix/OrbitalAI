# LEO Dark Object Detection: Orbital Anomaly Autoencoder

An end-to-end machine learning pipeline designed to act as an early-warning system for uncatalogued "Dark Object" perturbations and unmodeled satellite fragmentation events in Low Earth Orbit (LEO). 

By combining standard SGP4 orbital mechanics with an unsupervised Deep Learning Autoencoder, this Proof of Concept (PoC) successfully identifies catastrophic orbital anomalies by detecting deviations from nominal physics predictions.

## 🚀 Project Overview

Modern battlefields and LEO environments are highly congested. While active satellites and large debris are cataloged, space assets remain vulnerable to uncatalogued "dark objects" or sudden, unmodeled fragmentation events. 

This project tackles the **"Needle in a Haystack" problem** of orbital prediction. Standard predictive models (like LSTMs) often fail to detect sudden collisions because 99% of orbital data is nominal, leading to severe data imbalance. 

To solve this, this pipeline utilizes an **Unsupervised Autoencoder**. Instead of predicting *where* the satellite will be, the AI learns a compressed blueprint of a "peaceful orbit." When fed telemetry from a perturbed or destroyed satellite, the Autoencoder fails to compress the data, resulting in a massive **Reconstruction Error** that acts as an automated anomaly tripwire.

## ⚙️ The Pipeline Architecture

1. **Automated Telemetry Ingestion (`fetch_tle.py`):**
   * Interfaces with the Space-Track.org API to securely pull historical Two-Line Element (TLE) sets for specific target objects (e.g., Starlink-34343).
   * Parses raw API strings into structured, chronological Pandas DataFrames.

2. **Physics Baseline Generation (`sgp4_baseline.py`):**
   * Acts as the Ground Truth generator.
   * Utilizes the standard SGP4 propagator to predict a satellite's position at $Time_{t+1}$ based on its telemetry at $Time_t$.
   * Calculates the 3D Euclidean distance (in kilometers) between the pure physics prediction and the actual recorded reality.

3. **Autoencoder Anomaly Detection (`anomaly_detector.py`):**
   * **Feature Engineering:** Isolates critical physical parameters affecting drift, specifically `BSTAR` (Atmospheric Drag), `ECCENTRICITY`, and `INCLINATION`.
   * **Training:** Trains exclusively on historical, nominal orbital data to establish a baseline of "normal" orbital degradation.
   * **Inference & Thresholding:** Evaluates unseen data. Anomalies are flagged dynamically when the Reconstruction Error exceeds a calculated threshold of $Mean + 3\sigma$ (Standard Deviations).

## 📊 Results: The March 29th Fragmentation Event

To validate the PoC, the model was tested against the confirmed fragmentation event of Starlink-34343 (NORAD ID: 64157) on March 29, 2026. 

*INSERT YOUR GRAPH SCREENSHOT HERE: `![Autoencoder Results Graph](link_to_image.png)`*

**Observation:**
* For weeks prior to the event, the Autoencoder perfectly reconstructed the data, keeping the "AI Panic Level" well below the tripwire threshold.
* The exact moment the physical collision altered the satellite's trajectory, the physical math broke down, and the AI's Reconstruction Error violently spiked past the threshold, successfully flagging the anomaly.

## 🛠️ Tech Stack

* **Language:** Python 3.12
* **Orbital Mechanics:** `spacetrack`, `sgp4`
* **Deep Learning:** `TensorFlow`, `Keras` (Dense Autoencoder Architecture)
* **Data & Math:** `Pandas`, `NumPy`, `Scikit-Learn` (MinMaxScaler)
* **Visualization:** `Matplotlib`

## 🔮 Future Scope
Building upon this PoC, future iterations could include:
* **Multi-Spectral Sensor Fusion:** Integrating ground-based radar or infrared signatures with the TLE data to cross-verify physical anomalies.
* **Swarm Integration:** Deploying lightweight versions of this Autoencoder to edge devices for decentralized, federated anomaly detection within satellite constellations.