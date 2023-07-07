import pickle
import numpy as np
import sys



# "WBC","RBC","HGB","HCT","MCV","MCH","MCHC","PLT1","NE","LY","MO","EO"
x = np.array(sys.argv[1:], dtype=float).reshape(1, -1)

# Load the decision tree model
with open('AnemiaDetec/anaemia_steps.pkl', 'rb') as file:
    dec_tree = pickle.load(file)

# Predict using the loaded decision tree model
y_pred = dec_tree.predict(x)
output = "The patient may have Anemia" if y_pred == 1 else "The patient is Normal"
print(output)
