const mongoose = require('mongoose');

const fractureSchema = mongoose.Schema({
    comment:{
    type :String,
   
    },
    Imagename :{
        type:String,
        required:true
    },
    image:{
        data:Buffer,
        contentType: String
    },
    output: {
        type:String
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDetails' 
      },
});

const fractureDB = mongoose.model('fractureCollection', fractureSchema);

module.exports = fractureDB;