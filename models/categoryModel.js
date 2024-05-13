const mongoose = require('mongoose') ;

const categorySchema = new mongoose.Schema({

    categoryName : {
        type:String,
        required:true
      },
      is_active:{
        type:Boolean,
        
      },
      description:{
        type:String,
        required:true
      }

})

module.exports = mongoose.model("category",categorySchema);
