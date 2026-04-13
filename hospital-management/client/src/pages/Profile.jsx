import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user.name,
        qualification: '',
        specialization: ''
    });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user.role === 'doctor') {
            api.get('/receptionist/doctors')
                .then(res => {
                    const me = res.data.find(d => d._id === user.id);
                    if (me) setFormData({ ...formData, qualification: me.qualification || '', specialization: me.specialization || '' });
                })
                .catch(() => setMessage({ text: 'Error loading expertise details', type: 'error' }));
        }
    }, [user.id]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = user.role === 'doctor' ? '/doctor/profile' : `/admin/staff/${user.id}`;
            await api.put(endpoint, formData);
            setMessage({ text: 'Profile updated successfully', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = async (e) => {
        e.preventDefault();
        if (user.role === 'admin') {
            return handlePasswordChange(); // Admins bypass OTP
        }
        
        setLoading(true);
        try {
            await api.post('/auth/request-password-otp');
            setOtpSent(true);
            setMessage({ text: 'Security code sent to your email. Please check.', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to send OTP', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/change-password', { ...passwords, otp });
            setMessage({ text: 'Password security updated', type: 'success' });
            setPasswords({ oldPassword: '', newPassword: '' });
            setOtp('');
            setOtpSent(false);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Invalid attempt', type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1.5rem' }}>
                <ArrowLeft size={18} /> Return to Home
            </button>

            <h1 className="gradient-text" style={{ marginBottom: '2rem' }}>Account Settings</h1>

            {message.text && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '2rem', 
                        textAlign: 'center',
                        background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                        color: message.type === 'success' ? '#10b981' : '#f87171'
                    }}
                >
                    {message.text}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* General Info */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} /> Personal Profile
                    </h3>
                    <form onSubmit={handleProfileUpdate}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Email (Permanent)</label>
                            <input className="input-field" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem' }}>Display Name</label>
                            <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>

                        {user.role === 'doctor' && (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Professional Qualification</label>
                                    <input className="input-field" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} placeholder="e.g., MBBS, MD" required />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Area of Specialization</label>
                                    <input className="input-field" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} placeholder="e.g., General Medicine" required />
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
                            {loading ? 'Processing...' : <><Save size={18} /> Update Data</>}
                        </button>
                    </form>
                </motion.div>

                {/* Password Change */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={20} /> Security Settings
                    </h3>
                    <form onSubmit={otpSent ? handlePasswordChange : requestOtp}>
                         <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem' }}>Current Password</label>
                            <input className="input-field" type="password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} required placeholder="Enter current" disabled={otpSent} />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ fontSize: '0.8rem' }}>New Secure Password</label>
                            <input className="input-field" type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required placeholder="Enter new" disabled={otpSent} />
                        </div>

                        {otpSent && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '2rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#10b981' }}>Enter 6-Digit Email Code</label>
                                <input className="input-field" type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="e.g. 123456" style={{ borderColor: '#10b981' }} />
                            </motion.div>
                        )}
                        
                        <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
                             {loading ? 'Processing...' : (otpSent ? <><CheckCircle size={18} /> Verify & Update</> : <><Lock size={18} /> Commit Changes</>)}
                        </button>
                        
                        {otpSent && (
                            <button type="button" onClick={() => setOtpSent(false)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '1rem' }}>
                                Cancel
                            </button>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
