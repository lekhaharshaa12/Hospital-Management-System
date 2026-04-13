const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get assigned appointments for the doctor
router.get('/my-appointments', auth(['doctor']), async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user.id, status: 'scheduled' })
            .populate('patient');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Prescribe medicines and update patient history
router.post('/prescribe/:appointmentId', auth(['doctor']), async (req, res, next) => {
    const { observation, medicines } = req.body; // medicines: [{id, quantity, dosage}]
    if (!observation || !medicines || !medicines.length) {
        return res.status(400).json({ message: 'Observation and medicines are required' });
    }
    try {
        const appointment = await Appointment.findById(req.params.appointmentId).populate('patient');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // 1. Update Patient History
        const patient = await Patient.findById(appointment.patient._id);
        const historyEntry = {
            doctor: req.user.id,
            observation,
            medicines: await Promise.all(medicines.map(async m => {
                const med = await Medicine.findById(m.id);
                if (!med) throw new Error(`Medicine not found: ${m.name || m.id}`);
                return { name: med.name, dosage: m.dosage };
            }))
        };
        patient.history.push(historyEntry);
        await patient.save();

        // 2. Create Bill (Pending status by default)
        let totalAmount = 0;
        const billItems = await Promise.all(medicines.map(async m => {
            const med = await Medicine.findById(m.id);
            if (!med) throw new Error(`Medicine not found: ${m.name || m.id}`);
            
            totalAmount += med.price * m.quantity;
            return { medicine: med._id, quantity: m.quantity, price: med.price };
        }));

        const bill = new Bill({
            patient: patient._id,
            appointment: appointment._id,
            items: billItems,
            totalAmount
        });
        await bill.save();

        // 3. Complete Appointment
        appointment.status = 'completed';
        await appointment.save();

        res.json({ message: 'Prescription saved and bill generated', bill });
    } catch (err) {
        next(err);
    }
});

// Toggle availability
router.patch('/availability', auth(['doctor']), async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isAvailable = !user.isAvailable;
        await user.save();
        res.json({ isAvailable: user.isAvailable });
    } catch (err) {
        next(err);
    }
});

// Update personal profile (Doctor only)
router.put('/profile', auth(['doctor']), async (req, res, next) => {
    const { name, qualification, specialization } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (name) user.name = name;
        if (qualification) user.qualification = qualification;
        if (specialization) user.specialization = specialization;
        
        await user.save();
        res.json({ message: 'Profile updated successfully', user: { name: user.name, qualification: user.qualification, specialization: user.specialization } });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
