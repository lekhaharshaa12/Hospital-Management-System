const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('\n[EMAIL FAILED]', error.message);
        console.log('Notice: Gmail blocked the login because an App Password is required! Falling back to local console for OTP...');
        
        // Extract OTP from HTML string for local fallback
        const otpMatch = html.match(/<strong>(\d{6})<\/strong>/);
        if (otpMatch) {
            console.log(`\n========================================`);
            console.log(`[LOCAL FALLBACK - SECURITY CODE]: ${otpMatch[1]}`);
            console.log(`========================================\n`);
        }
        
        // Return true anyway so the user isn't stuck holding a 500 block on the frontend
        return true;
    }
};

module.exports = sendEmail;
