const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    mobile: { type: Number, required: true }
},{
    timestamps:true
})

module.exports = mongoose.model("Address", addressSchema);