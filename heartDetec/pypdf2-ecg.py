import re
import PyPDF2
import pickle
import numpy as np
import pandas as pd
from google.cloud import storage
import sys
from dotenv import dotenv_values

config = dotenv_values("config.env")

key_path = "tokyo_silicon_379808b9b938fc0c90.json"
client = storage.Client.from_service_account_json(json_credentials_path=key_path)
# Get the PDF file path from the command line arguments
pdf_name = sys.argv[1]
bucketName = config["GCP_BUCKET_NAME"]  
bucket = storage.Bucket(client, bucketName)
blob = bucket.blob(pdf_name)
blob.download_to_filename("resources/bufferFile/ecg.pdf")

def extract_parameter_values_from_pdf(pdf_path):
    parameter_values = {}

    with open(pdf_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        num_pages = len(reader.pages)

        for page_num in range(num_pages):
            page = reader.pages[page_num]
            text = page.extract_text()

            # Extract parameter values using regex
            pattern = r"(\b(?:Age|Sex|CP|TrestBps|Chol|Fbs|RestECG|Thalach|Exang|Oldpeak|Slope|CA|Thal)\b)[\s:]+(.*?)\s*$"
            matches = re.findall(pattern, text, re.MULTILINE)
            for match in matches:
                parameter = match[0].lower()
                value = match[1]
                parameter_values[parameter] = value

    dict = {"Age": "age", "Sex": "sex", "CP": "cp", "TrestBps": "trestbps", "Chol": "chol", "Fbs": "fbs",
            "RestECG": "restecg", "Thalach": "thalach", "Exang": "exang", "Oldpeak": "oldpeak", "Slope": "slope",
            "CA": "ca", "Thal": "thal"}

    new_dict = {dict.get(key, key): value for key, value in parameter_values.items()}

    values_to_keep = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
    new_data = {key: new_dict[key] for key in values_to_keep if key in new_dict}
    sex_map = {'Male': 0, 'Female': 1}
    new_dict = {key: sex_map[value] if key == 'sex' and value in sex_map else value for key, value in new_data.items()}

    x = np.array(list(new_dict.values())).reshape(1, -1)
    np.set_printoptions(suppress=True)

    return x

# Load the trained model from the pickle file
with open('heartDetec/heart_model.pkl', 'rb') as file:
    loaded_model = pickle.load(file)

# Define feature names
feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']



pdf_path = "resources/bufferFile/ecg.pdf"
# result = extract_parameter_values_from_pdf(pdf_path)
# Take input as a NumPy array with feature names
input_data = extract_parameter_values_from_pdf(pdf_path) # Modify the array input as needed
input_data_df = pd.DataFrame(input_data, columns=feature_names)

# Make prediction using the loaded model
prediction = loaded_model.predict(input_data_df)

if prediction[0] == 0:
    print('The person has a Healthy Heart')
else:
    print('The person may face Heart Problems')
