import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Users, Trash2, LogOut, User, 
    Edit, Save, X, Stethoscope, 
    UserCircle, ShieldCheck, Mail, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { logout, user: adminUser } = useAuth();
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [activeTab, setActiveTab] = useState('doctors'); // doctors, receptionists, add
    const [formData, setFormData] = useState({ 
        name: '', email: '', password: '', role: 'doctor', 
        qualification: '', specialization: '' 
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [pendingAction, setPendingAction] = useState(null);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/admin/staff');
            setStaff(res.data);
        } catch (err) {
            setError('Failed to fetch staff members');
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const clearStatus = () => {
        setError('');
        setSuccess('');
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearStatus();
        try {
            if (editingId) {
                // If editing and password is provided, trigger OTP flow
                if (formData.password) {
                    setPendingAction(() => () => completeUpdate(otp));
                    await api.post('/admin/request-otp');
                    setShowOtpModal(true);
                    setSuccess('Security code sent to your registered email (Mock: Check console)');
                    return;
                }
                await completeUpdate();
            } else {
                await api.post('/admin/add-staff', formData);
                setSuccess(`${formData.role === 'doctor' ? 'Doctor' : 'Receptionist'} added successfully`);
                setFormData({ name: '', email: '', password: '', role: 'doctor', qualification: '', specialization: '' });
                setActiveTab(formData.role === 'doctor' ? 'doctors' : 'receptionists');
                fetchStaff();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving staff member');
        } finally {
            setLoading(false);
        }
    };

    const completeUpdate = async (verificationCode = null) => {
        try {
            const payload = { ...formData };
            if (verificationCode) payload.otp = verificationCode;
            
            await api.put(`/admin/staff/${editingId}`, payload);
            setSuccess('Staff profile updated successfully');
            setEditingId(null);
            setFormData({ name: '', email: '', password: '', role: 'doctor', qualification: '', specialization: '' });
            setShowOtpModal(false);
            setOtp('');
            fetchStaff();
            setActiveTab(formData.role === 'doctor' ? 'doctors' : 'receptionists');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    const editStaff = (user) => {
        setEditingId(user._id);
        setFormData({ 
            name: user.name, 
            email: user.email, 
            password: '', 
            role: user.role, 
            qualification: user.qualification || '', 
            specialization: user.specialization || '' 
        });
        setActiveTab('add');
    };

    const deleteStaff = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/admin/staff/${id}`);
            fetchStaff();
            setSuccess('Staff member removed');
        } catch (err) {
            setError('Failed to delete staff member');
        }
    };

    const doctors = staff.filter(s => s.role === 'doctor');
    const receptionists = staff.filter(s => s.role === 'receptionist');

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
                    <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>Hospital Admin</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MERN Management Suite</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <div 
                        className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('doctors'); setEditingId(null); }}
                    >
                        <Stethoscope size={20} /> Doctors List
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'receptionists' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('receptionists'); setEditingId(null); }}
                    >
                        <UserCircle size={20} /> Receptionists
                    </div>
                    <div style={{ margin: '1.5rem 0 0.5rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Actions
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => { 
                            setActiveTab('add'); 
                            if(!editingId) setFormData({ name: '', email: '', password: '', role: 'doctor', qualification: '', specialization: '' });
                        }}
                    >
                        <UserPlus size={20} /> {editingId ? 'Edit Staff' : 'Add New Staff'}
                    </div>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                    <div className="nav-item" onClick={() => navigate('/profile')}>
                        <User size={20} /> My Profile
                    </div>
                    <div className="nav-item" onClick={logout} style={{ color: '#f87171' }}>
                        <LogOut size={20} /> Logout
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem' }}>
                            {activeTab === 'doctors' && 'Medical Specialists'}
                            {activeTab === 'receptionists' && 'Front Desk Staff'}
                            {activeTab === 'add' && (editingId ? 'Modify Staff Credentials' : 'Onboard New Staff')}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Logged in as <span style={{ color: 'var(--primary)' }}>{adminUser.name}</span>
                        </p>
                    </div>
                </header>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', marginBottom: '2rem', color: '#f87171' }}>
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px', marginBottom: '2rem', color: '#10b981' }}>
                        {success}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {activeTab === 'add' ? (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="glass-card" 
                            style={{ padding: '2.5rem', maxWidth: '800px' }}
                        >
                            <form onSubmit={handleAddStaff}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                                        <input className="input-field" placeholder="Dr. John Smith" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                        <input className="input-field" type="email" placeholder="smith@hospital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>System Role</label>
                                        <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} disabled={!!editingId}>
                                            <option value="doctor">Doctor</option>
                                            <option value="receptionist">Receptionist</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                                            {editingId ? 'Change Password (Leave blank to keep current)' : 'Initial Password'}
                                        </label>
                                        <input className="input-field" type="password" placeholder={editingId ? "New Password" : "••••••••"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId} />
                                    </div>
                                </div>

                                {formData.role === 'doctor' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Qualification</label>
                                            <input className="input-field" placeholder="MBBS, MD (Neurology)" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Specialization</label>
                                            <input className="input-field" placeholder="Cardiology / Ortho" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} required />
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
                                        {loading ? 'Processing...' : (editingId ? <><Save size={18} /> Update Staff Records</> : <><UserPlus size={18} /> Add to System</>)}
                                    </button>
                                    {editingId && (
                                        <button 
                                            type="button" 
                                            className="btn-primary" 
                                            style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}
                                            onClick={() => { setEditingId(null); setActiveTab(formData.role === 'doctor' ? 'doctors' : 'receptionists'); }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card" 
                            style={{ padding: '1.5rem' }}
                        >
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '16px' }}>NAME</th>
                                            <th style={{ padding: '16px' }}>EMAIL</th>
                                            {activeTab === 'doctors' && <th style={{ padding: '16px' }}>EXPERTISE</th>}
                                            <th style={{ padding: '16px', textAlign: 'right' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(activeTab === 'doctors' ? doctors : receptionists).map(user => (
                                            <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontWeight: 500 }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                                                </td>
                                                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{user.email}</td>
                                                {activeTab === 'doctors' && (
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontSize: '0.9rem' }}>{user.qualification}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{user.specialization}</div>
                                                    </td>
                                                )}
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => editStaff(user)}
                                                            style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                            title="Edit Profile"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteStaff(user._id)}
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                                            title="Delete Staff"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(activeTab === 'doctors' ? doctors : receptionists).length === 0 && (
                                            <tr>
                                                <td colSpan={activeTab === 'doctors' ? 4 : 3} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                                    <Users size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                    <div>No staff members in this category.</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* OTP Verification Modal */}
            <AnimatePresence>
                {showOtpModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-card" 
                            style={{ padding: '2.5rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}
                        >
                            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                <ShieldCheck size={32} />
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>Verify Admin Action</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                A security code has been sent to your primary email to authorize this staff password change.
                            </p>
                            
                            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                                <input 
                                    className="input-field" 
                                    placeholder="Enter 6-digit code" 
                                    value={otp} 
                                    onChange={e => setOtp(e.target.value)}
                                    style={{ paddingLeft: '40px', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                                    maxLength={6}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    className="btn-primary" 
                                    style={{ flex: 1 }}
                                    onClick={() => completeUpdate(otp)}
                                    disabled={otp.length !== 6}
                                >
                                    Confirm Change
                                </button>
                                <button 
                                    className="btn-primary" 
                                    style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}
                                    onClick={() => { setShowOtpModal(false); setOtp(''); setPendingAction(null); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
