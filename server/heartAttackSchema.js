const mongoose = require('mongoose');

const HeartAttackSchema = mongoose.Schema({
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

const HeartAttackDB = mongoose.model('HeartAttackCollection', HeartAttackSchema);

module.exports = HeartAttackDB;