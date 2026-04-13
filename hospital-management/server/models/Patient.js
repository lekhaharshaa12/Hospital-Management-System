const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contact: { type: String, required: true },
    history: [{
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
        observation: String,
        medicines: [{
            name: String,
            dosage: String
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
