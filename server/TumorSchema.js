const mongoose = require('mongoose');

const TumorSchema = mongoose.Schema({
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

const TumorDB = mongoose.model('TumorCollection', TumorSchema);

module.exports = TumorDB;