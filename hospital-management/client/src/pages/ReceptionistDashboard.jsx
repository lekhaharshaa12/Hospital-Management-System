import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Calendar, Package, Receipt, LogOut, User, Users, Clipboard, PlusCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceptionistDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [activeTab, setActiveTab] = useState('patients'); // 'patients', 'dispensary', 'inventory'
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showApptModal, setShowApptModal] = useState(false);
    
    // Forms
    const [patientForm, setPatientForm] = useState({ name: '', age: '', gender: 'Male', contact: '' });
    const [appointmentForm, setAppointmentForm] = useState({ patient: '', doctor: '', date: '', time: '' });
    const [medicineForm, setMedicineForm] = useState({ name: '', price: '', stock: '' });

    const fetchData = async () => {
        try {
            const [p, d, m, b] = await Promise.all([
                api.get('/receptionist/patients'),
                api.get('/receptionist/doctors'),
                api.get('/receptionist/medicines'),
                api.get('/receptionist/bills')
            ]);
            setPatients(p.data);
            setDoctors(d.data);
            setMedicines(m.data);
            setBills(b.data);
        } catch (err) {
            setError('Failed to fetch dashboard data. Check connection.');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handlePatientSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/receptionist/add-patient', patientForm);
            setPatientForm({ name: '', age: '', gender: 'Male', contact: '' });
            setShowPatientModal(false);
            
            // Fast follow into appointment booking
            setAppointmentForm({ ...appointmentForm, patient: res.data._id });
            setShowApptModal(true);
            
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error registering patient');
        } finally {
            setLoading(false);
        }
    };

    const handleApptSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/receptionist/book-appointment', appointmentForm);
            setAppointmentForm({ patient: '', doctor: '', date: '', time: '' });
            setShowApptModal(false);
            fetchData();
            alert('Appointment booked successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error booking appointment');
        } finally {
            setLoading(false);
        }
    };

    const handleMedSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/receptionist/update-medicine', medicineForm);
            setMedicineForm({ name: '', price: '', stock: '' });
            fetchData();
            alert('Inventory updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating stock');
        } finally {
            setLoading(false);
        }
    };

    const dispenseBill = async (billId) => {
        setLoading(true);
        try {
            await api.post(`/receptionist/dispense-bill/${billId}`);
            alert('Medicines successfully dispensed & inventory updated!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error dispensing bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ padding: '0 10px', marginBottom: '2rem' }}>
                    <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Reception</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Desk Management</p>
                </div>

                <div className="nav-menu" style={{ flex: 1 }}>
                    <button 
                        className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
                        onClick={() => setActiveTab('patients')}
                        style={{ width: '100%', border: 'none', background: activeTab === 'patients' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', textAlign: 'left', outline: 'none' }}
                    >
                        <Users size={18} /> Patients List
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'dispensary' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dispensary')}
                        style={{ width: '100%', border: 'none', background: activeTab === 'dispensary' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', textAlign: 'left', outline: 'none' }}
                    >
                        <Clipboard size={18} /> Dispensary & Bills
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                        style={{ width: '100%', border: 'none', background: activeTab === 'inventory' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', textAlign: 'left', outline: 'none' }}
                    >
                        <Package size={18} /> Medicine Inventory
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <button onClick={() => navigate('/profile')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}>
                        <User size={18} /> Settings
                    </button>
                    <button onClick={logout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#e11d48' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                {error && (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '1.5rem', color: '#f87171' }}>
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* Patients Tab */}
                    {activeTab === 'patients' && (
                        <motion.div key="patients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>Registered Patients</h2>
                                <button onClick={() => setShowPatientModal(!showPatientModal)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {showPatientModal ? 'Cancel Registration' : <><UserPlus size={18} /> Add New Patient</>}
                                </button>
                            </div>

                            {showPatientModal ? (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem' }}>Register & Schedule</h3>
                                    <form onSubmit={handlePatientSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input className="input-field" placeholder="Full Name" value={patientForm.name} onChange={e => setPatientForm({...patientForm, name: e.target.value})} required style={{ gridColumn: '1 / -1', marginBottom: '0' }} />
                                        <input className="input-field" type="number" placeholder="Age" value={patientForm.age} onChange={e => setPatientForm({...patientForm, age: e.target.value})} required style={{ marginBottom: '0' }} />
                                        <select className="input-field" value={patientForm.gender} onChange={e => setPatientForm({...patientForm, gender: e.target.value})} style={{ marginBottom: '0' }}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <input className="input-field" placeholder="Contact Mobile/Email" value={patientForm.contact} onChange={e => setPatientForm({...patientForm, contact: e.target.value})} required style={{ gridColumn: '1 / -1' }} />
                                        <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }} disabled={loading}>
                                            {loading ? 'Processing...' : 'Register Patient & Proceed to Booking'}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : null}

                            {showApptModal && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--primary)' }}>
                                    <h3 style={{ marginBottom: '1.5rem', color: '#a855f7' }}>Fast-Follow: Schedule Appointment</h3>
                                    <form onSubmit={handleApptSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <select className="input-field" value={appointmentForm.doctor} onChange={e => setAppointmentForm({...appointmentForm, doctor: e.target.value})} required style={{ gridColumn: '1 / -1', marginBottom: '0' }}>
                                            <option value="">Select Specialized Doctor</option>
                                            {doctors.map(d => (
                                                <option key={d._id} value={d._id} disabled={!d.isAvailable}>
                                                    {d.name} ({d.specialization || 'General'}) - {d.isAvailable ? 'Available' : 'Unavailable'}
                                                </option>
                                            ))}
                                        </select>
                                        <input className="input-field" type="date" value={appointmentForm.date} onChange={e => setAppointmentForm({...appointmentForm, date: e.target.value})} required style={{ marginBottom: '0' }} />
                                        <input className="input-field" type="time" value={appointmentForm.time} onChange={e => setAppointmentForm({...appointmentForm, time: e.target.value})} required style={{ marginBottom: '0' }} />
                                        <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }} disabled={loading}>
                                            Confirm Appointment Details
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Demographics</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Contact</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.length === 0 && <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No patients found.</td></tr>}
                                        {patients.map(p => (
                                            <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>{p.name}</td>
                                                <td style={{ padding: '1rem' }}>{p.age}y / {p.gender}</td>
                                                <td style={{ padding: '1rem' }}>{p.contact}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button onClick={() => { setAppointmentForm({ ...appointmentForm, patient: p._id }); setShowApptModal(true); setShowPatientModal(false); }} style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Book Appt</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* Dispensary Tab */}
                    {activeTab === 'dispensary' && (
                        <motion.div key="dispensary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2>Dispensary & Prescriptions</h2>
                                <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Verify pending prescriptions and deduct medicines from active stock here.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                                {bills.filter(b => b.status === 'pending').map(b => (
                                    <div key={b._id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0 }}>{b.patient?.name}</h3>
                                            <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>PENDING</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Generated: {new Date(b.createdAt).toLocaleString()}</p>
                                        
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>PRESCRIBED MEDICINES:</h4>
                                            {b.items.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '5px' }}>
                                                    <span>{item.medicine?.name || 'Unknown'} (Qty: {item.quantity})</span>
                                                    <span>${item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--glass-border)', fontWeight: 'bold' }}>
                                                <span>Total Bill:</span>
                                                <span>${b.totalAmount}</span>
                                            </div>
                                        </div>

                                        <button onClick={() => dispenseBill(b._id)} className="btn-primary" style={{ width: '100%', background: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
                                            <CheckCircle size={18} /> Confirm & Dispense Meds
                                        </button>
                                    </div>
                                ))}

                                {bills.filter(b => b.status === 'pending').length === 0 && (
                                    <p style={{ color: 'var(--text-muted)' }}>No pending prescriptions to dispense.</p>
                                )}
                            </div>

                            <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Previously Dispensed (Paid)</h3>
                            <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Patient Name</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Invoice Date</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bills.filter(b => b.status === 'paid').map(b => (
                                            <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>{b.patient?.name}</td>
                                                <td style={{ padding: '1rem' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#10b981' }}>${b.totalAmount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <PlusCircle size={20} /> Add / Update Medicine
                                    </h3>
                                    <form onSubmit={handleMedSubmit}>
                                        <input className="input-field" placeholder="Medicine Label/Name" value={medicineForm.name} onChange={e => setMedicineForm({...medicineForm, name: e.target.value})} required />
                                        <input className="input-field" type="number" placeholder="Unit Price ($)" value={medicineForm.price} onChange={e => setMedicineForm({...medicineForm, price: e.target.value})} required />
                                        <input className="input-field" type="number" placeholder="Add Stock (Qty)" value={medicineForm.stock} onChange={e => setMedicineForm({...medicineForm, stock: e.target.value})} required />
                                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                                            Update Inventory
                                        </button>
                                    </form>
                                </div>

                                <div className="glass-card" style={{ padding: '1rem' }}>
                                     <h3 style={{ padding: '1rem', margin: 0 }}>Current Stock Levels</h3>
                                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Medicine</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Price</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Available Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {medicines.map(m => (
                                                <tr key={m._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{m.name}</td>
                                                    <td style={{ padding: '1rem' }}>${m.price}</td>
                                                    <td style={{ padding: '1rem', color: m.stock < 10 ? '#ef4444' : 'var(--text-main)', fontWeight: m.stock < 10 ? 'bold' : 'normal' }}>
                                                        {m.stock} Units {m.stock < 10 && '(Low)'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                     </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
