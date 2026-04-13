const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log(`Login attempt for: ${email}`);
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        console.log('Login successful');
        
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { name: user.name, email: user.email, role: user.role, id: user._id } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');

// Request OTP for changing own password (staff only)
router.post('/request-password-otp', auth(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'admin') {
             return res.json({ message: 'Admins do not need OTP to change their own password.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOTP = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        const emailSent = await sendEmail(
            user.email,
            'Hospital Portal - Password Change Code',
            `<h2>Password Change Verification</h2><p>Your security code to change your password is: <strong>${otp}</strong></p><p>This code expires in 10 minutes. If you did not request this, please contact the admin.</p>`
        );

        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send security email. Please check configuration.' });
        }

        res.json({ message: 'Security code sent to your email successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password for logged in users

router.post('/change-password', auth(), async (req, res) => {
    const { oldPassword, newPassword, otp } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user || !(await user.comparePassword(oldPassword))) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        if (user.role !== 'admin') {
            if (!otp || user.resetOTP !== otp || user.otpExpiry < new Date()) {
                return res.status(400).json({ message: 'Invalid or expired security code. Please request a new one.' });
            }
            user.resetOTP = undefined;
            user.otpExpiry = undefined;
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Simple Reset Password flow (In production, use email/tokens)
router.post('/reset-password-request', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Simulating sending a link/code. For now, returning success.
        res.json({ message: 'Reset request received. In a real system, you would receive an email.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
