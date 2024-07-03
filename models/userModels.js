const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        

    },
    password: {
        type: String,
        
    },
    is_admin: {
        type: Boolean,
        default: false

    },
    isActive: {
        type: Boolean,
        default: true
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);