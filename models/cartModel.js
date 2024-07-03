const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({

    userId: { type: mongoose.Schema.ObjectId, ref: "User",required:true },

    products: [{
        productId: { type: mongoose.Schema.ObjectId, ref: "Product" },
        quantity: { type: Number }
    }]
},{
    timestamps:true
})


module.exports = mongoose.model("Cart", cartSchema)
