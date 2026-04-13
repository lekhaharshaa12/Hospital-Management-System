import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password-request', { email });
            setMessage(res.data.message);
        } catch (err) {
            setMessage('User not found or server error');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '3rem', width: '100%', maxWidth: '450px', margin: '1rem' }}
            >
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={18} /> Back to Login
                </button>

                <h2 style={{ marginBottom: '0.5rem' }}>Forgot Password?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Enter your email to receive instructions on how to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            placeholder="admin@gmail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    {message && (
                        <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem', padding: '10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '5px' }}>
                            {message}
                        </p>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Send size={18} /> Reset Password
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
