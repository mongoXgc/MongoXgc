const {spawn} = require('child_process');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({path: 'config.env'});
const port = process.env.PORT;
const ip = process.env.IP;







  module.exports.fracture_Process = async (req, res) => {
    try {
      const id = req.params.id;
      let imgPath;
      const data = await axios.get(`${ip}${port}/api/fractureImage?id=${id}`);
      console.log(data.data.Imagename);
      imgPath = `${data.data.Imagename}`;  // File name
  
      const pythonScriptPath ='FracDetec/fractdetec.py';

      const pythonProcess = spawn('python3', [pythonScriptPath, imgPath]);
  
      let output = '';
  
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
  
      pythonProcess.on('close', async (code) => {
        console.log(`Python script exited with code ${code}`);
  
        res.send(output);
      });
    } catch (err) {
      console.log(err);
    }
  }



  module.exports.tumor_Process = async (req, res) => {
    try {
      const id = req.params.id;
      let imgPath;
      const data = await axios.get(`${ip}${port}/api/tumorImage?id=${id}`);
      console.log(data.data.Imagename);
      imgPath = `${data.data.Imagename}`;  // File name
  
      const pythonScriptPath ='TumorDetec/brain_tumor.py';

      const pythonProcess = spawn('python3', [pythonScriptPath, imgPath]);
  
      let output = '';
  
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
  
      pythonProcess.on('close', async (code) => {
        console.log(`Python script exited with code ${code}`);
  
        res.send(output);
      });
    } catch (err) {
      console.log(err);
    }
  }





  module.exports.anemia_Process_manual = async (req, res) => {
    try {
    
      const {anemia_hemoglobin , anemia_rbc ,anemia_hematocrit, anemia_wbc, anemia_neutrophils, anemia_lymphocytes, anemia_monocytes, anemia_eosinophils, anemia_platelet, anemia_mcv,anemia_mch,anemia_mchc} = req.query;

   
      const pythonScriptPath = 'AnemiaDetec/manual_anemia.py';
      const pythonProcess = spawn('python3', [pythonScriptPath, anemia_wbc, anemia_rbc ,anemia_hemoglobin , anemia_hematocrit,  anemia_mcv, anemia_mch, anemia_mchc ,anemia_platelet ,anemia_neutrophils, anemia_lymphocytes, anemia_monocytes, anemia_eosinophils ]);
  
      let output = '';
  
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
  
      pythonProcess.on('close', async (code) => {
        console.log(`Python script exited with code ${code}`);
  
        res.send(output);
      });
    } catch (err) {
      console.log(err);
    }
  }







  module.exports.heartAttack_Process_manual = async (req, res) => {
    try {
    
      const {heart_gender, heart_age, heart_chestpain, heart_restbp, heart_chol, heart_fbp, heart_restecg, heart_thalach, heart_exang, heart_oldpeak, heart_slope, heart_ca, heart_thal} = req.query;

   const pythonScriptPath = 'heartDetec/manual_heart.py';
      const pythonProcess = spawn('python3', [pythonScriptPath, heart_age, heart_gender,  heart_chestpain, heart_restbp, heart_chol, heart_fbp, heart_restecg, heart_thalach, heart_exang, heart_oldpeak, heart_slope, heart_ca, heart_thal]);
  
      let output = '';
  
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
  
      pythonProcess.on('close', async (code) => {
        console.log(`Python script exited with code ${code}`);
  
        res.send(output);
      });
    } catch (err) {
      console.log(err);
    }
  }