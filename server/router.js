const express = require('express');
const route = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
let anemia_Database = require('./anemiaSchema.js');
let fracture_Database = require('./fractureSchema.js');
let tumor_Database = require('./TumorSchema.js');
let heartAttack_Database = require('./heartAttackSchema.js')
let userProfile_Database = require('./userProflieSchema.js');
const multer = require('multer');
const {
  Storage
} = require('@google-cloud/storage');
const pythonProcess = require('./pythonController.js');
const authController = require('./authenticationController.js');
const {
  requireAuth
} = require('./authMiddleware.js');

const dotenv = require('dotenv');
dotenv.config({
  path: 'config.env'
});
const port = process.env.PORT;
const ip = process.env.IP;
const gcpProId = process.env.GCP_PROID;
const gcpBucketName = process.env.GCP_BUCKET_NAME;
const secretJwtKey = process.env.SECRET_JWT_KEY;



// Setting up multer and GCP bucket
const upload = multer({
  storage: multer.memoryStorage(),
});

const storage = new Storage({
  projectId: gcpProId,
  keyFilename: 'tokyo_silicon_379808b9b938fc0c90.json',
});
const bucket = storage.bucket(gcpBucketName);







//*****************************************************Page Render*************************************************
route.get('/', (req, res) => {
  res.render('home.ejs');
});




route.get('/aboutUs', (req, res) => {
  res.render('aboutUs.ejs');
})




// IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII COLLECTION PAGE IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII






route.get('/user-collection', requireAuth, async (req, res) => {


  try {

    const jwtToken = req.cookies.jwt;
    let userId;
    if (jwtToken) {

      const decodedToken = jwt.verify(jwtToken, secretJwtKey);


      console.log('Decoded Token inside API: ' + decodedToken);


      userId = decodedToken.id;
      console.log("user ID ki values: " + userId);
    }

    const fractureImageNames = await fracture_Database.find({
      UserId: userId
    });


    const fractureSignedURLs = await Promise.all(
      fractureImageNames.map(async (image) => {
        const [signedURL] = await bucket.file(image.Imagename).getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

        return {
          signedURL,
          comment: image.comment,
          output: image.output,
          uniqueID: image._id
        };
      })
    );

    // -----------------------------

    const anemiaFileNames = await anemia_Database.find({
      UserId: userId
    });


    const anemiaSignedURLs = await Promise.all(
      anemiaFileNames.map(async (image) => {
        const [signedURL] = await bucket.file(image.Imagename).getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

        return {
          signedURL,
          comment: image.comment,
          output: image.output,
          uniqueID: image._id
        };
      })
    );

    // ------------------------------------

    const heartFileNames = await heartAttack_Database.find({
      UserId: userId
    });


    const heartSignedURLs = await Promise.all(
      heartFileNames.map(async (image) => {
        const [signedURL] = await bucket.file(image.Imagename).getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

        return {
          signedURL,
          comment: image.comment,
          output: image.output,
          uniqueID: image._id
        };
      })
    );

    //----------------------------------

    const tumorFileNames = await tumor_Database.find({
      UserId: userId
    });


    const tumorSignedURLs = await Promise.all(
      tumorFileNames.map(async (image) => {
        const [signedURL] = await bucket.file(image.Imagename).getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

        return {
          signedURL,
          comment: image.comment,
          output: image.output,
          uniqueID: image._id
        };
      })
    );







    res.render('collections.ejs', {
      fractureSignedURLs,
      anemiaSignedURLs,
      heartSignedURLs,
      tumorSignedURLs
    });

  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).send('Internal Server Error');
  }


});












// ******************************************************API***********************************************************
route.post('/api/uploadImage', upload.single('file'), async (req, res, next) => {

  console.log("Inside /api/uploadImage");
  try {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    if (!req.file) {
      const error = new Error('Please choose files');
      error.httpStatusCode = 400;
      return next(error);
    }


    const jwtToken = req.cookies.jwt;
    let userId;
    if (jwtToken) {

      const decodedToken = jwt.verify(jwtToken, secretJwtKey);


      console.log('Decoded Token inside API: ' + decodedToken);


      userId = decodedToken.id;
      console.log("user ID ki values: " + userId);
    }



    const selectedOption = req.body.option;
    console.log(selectedOption);








    // %%%%%%%%%%%%%%%%%%%%% FRACTURE START %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    if (selectedOption === "Fracture") {

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      const gcBucketFileName = Date.now() + '_' + req.file.originalname;
      const gcBucketFile = bucket.file(gcBucketFileName);
      const stream = gcBucketFile.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on('error', (err) => {
        console.error(err);
        res.status(500).send('Error uploading file.');
      });


      stream.on('finish', async () => {

        const newImgToLoad = new fracture_Database({
          comment: req.body.comment,
          Imagename: gcBucketFileName,
          image: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          },
          output: "",
          UserId: userId
        });

        const data = await newImgToLoad.save();
        console.log("Data Saved in ImageDB");




        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~    

        const response = await axios.get(`${ip}${port}/fracture-Processing-result/${data._id}`);
        console.log(response.data);
        const updatedData = await fracture_Database.findByIdAndUpdate(data._id, {
          output: response.data
        }, {
          new: true
        });
        console.log("Data updated!!");

        const finalData = await axios.get(`${ip}${port}/api/fractureImage?id=${data._id}`);
        console.log("Got final data: ", finalData.data.comment);
        let resultImage = 'kuch bhi';
        let resultString = '';
        if (finalData.data.output.includes('No fracture is detected')) {
          resultImage = 'images/green-tick.png';
          resultString = "No Fracture Detected";
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          const newupdatedData = await fracture_Database.findByIdAndUpdate(data._id, {
            output: resultString
          }, {
            new: true
          });
          const userName = await userProfile_Database.findById(data.UserId);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });
        } else if (finalData.data.output.includes('Fracture is present')) {
          resultImage = 'images/red-tick.png';
          resultString = "Fracture Detected";
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          const newupdatedData = await fracture_Database.findByIdAndUpdate(data._id, {
            output: resultString
          }, {
            new: true
          });
          const userName = await userProfile_Database.findById(data.UserId);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });
        } else {
          resultImage = 'images/questionMark.jpg';
          resultString = 'Invalid file/image type!';
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          await gcBucketFile.delete();
          console.log(`File ${gcBucketFileName} deleted Successfully!`);
          const userName = await userProfile_Database.findById(data.UserId);
          const deleteData = await fracture_Database.findByIdAndDelete(data._id);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });
        }




      });

      stream.end(req.file.buffer);

    }
    // %%%%%%%%%%%%%%%%%%%%% FRACTURE END %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%





    // %%%%%%%%%%%%%%%%%%%%% TUMOR START %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    else if (selectedOption === "Tumor") {
      console.log("Working before bucket call");
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      const gcBucketFileName = Date.now() + '_' + req.file.originalname;
      const gcBucketFile = bucket.file(gcBucketFileName);
      const stream = gcBucketFile.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on('error', (err) => {
        console.error(err);
        res.status(500).send('Error uploading file.');
      });


      stream.on('finish', async () => {

        const newImgToLoad = new tumor_Database({
          comment: req.body.comment,
          Imagename: gcBucketFileName,
          image: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          },
          output: "",
          UserId: userId
        });

        const data = await newImgToLoad.save();
        console.log("Data Saved in ImageDB");


        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



        const response = await axios.get(`${ip}${port}/tumor-Processing-result/${data._id}`);
        console.log(response.data);

        const updatedData = await tumor_Database.findByIdAndUpdate(data._id, {
          output: response.data
        }, {
          new: true
        });
        console.log("Data updated!!");

        const finalData = await axios.get(`${ip}${port}/api/tumorImage?id=${data._id}`);

        console.log("Got final data: ", finalData.data.comment);
        let resultImage = 'kuch nhi';
        let resultString = '';
        if (finalData.data.output.includes('no_tumor')) {
          resultImage = 'images/green-tick.png';
          resultString = 'No Tumor Detected';
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          const newupdatedData = await tumor_Database.findByIdAndUpdate(data._id, {
            output: resultString
          }, {
            new: true
          });
          const userName = await userProfile_Database.findById(data.UserId);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });
        } else if (finalData.data.output.includes('glioma_tumor')) {
          resultImage = 'images/red-tick.png';
          resultString = 'Glioma Tumor Detected';
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          const newupdatedData = await tumor_Database.findByIdAndUpdate(data._id, {
            output: resultString
          }, {
            new: true
          });
          const userName = await userProfile_Database.findById(data.UserId);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });

        } else if (finalData.data.output.includes('meningioma_tumor')) {
          resultImage = 'images/red-tick.png';
          resultString = 'Meningioma Tumor Detected';
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          const newupdatedData = await tumor_Database.findByIdAndUpdate(data._id, {
            output: resultString
          }, {
            new: true
          });
          const userName = await userProfile_Database.findById(data.UserId);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });

        } else if (finalData.data.output.includes('pituitary_tumor')) {
          resultImage = 'images/red-tick.png';
          resultString = 'Pituitary Tumor Detected';
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          const newupdatedData = await tumor_Database.findByIdAndUpdate(data._id, {
            output: resultString
          }, {
            new: true
          });
          const userName = await userProfile_Database.findById(data.UserId);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });

        } else {
          resultImage = 'images/questionMark.jpg';
          resultString = 'Invalid file/image type!';
          console.log("String value: ", resultString);
          console.log("Result Image value: ", resultImage);
          const userName = await userProfile_Database.findById(data.UserId);
          await gcBucketFile.delete();
          console.log(`File ${gcBucketFileName} deleted Successfully!`);
          const deleteData = await tumor_Database.findByIdAndDelete(data._id);
          res.render('resultOutput.ejs', {
            name: userName.name,
            resultImage: resultImage,
            resultString: resultString,
            portName: port,
            ipAddress: ip
          });
        }




      });

      stream.end(req.file.buffer);
    }

    // %%%%%%%%%%%%%%%%%%%%% TUMOR END %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occured while creating a create operation"
    })
  }
});




route.get('/api/anemiaFile', async (req, res) => {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const data = await anemia_Database.findById(id);
      if (!data) {
        res.status(400).send({
          message: "Not found user with id " + id
        });
      } else {

        res.send(data);
      }
    } else {
      const info = await anemia_Database.find();
      res.send(info);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving User Information"
    });
  }
});


route.get('/api/fractureImage', async (req, res) => {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const data = await fracture_Database.findById(id);
      if (!data) {
        res.status(400).send({
          message: "Not found user with id " + id
        });
      } else {

        res.send(data);
      }
    } else {
      const info = await fracture_Database.find();
      res.send(info);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving User Information"
    });
  }
});





route.get('/api/TumorImage', async (req, res) => {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const data = await tumor_Database.findById(id);
      if (!data) {
        res.status(400).send({
          message: "Not found user with id " + id
        });
      } else {

        res.send(data);
      }
    } else {
      const info = await tumor_Database.find();
      res.send(info);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving User Information"
    });
  }
});




route.get('/api/heartAttackFile', async (req, res) => {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const data = await heartAttack_Database.findById(id);
      if (!data) {
        res.status(400).send({
          message: "Not found user with id " + id
        });
      } else {

        res.send(data);
      }
    } else {
      const info = await heartAttack_Database.find();
      res.send(info);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving User Information"
    });
  }
});






//Manual Entries -----------------------------------------------------
route.post('/api/manual/UploadData', async (req, res) => {

  try {

    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    const selectedOption = req.body.condition;

    if (selectedOption == 'anemia') {
      const {
        anemia_hemoglobin,
        anemia_rbc,
        anemia_hematocrit,
        anemia_wbc,
        anemia_neutrophils,
        anemia_lymphocytes,
        anemia_monocytes,
        anemia_eosinophils,
        anemia_platelet,
        anemia_mcv,
        anemia_mch,
        anemia_mchc
      } = req.body;

      const Data = await axios.get(`${ip}${port}/anemia-manual-Processing-result`, {
        params: {
          anemia_hemoglobin,
          anemia_rbc,
          anemia_hematocrit,
          anemia_wbc,
          anemia_neutrophils,
          anemia_lymphocytes,
          anemia_monocytes,
          anemia_eosinophils,
          anemia_platelet,
          anemia_mcv,
          anemia_mch,
          anemia_mchc
        }
      });
      console.log("Manual Data mil gaya: ", Data.data);
      let resultImage = 'kuch nhi';
      let resultString = '';
      if (Data.data.includes('The patient is Normal')) {
        resultImage = 'images/green-tick.png';
        resultString = 'No Anemia Detected';
        console.log("String value: ", resultString);
        console.log("Result Image value: ", resultImage);


        res.render('resultOutput.ejs', {
          name: "null",
          resultImage: resultImage,
          resultString: resultString,
          portName: port,
          ipAddress: ip
        });
      } else if (Data.data.includes('The patient may have Anemia')) {
        resultImage = 'images/red-tick.png';
        resultString = 'Anemia Detected';
        console.log("String value: ", resultString);
        console.log("Result Image value: ", resultImage);

        res.render('resultOutput.ejs', {
          name: "null",
          resultImage: resultImage,
          resultString: resultString,
          portName: port,
          ipAddress: ip
        });

      } else {
        resultImage = 'images/questionMark.jpg';
        resultString = 'Invalid values!';
        console.log("String value: ", resultString);
        console.log("Result Image value: ", resultImage);

        res.render('resultOutput.ejs', {
          name: "null",
          resultImage: resultImage,
          resultString: resultString,
          portName: port,
          ipAddress: ip
        });
      }
    } else if (selectedOption == 'heart') {
      const {
        heart_gender,
        heart_age,
        heart_chestpain,
        heart_restbp,
        heart_chol,
        heart_fbp,
        heart_restecg,
        heart_thalach,
        heart_exang,
        heart_oldpeak,
        heart_slope,
        heart_ca,
        heart_thal
      } = req.body;


      const Data = await axios.get(`${ip}${port}/heartAttack-manual-Processing-result`, {
        params: {
          heart_gender,
          heart_age,
          heart_chestpain,
          heart_restbp,
          heart_chol,
          heart_fbp,
          heart_restecg,
          heart_thalach,
          heart_exang,
          heart_oldpeak,
          heart_slope,
          heart_ca,
          heart_thal
        }
      });
      console.log("Manual Data mil gaya: ", Data.data);
      let resultImage = 'kuch nhi';
      let resultString = '';
      if (Data.data.includes('The person has a Healthy Heart')) {
        resultImage = 'images/green-tick.png';
        resultString = 'Healthy Heart';
        console.log("String value: ", resultString);
        console.log("Result Image value: ", resultImage);


        res.render('resultOutput.ejs', {
          name: "null",
          resultImage: resultImage,
          resultString: resultString,
          portName: port,
          ipAddress: ip
        });
      } else if (Data.data.includes('he person may face Heart Problems')) {
        resultImage = 'images/red-tick.png';
        resultString = 'HeartAttack Risk';
        console.log("String value: ", resultString);
        console.log("Result Image value: ", resultImage);

        res.render('resultOutput.ejs', {
          name: "null",
          resultImage: resultImage,
          resultString: resultString,
          portName: port,
          ipAddress: ip
        });

      } else {
        resultImage = 'images/questionMark.jpg';
        resultString = 'Invalid values!';
        console.log("String value: ", resultString);
        console.log("Result Image value: ", resultImage);

        res.render('resultOutput.ejs', {
          name: "null",
          resultImage: resultImage,
          resultString: resultString,
          portName: port,
          ipAddress: ip
        });
      }




    }












  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while retrieving User Information"
    });
  }

});









// ************************************* PYTHON PROCESS *******************************************************


route.get('/fracture-Processing-result/:id', pythonProcess.fracture_Process);
route.get('/tumor-Processing-result/:id', pythonProcess.tumor_Process);


route.get('/anemia-manual-Processing-result', pythonProcess.anemia_Process_manual);
route.get('/heartAttack-manual-Processing-result', pythonProcess.heartAttack_Process_manual);



//*******************************************AUTHENTICATION*************************************************** */

//rendering signup page
route.get('/signup', authController.signup_get);

// Add to database
route.post('/signup', authController.signup_post);

//Render Login Page
route.get('/login', authController.login_get);

// Add to database
route.post('/login', authController.login_post);

//Logout
route.get('/logout', authController.logout_get);



// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ CRUD ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

route.get("/crud/delete-fracture-collection/:id", async (req, res) => {
  try {

    const id = req.params.id;
    const deleteData = await fracture_Database.findByIdAndDelete(id);

    const gcBucketFile = bucket.file(deleteData.Imagename);
    await gcBucketFile.delete();

    res.redirect("/user-collection");

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while deleting fracture collection"
    });
  }
});


route.get("/crud/delete-anemia-collection/:id", async (req, res) => {
  try {

    const id = req.params.id;
    const deleteData = await anemia_Database.findByIdAndDelete(id);

    const gcBucketFile = bucket.file(deleteData.Imagename);
    await gcBucketFile.delete();

    res.redirect("/user-collection");

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while deleting fracture collection"
    });
  }
});



route.get("/crud/delete-heart-collection/:id", async (req, res) => {
  try {

    const id = req.params.id;
    const deleteData = await heartAttack_Database.findByIdAndDelete(id);

    const gcBucketFile = bucket.file(deleteData.Imagename);
    await gcBucketFile.delete();

    res.redirect("/user-collection");

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while deleting fracture collection"
    });
  }
});




route.get("/crud/delete-tumor-collection/:id", async (req, res) => {
  try {

    const id = req.params.id;
    const deleteData = await tumor_Database.findByIdAndDelete(id);

    const gcBucketFile = bucket.file(deleteData.Imagename);
    await gcBucketFile.delete();

    res.redirect("/user-collection");

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occured while deleting fracture collection"
    });
  }
});






module.exports = route;