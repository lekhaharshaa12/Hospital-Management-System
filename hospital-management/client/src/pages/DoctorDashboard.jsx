import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, History, LogOut, CheckCircle, User, Activity, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [isAvailable, setIsAvailable] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [prescription, setPrescription] = useState({ observation: '', medicines: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [apptRes, medRes, doctorsRes] = await Promise.all([
                api.get('/doctor/my-appointments'),
                api.get('/receptionist/medicines'),
                api.get('/receptionist/doctors')
            ]);
            setAppointments(apptRes.data);
            setMedicines(medRes.data);
            
            const me = doctorsRes.data.find(d => d._id === user.id);
            if (me) setIsAvailable(me.isAvailable);
        } catch (err) {
            setError('Failed to sync dashboard data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const toggleAvailability = async () => {
        try {
            const res = await api.patch('/doctor/availability');
            setIsAvailable(res.data.isAvailable);
        } catch (err) {
            setError('Failed to update working status');
        }
    };

    const addMedicineToPrescription = (medId) => {
        const med = medicines.find(m => m._id === medId);
        if (med.stock <= 0) {
            alert('This medicine is out of stock!');
            return;
        }
        setPrescription({
            ...prescription,
            medicines: [...prescription.medicines, { id: medId, name: med.name, quantity: 1, dosage: '' }]
        });
    };

    const handlePrescriptionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/doctor/prescribe/${selectedAppt._id}`, prescription);
            alert('Prescription saved and appointment completed.');
            setSelectedAppt(null);
            setPrescription({ observation: '', medicines: [] });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error processing prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '20px', flexWrap: 'wrap' }}>
                <h1 className="gradient-text">Doctor Dashboard</h1>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div 
                        onClick={toggleAvailability}
                        className="glass-card" 
                        style={{ 
                            padding: '8px 16px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            borderColor: isAvailable ? '#10b981' : '#ef4444',
                            background: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }}
                    >
                        <Activity size={18} color={isAvailable ? '#10b981' : '#ef4444'} />
                        <span style={{ fontWeight: '600', color: isAvailable ? '#10b981' : '#ef4444' }}>
                            {isAvailable ? 'WORKING' : 'NOT WORKING'}
                        </span>
                    </div>

                    <button onClick={() => navigate('/profile')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}>
                        <User size={18} /> Profile
                    </button>
                    <button onClick={logout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e11d48' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '1.5rem', color: '#f87171', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: selectedAppt ? '1fr 1.5fr' : '1fr', gap: '2rem', transition: 'all 0.5s ease' }}>
                {/* Appointment Queue */}
                <motion.div layout className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ClipboardList size={20} /> Assigned Patients
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {appointments.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No pending appointments.</p>}
                        {appointments.map(appt => (
                            <div 
                                key={appt._id} 
                                onClick={() => setSelectedAppt(appt)}
                                className="glass-card" 
                                style={{ 
                                    padding: '1rem', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s',
                                    border: selectedAppt?._id === appt._id ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                    background: selectedAppt?._id === appt._id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)'
                                }}
                            >
                                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{appt.patient?.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {appt.patient?.age} yrs • {appt.patient?.gender} • {appt.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Prescription Form / History */}
                <AnimatePresence>
                    {selectedAppt && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 20 }} 
                            className="glass-card" 
                            style={{ padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3>Prescribe for {selectedAppt.patient?.name}</h3>
                                <button onClick={() => setSelectedAppt(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                            </div>

                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <History size={14} /> Medical History
                                </h4>
                                {selectedAppt.patient?.history?.length === 0 ? (
                                    <p style={{ fontSize: '0.8rem' }}>No previous records found.</p>
                                ) : (
                                    selectedAppt.patient?.history?.slice(-2).map((h, i) => (
                                        <div key={i} style={{ fontSize: '0.85rem', marginBottom: '10px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(h.date).toLocaleDateString()}</div>
                                            <div>{h.observation}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handlePrescriptionSubmit}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Observations</label>
                                    <textarea 
                                        className="input-field" 
                                        style={{ height: '80px', resize: 'none' }} 
                                        value={prescription.observation}
                                        onChange={e => setPrescription({...prescription, observation: e.target.value})}
                                        required 
                                        placeholder="Diagnose results here..."
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.9rem' }}>Medicines</label>
                                        <select 
                                            className="input-field" 
                                            style={{ width: 'auto', marginBottom: 0, padding: '4px 8px', fontSize: '0.85rem' }}
                                            onChange={(e) => e.target.value && addMedicineToPrescription(e.target.value)}
                                            value=""
                                        >
                                            <option value="">+ Add Medicine Item</option>
                                            {medicines.map(m => <option key={m._id} value={m._id} disabled={m.stock <= 0}>{m.name} ({m.stock} left)</option>)}
                                        </select>
                                    </div>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {prescription.medicines.map((m, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                                <div style={{ flex: 2, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem' }}>{m.name}</div>
                                                <input 
                                                    className="input-field" 
                                                    style={{ width: '60px', marginBottom: 0 }} 
                                                    type="number" 
                                                    placeholder="Qty" 
                                                    value={m.quantity}
                                                    onChange={e => {
                                                        const newMeds = [...prescription.medicines];
                                                        newMeds[index].quantity = parseInt(e.target.value);
                                                        setPrescription({...prescription, medicines: newMeds});
                                                    }}
                                                    min="1"
                                                />
                                                <input 
                                                    className="input-field" 
                                                    style={{ flex: 2, marginBottom: 0 }} 
                                                    placeholder="Dosage (e.g. 1-0-1)" 
                                                    value={m.dosage}
                                                    onChange={e => {
                                                        const newMeds = [...prescription.medicines];
                                                        newMeds[index].dosage = e.target.value;
                                                        setPrescription({...prescription, medicines: newMeds});
                                                    }}
                                                    required
                                                />
                                                <button 
                                                    type="button"
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                    onClick={() => setPrescription({...prescription, medicines: prescription.medicines.filter((_, i) => i !== index)})}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} disabled={loading}>
                                    <CheckCircle size={18} /> {loading ? 'Processing...' : 'Complete & Generate Bill'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DoctorDashboard;
