const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
    is_active: { type: Boolean, default: true }

});

module.exports = mongoose.model("brand", brandSchema) ;
