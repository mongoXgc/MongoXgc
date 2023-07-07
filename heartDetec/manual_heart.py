import pickle
import numpy as np
import pandas as pd
import sys

# Take input as a NumPy array with feature names
#input_data = np.array([[63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1]])  # Modify the array input as needed
x = np.array(sys.argv[1:], dtype=float).reshape(1, -1)
# Load the trained model from the pickle file
with open('heartDetec/heart_model.pkl', 'rb') as file:
    loaded_model = pickle.load(file)

# Make prediction using the loaded model
prediction = loaded_model.predict(x)

if prediction[0] == 0:
    print('The person has a Healthy Heart')
else:
    print('The person may face Heart Problems')