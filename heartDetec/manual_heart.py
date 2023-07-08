import numpy as np
import pandas as pd
import sys
import joblib

# Take input as a NumPy array with feature names
x = np.array(sys.argv[1:], dtype=float).reshape(1, -1)

# Load the trained model from the joblib file
loaded_model = joblib.load('heartDetec/heart_model.pkl')

# Make prediction using the loaded model
prediction = loaded_model.predict(x)

if prediction[0] == 0:
    print('The person has a Healthy Heart')
else:
    print('The person may face Heart Problems')
