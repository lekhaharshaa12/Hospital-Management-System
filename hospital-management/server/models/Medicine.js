const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
