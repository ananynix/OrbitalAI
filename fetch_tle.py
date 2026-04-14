import pandas as pd
from spacetrack import SpaceTrackClient
import getpass
import json  # <--- We need this to parse the raw text

# 1. Authenticate with Space-Track
print("Authenticating...")
st_user = 'ananynix@gmail.com' 
st_pass = getpass.getpass("Enter your Space-Track Password: ")
st = SpaceTrackClient(identity=st_user, password=st_pass)

# 2. Fetch the Data
target_id = 64157
print(f"Fetching historical TLE data for object {target_id}...")

# The spacetrack library returns a raw string when format='json'
raw_data = st.gp_history(norad_cat_id=target_id, orderby='EPOCH desc', limit=200, format='json')

# 3. Load into Pandas for ML processing
try:
    # Convert the JSON string into a Python list of dictionaries
    parsed_data = json.loads(raw_data)
    
    # Now Pandas can build the table properly
    df = pd.DataFrame(parsed_data)
    
    # 4. Filter down to the essential columns for your ML baseline
    columns_to_keep = ['EPOCH', 'INCLINATION', 'ECCENTRICITY', 'BSTAR', 'TLE_LINE1', 'TLE_LINE2']
    # Safety check to only keep columns that actually exist
    existing_cols = [c for c in columns_to_keep if c in df.columns]
    df = df[existing_cols]
    
    print(f"\n✅ Successfully loaded {len(df)} orbital records for NORAD ID {target_id}.")
    print(df.head())
    
except Exception as e:
    print(f"\n❌ Failed to build DataFrame. Error: {e}")

# Save the cleaned data to a CSV file for the next script to use
df.to_csv("starlink_64157_history.csv", index=False)
print("💾 Saved to starlink_64157_history.csv")