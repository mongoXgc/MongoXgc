const mongoose = require('mongoose');

const anemiaSchema = mongoose.Schema({
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

const anemiaDB = mongoose.model('anemiaCollection', anemiaSchema);

module.exports = anemiaDB;