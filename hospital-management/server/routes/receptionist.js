const express = require('express');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const Bill = require('../models/Bill');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all patients
router.get('/patients', auth(['receptionist', 'admin']), async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add patient
router.post('/add-patient', auth(['receptionist']), async (req, res, next) => {
    const { name, age, gender, contact } = req.body;
    if (!name || !age || !gender || !contact) {
        return res.status(400).json({ message: 'Missing required patient fields' });
    }
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
    } catch (err) {
        next(err);
    }
});

// Get doctors for appointment assignment or availability checks
router.get('/doctors', auth(['receptionist', 'admin', 'doctor']), async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name _id qualification specialization isAvailable');
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Book appointment
router.post('/book-appointment', auth(['receptionist']), async (req, res, next) => {
    const { patient, doctor, date, time } = req.body;
    if (!patient || !doctor || !date || !time) {
        return res.status(400).json({ message: 'Missing appointment details' });
    }
    try {
        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json(appointment);
    } catch (err) {
        next(err);
    }
});

// Get medicine stock
router.get('/medicines', auth(['receptionist', 'doctor', 'admin']), async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add/Update medicine
router.post('/update-medicine', auth(['receptionist']), async (req, res, next) => {
    const { name, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: 'Missing medicine details' });
    }
    try {
        let medicine = await Medicine.findOne({ name });
        if (medicine) {
            medicine.stock += parseInt(stock);
            medicine.price = price;
            await medicine.save();
        } else {
            medicine = new Medicine({ name, price, stock });
            await medicine.save();
        }
        res.json(medicine);
    } catch (err) {
        next(err);
    }
});

// Get bills
router.get('/bills', auth(['receptionist', 'doctor', 'admin']), async (req, res) => {
    try {
        const bills = await Bill.find().populate('patient').populate('items.medicine');
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Dispense medicine for a specific bill and deduct stock
router.post('/dispense-bill/:billId', auth(['receptionist']), async (req, res, next) => {
    try {
        const bill = await Bill.findById(req.params.billId).populate('items.medicine');
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        
        if (bill.status === 'paid') {
            return res.status(400).json({ message: 'Bill is already marked as paid/dispensed' });
        }

        // Check stock before dispensing any
        for (const item of bill.items) {
            const med = item.medicine;
            if (med.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${med.name}. Available: ${med.stock}, Required: ${item.quantity}` });
            }
        }

        // Deduct stock
        for (const item of bill.items) {
            const med = await Medicine.findById(item.medicine._id);
            med.stock -= item.quantity;
            await med.save();
        }

        // Mark as paid
        bill.status = 'paid';
        await bill.save();

        res.json({ message: 'Medicines dispensed & stock updated successfully', bill });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
