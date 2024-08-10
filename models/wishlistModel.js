const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { type: String, required: true },

    products: [{
        productId: { type: mongoose.Schema.ObjectId, ref: "Product" },
        quantity: { type: Number }
    }]
})


module.exports = mongoose.model('Wishlist', wishlistSchema);