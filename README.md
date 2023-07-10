# main
website hosted on :  
# Introduction
Diagnocentre is an medical/health related web application, which provides wide range of functionalites for diagnosing different types of health related information based on user's input, which can be image or report information.
Currently following types can be diagnosed: 
1) Anemia
2) Fracture
3) Heart Attack
4) Tumor

# Program file structure
Folders and files are already provided in an structured way. 
*NOTE* You have to add command "npm i" or "npm install" before running the program in your local environment.
Only use this command once on every installation of the given program.
*NOTE* You should create a new file named as "config.env" and create 6 variables named as "PORT", "IP", "MONGO_URI", "GCP_PROID", "GCP_BUCKET_NAME" and "SECRET_JWT_KEY".
The "PORT" variable will consist the port number that you will provide, "ID" variable will contain address of application, "MONGO_URI" variable will contain your personal link String for mongoDB connection, "GCP_PROID" will contain your google cloud platform project id, "GCP_BUCKET_NAME" will consist of your bucket name and finally "SECRET_JWT_KEY" variable will contain any random string that you want to set for token validation process used in authentication.
*NOTE* Add your gcp service account key in the main repository(Json format file).

# Working Condition
This web application is fully functional and after each successfull diagnose, all your data are stored in this application as well. 
Any user can access/delete there stored data from collections which is linked through user's profile name.

# How application works
1. Once the user lands on default page aka 'HOME' page, a button "Get Diagnosed" will be shownup. On clicking the button user will be taken to a section where different types of options for diagnosis are present, i.e 'Fracture detection' , 'Anemia Detection'.
2. Once selecting the preferred option user will be redirected to an different page where a form will be present. 
3. On filling the form completely and by selecting provided options from the drop-down, user can process the information by submitting the form.
4. After few seconds result will be displayed, whether the result is positive, negative or an exception case where file/image format provided by user are wrong or unreadable.

# Technologies Used
1. IDE used: VScode, PyCharm
2. Front-End: Html,Css,Tailwind Css, Javascript
3. Back-End: Nodejs, Express, MongoDB
4. Back-End Machine Model: Python
5. Hosting: Google Cloud Platform

# NPM Packages Used
1. Express: Express is a popular web framework for Node.js that provides a set of tools and features for building web applications and APIs. It simplifies the process of handling requests and responses, routing, and middleware integration.
2. Dotenv: Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. This is useful for keeping sensitive information like API keys, passwords, and database credentials outside of the codebase and accessible only by authorized users.
3. Morgan: Morgan is a middleware for Express that logs HTTP requests and responses. It can be configured to write logs to the console or a file, and to display additional information such as response time and status codes.
4. Path: Path is a built-in module in Node.js that provides utilities for working with file paths. It can be used to resolve and manipulate file paths in a platform-independent way.
5. Method-override: Method-override is a middleware for Express that allows clients to override the HTTP method used for a request. This is useful for working with web browsers that don't support PUT and DELETE methods, and for implementing RESTful APIs.
6. Axios: Axios is a popular promise-based HTTP client for Node.js and the browser. It simplifies the process of making HTTP requests and handling responses, and provides features like request and response interception, data transformation, and error handling.
7. Multer: Multer is a middleware for Express that handles file uploads. It can be used to process file uploads from HTML forms, AJAX requests, and other sources.
8. Child_process: Child_process is a built-in module in Node.js that provides utilities for spawning child processes. It can be used to execute external programs or scripts, and to communicate with them through stdin, stdout, and stderr streams.
9. Ejs: Ejs is a popular template engine for Node.js that can be used to generate HTML markup dynamically. It provides a simple syntax for embedding JavaScript code in HTML templates, and supports features like partials, conditionals, and loops.

# Python Packages Used
1. NumPy: NumPy is a popular numerical computing library for Python that provides support for multi-dimensional arrays and matrices, along with a range of mathematical functions for working with them. It is often used in scientific computing, data analysis, and machine learning.
2. PIL: PIL (Python Imaging Library) is a library for opening, manipulating, and saving many different image file formats. It provides a range of image processing capabilities, such as resizing, cropping, color balancing, and filtering.
3. keras.model: keras.model is a module within the Keras deep learning library that provides a high-level API for building and training deep neural networks. It includes a range of pre-built layers and models, along with tools for loading and saving trained models.
4. sys: sys is a built-in module in Python that provides access to system-specific functionality, such as command line arguments, the standard input/output streams, and the current platform.
5. pickle: pickle is a module in Python that provides a way to serialize and deserialize Python objects. It allows you to store complex data structures and objects as a binary file, which can be loaded back into memory later. This is useful for applications that need to store data for long periods of time, or for sending data over a network.
