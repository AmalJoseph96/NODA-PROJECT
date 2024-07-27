const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userId:{type:mongoose.Schema.ObjectId,ref:'User'},
    products:[{
        productId:{type:mongoose.Schema.ObjectId,ref:"Product"},
        quantity:{type:Number}
    }],

    addressId:{
       type:mongoose.Schema.ObjectId,
       ref:"Address"
    },
    orderId:{type:String},
    paymentMethod:{type:String,required:true},
    paymentStatus:{type:String,enum:['Pending','Received','Failed','Refund'],default:"Pending"},
    orderStatus:{type:String,enum:['Order Placed','Confirmed','Shipped','Delivered','Cancelled','Returned','Pending'],default:"Order Placed"},
    orderDate:{type:Date,default:Date.now},
    totalAmount:{type:String},


},{
    timestamps:true
})

module.exports = mongoose.model("Order",orderSchema);