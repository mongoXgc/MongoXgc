import re
import sys
import PyPDF2
import numpy as np
import pickle
from google.cloud import storage
from dotenv import dotenv_values

config = dotenv_values("config.env")


key_path = "pure-silicon-390116-5d3c01f54cc0.json"
client = storage.Client.from_service_account_json(json_credentials_path=key_path)
# Get the PDF file path from the command line arguments
pdf_name = sys.argv[1]
bucketName = config["GCP_BUCKET_NAME"]
bucket = storage.Bucket(client, bucketName)
blob = bucket.blob(pdf_name)
blob.download_to_filename("resources/bufferFile/anemia.pdf")

def extract_parameter_values_from_pdf(pdf_path, parameters):
    parameter_values = {}

    with open(pdf_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        num_pages = len(reader.pages)

        for page_num in range(num_pages):
            page = reader.pages[page_num]
            text = page.extract_text()

            # Remove undefined number of whitespaces
            text = re.sub(r"\s+", " ", text)

            # Extract parameter values using regex
            for parameter, _ in parameters.items():
                pattern = fr"{parameter}\s+((?:\d+\.\d+)|(?:\d+(?!\.)))"
                match = re.search(pattern, text)
                if match:
                    value = float(match.group(1))
                    parameter_values[parameter] = value

    parameter_mapping = {
        "Total WBC Count": "WBC",
        "Total Leukocyte Count (TLC)": "WBC",
        "RBC Count": "RBC",
        "Hemoglobin": "HGB",
        "Haemoglobin": "HGB",
        "Hematocrit": "HCT",
        "PCV": "HCT",
        "Packed Cell Volume (PCV)": "HCT",
        "Platelet Count": "PLT1",
        "Neutrophils": "NE",
        "Lymphocytes": "LY",
        "Monocytes": "MO",
        "Eosinophils": "EO"
    }

    new_dict = {parameter_mapping.get(key, key): value for key, value in parameter_values.items()}
    values_to_keep = ["WBC", "RBC", "HGB", "HCT", "MCV", "MCH", "MCHC", "PLT1", "NE", "LY", "MO", "EO"]
    new_data = {key: new_dict[key] for key in values_to_keep if key in new_dict}

    x = np.array(list(new_data.values())).reshape(1, -1)

    np.set_printoptions(formatter={'float_kind': '{:g}'.format})

    return x


# Usage example
pdf_path = "resources/bufferFile/anemia.pdf"
parameters = {
    'Total WBC Count': '',
    'Total Leukocyte Count (TLC)': '',
    'RBC Count': '',
    'Hemoglobin': '',
    'Haemoglobin': '',
    'Hematocrit': '',
    'PCV': '',
    'Packed Cell Volume (PCV)': '',
    'MCV': '',
    'MCH': '',
    'MCHC': '',
    'Platelet Count': '',
    'Neutrophils': '',
    'Lymphocytes': '',
    'Monocytes': '',
    'Eosinophils': ''
}

# Extract parameter values from the PDF using regex
result = extract_parameter_values_from_pdf(pdf_path, parameters)

# Load the decision tree model with error handling
try:
    with open('AnemiaDetec/anaemia_steps.pkl', 'rb') as file:
        dec_tree = pickle.load(file)
except FileNotFoundError:
    print("Error: Model file 'anaemia_steps.pkl' not found.")
    exit(1)
except Exception as e:
    print("Error loading the model:", str(e))
    exit(1)

# Make predictions
y_pred = dec_tree.predict(result)
output = "The patient may have Anemia" if y_pred == 1 else "The patient is Normal"
print(output)