const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all staff (Doctors and Receptionists)
router.get('/staff', auth(['admin']), async (req, res, next) => {
    try {
        const staff = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(staff);
    } catch (err) {
        next(err);
    }
});

// Add new staff members
router.post('/add-staff', auth(['admin']), async (req, res, next) => {
    const { name, email, password, role, qualification, specialization } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const userData = { name, email, password, role };
        if (role === 'doctor') {
            userData.qualification = qualification;
            userData.specialization = specialization;
        }

        const newUser = new User(userData);
        await newUser.save();
        res.status(201).json({ message: 'Staff member added successfully' });
    } catch (err) {
        next(err);
    }
});

const sendEmail = require('../utils/email');

// Request OTP for staff password reset (Admin sending to themselves or system)
router.post('/request-otp', auth(['admin']), async (req, res, next) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const admin = await User.findById(req.user.id);
        
        admin.resetOTP = otp;
        admin.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await admin.save();

        const emailSent = await sendEmail(
            admin.email,
            'Hospital Portal - Security Code',
            `<h2>Admin Action Verification</h2><p>Your security code to change staff credentials is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
        );

        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send security email. Please check your SMTP configuration.' });
        }

        res.json({ message: 'Security code sent to your email successfully.' });
    } catch (err) {
        next(err);
    }
});

// Update staff member (Admin only)
router.put('/staff/:id', auth(['admin']), async (req, res, next) => {
    try {
        const { otp, password, ...otherData } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // If password is being changed, verify OTP first
        if (password) {
            const admin = await User.findById(req.user.id);
            if (!otp || admin.resetOTP !== otp || admin.otpExpiry < new Date()) {
                return res.status(400).json({ message: 'Invalid or expired security code' });
            }
            // Clear OTP after use
            admin.resetOTP = undefined;
            admin.otpExpiry = undefined;
            await admin.save();
            user.password = password;
        }

        const fieldsToUpdate = ['name', 'email', 'qualification', 'specialization'];
        fieldsToUpdate.forEach(field => {
            if (otherData[field] !== undefined) user[field] = otherData[field];
        });

        await user.save();
        res.json({ message: 'Staff profile updated successfully' });
    } catch (err) {
        next(err);
    }
});

// Delete staff member
router.delete('/staff/:id', auth(['admin']), async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff member removed' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
