const mongoose=require("mongoose")


const productSchema= mongoose.Schema({
    title:{type:String,required:true},
    brand:{type:mongoose.Schema.Types.ObjectId,ref:'brand'},
    description:{type:String,required:true},
    weight:{type:Number},
    shape:{type:String},
    color:{type:String},
    category:{type: mongoose.Schema.Types.ObjectId,ref:'category'},
    date:{type:Date,default:Date.now},
    regularprice:{type:Number,required:true},
    salesprice:{type:Number,required:true},
    image:[{type:String}],
    tags:{type:String},
    is_active:{type:Boolean,default:true},
    quantity:{type:Number,default:0},
    cat_status:{type:Boolean,default:0},
    brand_status:{type:Boolean,default:0}
   
})



module.exports=mongoose.model("Product",productSchema)