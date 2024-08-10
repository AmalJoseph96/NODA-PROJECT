const mongoose = require('mongoose') ;

const categorySchema = new mongoose.Schema({

    categoryName : {
        type:String,
        required:true,
        uppercase: true 
      },
      is_active:{
        type:Boolean,
        default:true,
        required:true
        
      },
      description:{
        type:String,
       
      }

},{
  timestamps:true
})

module.exports = mongoose.model("Category",categorySchema);
