import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { updatePassword, updateProfile } from '../api/auth';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

function AdminSettings() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, setUser } = useAuth();

    // Profile state
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileEmail, setProfileEmail] = useState(user?.email || '');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    // ============ HOTEL INFO STATE ============
    const [hotelInfo, setHotelInfo] = useState(null);
    const [hotelForm, setHotelForm] = useState({
        hotelName: '',
        location: '',
        phone: '',
        email: '',
        priceRange: '',
    });
    const [editingHotel, setEditingHotel] = useState(false);
    const [loadingHotel, setLoadingHotel] = useState(true);
    const [savingHotel, setSavingHotel] = useState(false);

    // ============ WHY CHOOSE US STATE ============
    const [wcuInfo, setWcuInfo] = useState(null);
    const [wcuForm, setWcuForm] = useState({
        badge: '',
        title: '',
        subtitle: '',
        features: [],
    });
    const [editingWCU, setEditingWCU] = useState(false);
    const [savingWCU, setSavingWCU] = useState(false);

    // ============ CONTACT STATE 👈 NAYA ============
    const [contactInfo, setContactInfo] = useState(null);
    const [contactForm, setContactForm] = useState({
        addressLine1: '',
        addressLine2: '',
        phone1: '',
        phone2: '',
        email1: '',
        email2: '',
        receptionHours: '',
        checkInOut: '',
    });
    const [editingContact, setEditingContact] = useState(false);
    const [savingContact, setSavingContact] = useState(false);

    // Load on mount
    useEffect(() => {
        loadHotelInfo();
    }, []);

    const loadHotelInfo = async () => {
        try {
            const { data } = await axios.get(`${API}/api/settings`);
            if (data.success) {
                // Hotel info
                setHotelInfo(data.settings);
                setHotelForm({
                    hotelName:  data.settings.hotelName  || '',
                    location:   data.settings.location   || '',
                    phone:      data.settings.phone      || '',
                    email:      data.settings.email      || '',
                    priceRange: data.settings.priceRange || '',
                });

                // Why Choose Us info
                if (data.settings.whyChooseUs) {
                    setWcuInfo(data.settings.whyChooseUs);
                    setWcuForm({
                        badge:    data.settings.whyChooseUs.badge    || '',
                        title:    data.settings.whyChooseUs.title    || '',
                        subtitle: data.settings.whyChooseUs.subtitle || '',
                        features: data.settings.whyChooseUs.features || [],
                    });
                }

                // Contact info 👈 NAYA
                if (data.settings.contact) {
                    setContactInfo(data.settings.contact);
                    setContactForm({
                        addressLine1:   data.settings.contact.addressLine1   || '',
                        addressLine2:   data.settings.contact.addressLine2   || '',
                        phone1:         data.settings.contact.phone1         || '',
                        phone2:         data.settings.contact.phone2         || '',
                        email1:         data.settings.contact.email1         || '',
                        email2:         data.settings.contact.email2         || '',
                        receptionHours: data.settings.contact.receptionHours || '',
                        checkInOut:     data.settings.contact.checkInOut     || '',
                    });
                }
            }
        } catch (err) {
            console.error('Settings load failed:', err);
            toast.error('Settings load failed');
        } finally {
            setLoadingHotel(false);
        }
    };

    const handleHotelSave = async () => {
        setSavingHotel(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API}/api/settings`,
                hotelForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('✅ Hotel information updated');
                setEditingHotel(false);
                loadHotelInfo();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSavingHotel(false);
        }
    };

    const handleHotelCancel = () => {
        if (hotelInfo) {
            setHotelForm({
                hotelName:  hotelInfo.hotelName  || '',
                location:   hotelInfo.location   || '',
                phone:      hotelInfo.phone      || '',
                email:      hotelInfo.email      || '',
                priceRange: hotelInfo.priceRange || '',
            });
        }
        setEditingHotel(false);
    };

    // ============ WHY CHOOSE US HANDLERS ============
    const updateFeature = (index, field, value) => {
        const updated = [...wcuForm.features];
        updated[index] = { ...updated[index], [field]: value };
        setWcuForm({ ...wcuForm, features: updated });
    };

    const addFeature = () => {
        setWcuForm({
            ...wcuForm,
            features: [...wcuForm.features, { icon: '✨', title: '', description: '' }],
        });
    };

    const removeFeature = (index) => {
        setWcuForm({
            ...wcuForm,
            features: wcuForm.features.filter((_, i) => i !== index),
        });
    };

    const handleWCUSave = async () => {
        setSavingWCU(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API}/api/settings`,
                { whyChooseUs: wcuForm },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('✅ Why Choose Us updated');
                setEditingWCU(false);
                loadHotelInfo();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSavingWCU(false);
        }
    };

    const handleWCUCancel = () => {
        if (wcuInfo) {
            setWcuForm({
                badge:    wcuInfo.badge    || '',
                title:    wcuInfo.title    || '',
                subtitle: wcuInfo.subtitle || '',
                features: wcuInfo.features || [],
            });
        }
        setEditingWCU(false);
    };

    // ============ CONTACT HANDLERS 👈 NAYA ============
    const handleContactSave = async () => {
        setSavingContact(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API}/api/settings`,
                { contact: contactForm },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('✅ Contact information updated');
                setEditingContact(false);
                loadHotelInfo();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSavingContact(false);
        }
    };

    const handleContactCancel = () => {
        if (contactInfo) {
            setContactForm({
                addressLine1:   contactInfo.addressLine1   || '',
                addressLine2:   contactInfo.addressLine2   || '',
                phone1:         contactInfo.phone1         || '',
                phone2:         contactInfo.phone2         || '',
                email1:         contactInfo.email1         || '',
                email2:         contactInfo.email2         || '',
                receptionHours: contactInfo.receptionHours || '',
                checkInOut:     contactInfo.checkInOut     || '',
            });
        }
        setEditingContact(false);
    };

    // ============ Profile / Password Handlers ============
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const data = await updateProfile({
                name: profileName,
                email: profileEmail,
                phone: profilePhone
            });
            if (data.success) {
                toast.success('✅ Profile updated');
                if (setUser && data.user) setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setSavingPassword(true);
        try {
            const data = await updatePassword(currentPassword, newPassword);
            if (data.success) {
                toast.success('✅ Password changed');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message || 'Password change failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password change failed');
        } finally {
            setSavingPassword(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        border: '2px solid #E5E7EB',
        borderRadius: 10,
        fontSize: 13,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        fontSize: 12,
        fontWeight: 700,
        color: '#0A1E3F',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const btnStyle = {
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
        color: '#0A1E3F',
        border: 'none',
        borderRadius: 10,
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: 13
    };

    const cancelBtnStyle = {
        padding: '8px 20px',
        background: '#F0F2F5',
        color: '#0A1E3F',
        border: 'none',
        borderRadius: 10,
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: 12
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div style={{
                marginLeft: window.innerWidth > 900 ? 260 : 0,
                transition: 'margin 0.3s ease',
                minHeight: '100vh'
            }}>
                <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main style={{ padding: 24 }}>
                    <div style={{ marginBottom: 25 }}>
                        <h1 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 28,
                            color: '#0A1E3F',
                            margin: 0,
                            marginBottom: 6
                        }}>⚙️ Settings</h1>
                        <p style={{ color: '#6C757D', fontSize: 14, margin: 0 }}>
                            Manage your account and hotel information
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>

                        {/* ============ PROFILE UPDATE ============ */}
                        <div style={{
                            background: 'white',
                            borderRadius: 16,
                            padding: 30,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{ color: '#0A1E3F', marginTop: 0, marginBottom: 20, fontSize: 16 }}>
                                👤 Profile Information
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                                <div style={{
                                    width: 70, height: 70,
                                    background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                                    color: '#0A1E3F',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 28, fontWeight: 700
                                }}>{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0A1E3F' }}>{user?.name}</div>
                                    <div style={{ fontSize: 12, color: '#6C757D' }}>{user?.email}</div>
                                    <div style={{
                                        display: 'inline-block',
                                        marginTop: 6,
                                        padding: '3px 12px',
                                        background: '#FEF3C7',
                                        color: '#92400E',
                                        borderRadius: 999,
                                        fontSize: 11,
                                        fontWeight: 700
                                    }}>🛡️ ADMIN</div>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSave} style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>Name</label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        type="email"
                                        value={profileEmail}
                                        onChange={(e) => setProfileEmail(e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input
                                        type="text"
                                        value={profilePhone}
                                        onChange={(e) => setProfilePhone(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <button type="submit" disabled={savingProfile} style={btnStyle}>
                                    {savingProfile ? 'Saving...' : '💾 Save Profile'}
                                </button>
                            </form>
                        </div>

                        {/* ============ PASSWORD CHANGE ============ */}
                        <div style={{
                            background: 'white',
                            borderRadius: 16,
                            padding: 30,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            borderTop: '4px solid #DC2626'
                        }}>
                            <h3 style={{ color: '#0A1E3F', marginTop: 0, marginBottom: 8, fontSize: 16 }}>
                                🔐 Change Password
                            </h3>
                            <p style={{ color: '#6C757D', fontSize: 12, marginTop: 0, marginBottom: 20 }}>
                                Choose a strong password to keep your account safe
                            </p>

                            <form onSubmit={handlePasswordSave} style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        style={inputStyle}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={inputStyle}
                                        placeholder="Min 6 characters"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={inputStyle}
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    style={{ ...btnStyle, background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: 'white' }}
                                >
                                    {savingPassword ? 'Changing...' : '🔐 Change Password'}
                                </button>
                            </form>
                        </div>

                    </div>

                    {/* ============ HOTEL INFO (DYNAMIC) ============ */}
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 30,
                        marginTop: 20,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            flexWrap: 'wrap',
                            gap: 12
                        }}>
                            <h3 style={{ color: '#0A1E3F', margin: 0, fontSize: 16 }}>
                                🏨 Hotel Information
                            </h3>

                            {!editingHotel && !loadingHotel && (
                                <button
                                    onClick={() => setEditingHotel(true)}
                                    style={{ ...btnStyle, padding: '8px 20px', fontSize: 12 }}
                                >
                                    ✏️ Edit
                                </button>
                            )}

                            {editingHotel && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={handleHotelCancel} disabled={savingHotel} style={cancelBtnStyle}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleHotelSave}
                                        disabled={savingHotel}
                                        style={{ ...btnStyle, padding: '8px 20px', fontSize: 12 }}
                                    >
                                        {savingHotel ? '⏳ Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {loadingHotel ? (
                            <div style={{ color: '#6C757D', fontSize: 13, padding: 20, textAlign: 'center' }}>
                                ⏳ Loading hotel information...
                            </div>
                        ) : editingHotel ? (
                            <div style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>Hotel Name</label>
                                    <input
                                        type="text"
                                        value={hotelForm.hotelName}
                                        onChange={(e) => setHotelForm({ ...hotelForm, hotelName: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Location</label>
                                    <input
                                        type="text"
                                        value={hotelForm.location}
                                        onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={labelStyle}>Phone</label>
                                        <input
                                            type="tel"
                                            value={hotelForm.phone}
                                            onChange={(e) => setHotelForm({ ...hotelForm, phone: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email</label>
                                        <input
                                            type="email"
                                            value={hotelForm.email}
                                            onChange={(e) => setHotelForm({ ...hotelForm, email: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Price Range</label>
                                    <input
                                        type="text"
                                        value={hotelForm.priceRange}
                                        onChange={(e) => setHotelForm({ ...hotelForm, priceRange: e.target.value })}
                                        style={inputStyle}
                                        placeholder="₹1500 - ₹2500 per night"
                                    />
                                </div>
                                <div style={{
                                    padding: '10px 14px',
                                    background: '#F8F9FA',
                                    borderRadius: 8,
                                    borderLeft: '3px solid #D4AF37',
                                    fontSize: 12,
                                    color: '#6C757D'
                                }}>
                                    ℹ️ <b>Total Rooms</b> automatically rooms collection se count hoti hai — edit nahi kar sakte.
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                                <InfoRow label="Hotel Name"  value={hotelInfo?.hotelName  || '—'} />
                                <InfoRow label="Location"    value={hotelInfo?.location   || '—'} />
                                <InfoRow label="Phone"       value={hotelInfo?.phone      || '—'} />
                                <InfoRow label="Email"       value={hotelInfo?.email      || '—'} />
                                <InfoRow label="Total Rooms" value={hotelInfo?.totalRooms ?? '—'} />
                                <InfoRow label="Price Range" value={hotelInfo?.priceRange || '—'} />
                            </div>
                        )}
                    </div>

                    {/* ============ WHY CHOOSE US (DYNAMIC) ============ */}
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 30,
                        marginTop: 20,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        borderTop: '4px solid #D4AF37'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            flexWrap: 'wrap',
                            gap: 12
                        }}>
                            <h3 style={{ color: '#0A1E3F', margin: 0, fontSize: 16 }}>
                                ✨ Why Choose Us Section
                            </h3>

                            {!editingWCU && !loadingHotel && (
                                <button
                                    onClick={() => setEditingWCU(true)}
                                    style={{ ...btnStyle, padding: '8px 20px', fontSize: 12 }}
                                >
                                    ✏️ Edit
                                </button>
                            )}

                            {editingWCU && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={handleWCUCancel} disabled={savingWCU} style={cancelBtnStyle}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleWCUSave}
                                        disabled={savingWCU}
                                        style={{ ...btnStyle, padding: '8px 20px', fontSize: 12 }}
                                    >
                                        {savingWCU ? '⏳ Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {loadingHotel ? (
                            <div style={{ color: '#6C757D', fontSize: 13, padding: 20, textAlign: 'center' }}>
                                ⏳ Loading...
                            </div>
                        ) : editingWCU ? (
                            /* ============ EDIT MODE ============ */
                            <div style={{ display: 'grid', gap: 16 }}>
                                <div>
                                    <label style={labelStyle}>Badge Text</label>
                                    <input
                                        type="text"
                                        value={wcuForm.badge}
                                        onChange={(e) => setWcuForm({ ...wcuForm, badge: e.target.value })}
                                        style={inputStyle}
                                        placeholder="WHY CHOOSE US"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Title</label>
                                    <input
                                        type="text"
                                        value={wcuForm.title}
                                        onChange={(e) => setWcuForm({ ...wcuForm, title: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Subtitle</label>
                                    <textarea
                                        value={wcuForm.subtitle}
                                        onChange={(e) => setWcuForm({ ...wcuForm, subtitle: e.target.value })}
                                        rows={3}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ marginTop: 8 }}>
                                    <label style={labelStyle}>Features ({wcuForm.features.length})</label>

                                    {wcuForm.features.map((f, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '60px 1fr 2fr 40px',
                                                gap: 10,
                                                marginBottom: 10,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <input
                                                type="text"
                                                value={f.icon}
                                                onChange={(e) => updateFeature(i, 'icon', e.target.value)}
                                                style={{ ...inputStyle, textAlign: 'center', fontSize: 18 }}
                                                placeholder="📍"
                                                maxLength={2}
                                            />
                                            <input
                                                type="text"
                                                value={f.title}
                                                onChange={(e) => updateFeature(i, 'title', e.target.value)}
                                                style={inputStyle}
                                                placeholder="Title"
                                            />
                                            <input
                                                type="text"
                                                value={f.description}
                                                onChange={(e) => updateFeature(i, 'description', e.target.value)}
                                                style={inputStyle}
                                                placeholder="Description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(i)}
                                                style={{
                                                    padding: '8px',
                                                    background: '#FEE2E2',
                                                    color: '#DC2626',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: 14
                                                }}
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        style={{
                                            marginTop: 8,
                                            padding: '8px 16px',
                                            background: '#EFF6FF',
                                            color: '#1E40AF',
                                            border: '1px dashed #93C5FD',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                            fontSize: 12
                                        }}
                                    >
                                        ➕ Add Feature
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ============ VIEW MODE ============ */
                            <div style={{ display: 'grid', gap: 12 }}>
                                <div style={{
                                    padding: 16,
                                    background: '#F8F9FA',
                                    borderRadius: 10,
                                    borderLeft: '3px solid #D4AF37'
                                }}>
                                    <div style={{
                                        fontSize: 12,
                                        color: '#D4AF37',
                                        fontWeight: 700,
                                        letterSpacing: '1px',
                                        marginBottom: 6
                                    }}>
                                        {wcuInfo?.badge}
                                    </div>
                                    <div style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: '#0A1E3F',
                                        marginBottom: 8,
                                        fontFamily: 'Playfair Display, serif'
                                    }}>
                                        {wcuInfo?.title}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#6C757D', lineHeight: 1.5 }}>
                                        {wcuInfo?.subtitle}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: 10
                                }}>
                                    {wcuInfo?.features?.map((f, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                gap: 10,
                                                padding: 12,
                                                background: '#F8F9FA',
                                                borderRadius: 10,
                                                borderLeft: '3px solid #D4AF37'
                                            }}
                                        >
                                            <div style={{ fontSize: 20 }}>{f.icon}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1E3F' }}>
                                                    {f.title}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#6C757D' }}>
                                                    {f.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============ CONTACT SECTION 👈 NAYA ============ */}
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 30,
                        marginTop: 20,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        borderTop: '4px solid #0A1E3F'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            flexWrap: 'wrap',
                            gap: 12
                        }}>
                            <h3 style={{ color: '#0A1E3F', margin: 0, fontSize: 16 }}>
                                📞 Contact Section
                            </h3>

                            {!editingContact && !loadingHotel && (
                                <button
                                    onClick={() => setEditingContact(true)}
                                    style={{ ...btnStyle, padding: '8px 20px', fontSize: 12 }}
                                >
                                    ✏️ Edit
                                </button>
                            )}

                            {editingContact && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={handleContactCancel} disabled={savingContact} style={cancelBtnStyle}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleContactSave}
                                        disabled={savingContact}
                                        style={{ ...btnStyle, padding: '8px 20px', fontSize: 12 }}
                                    >
                                        {savingContact ? '⏳ Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {loadingHotel ? (
                            <div style={{ color: '#6C757D', fontSize: 13, padding: 20, textAlign: 'center' }}>
                                ⏳ Loading...
                            </div>
                        ) : editingContact ? (
                            /* ============ EDIT MODE ============ */
                            <div style={{ display: 'grid', gap: 16 }}>

                                {/* Visit Us */}
                                <div style={{ padding: 16, background: '#F8F9FA', borderRadius: 10 }}>
                                    <div style={{ fontWeight: 700, color: '#0A1E3F', marginBottom: 12, fontSize: 13 }}>
                                        📍 Visit Us
                                    </div>
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        <div>
                                            <label style={labelStyle}>Address Line 1</label>
                                            <input
                                                type="text"
                                                value={contactForm.addressLine1}
                                                onChange={(e) => setContactForm({ ...contactForm, addressLine1: e.target.value })}
                                                style={inputStyle}
                                                placeholder="Near Ram Mandir"
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Address Line 2</label>
                                            <input
                                                type="text"
                                                value={contactForm.addressLine2}
                                                onChange={(e) => setContactForm({ ...contactForm, addressLine2: e.target.value })}
                                                style={inputStyle}
                                                placeholder="Ayodhya, Uttar Pradesh - 224123"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Call Us */}
                                <div style={{ padding: 16, background: '#F8F9FA', borderRadius: 10 }}>
                                    <div style={{ fontWeight: 700, color: '#0A1E3F', marginBottom: 12, fontSize: 13 }}>
                                        📞 Call Us
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <label style={labelStyle}>Phone 1</label>
                                            <input
                                                type="tel"
                                                value={contactForm.phone1}
                                                onChange={(e) => setContactForm({ ...contactForm, phone1: e.target.value })}
                                                style={inputStyle}
                                                placeholder="+91 9315377668"
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Phone 2</label>
                                            <input
                                                type="tel"
                                                value={contactForm.phone2}
                                                onChange={(e) => setContactForm({ ...contactForm, phone2: e.target.value })}
                                                style={inputStyle}
                                                placeholder="+91 8400675764"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Us */}
                                <div style={{ padding: 16, background: '#F8F9FA', borderRadius: 10 }}>
                                    <div style={{ fontWeight: 700, color: '#0A1E3F', marginBottom: 12, fontSize: 13 }}>
                                        ✉️ Email Us
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <label style={labelStyle}>Email 1</label>
                                            <input
                                                type="email"
                                                value={contactForm.email1}
                                                onChange={(e) => setContactForm({ ...contactForm, email1: e.target.value })}
                                                style={inputStyle}
                                                placeholder="info@siyarampace.in"
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Email 2</label>
                                            <input
                                                type="email"
                                                value={contactForm.email2}
                                                onChange={(e) => setContactForm({ ...contactForm, email2: e.target.value })}
                                                style={inputStyle}
                                                placeholder="booking@siyarampace.in"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Reception Hours */}
                                <div style={{ padding: 16, background: '#F8F9FA', borderRadius: 10 }}>
                                    <div style={{ fontWeight: 700, color: '#0A1E3F', marginBottom: 12, fontSize: 13 }}>
                                        ⏰ Reception Hours
                                    </div>
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        <div>
                                            <label style={labelStyle}>Hours</label>
                                            <input
                                                type="text"
                                                value={contactForm.receptionHours}
                                                onChange={(e) => setContactForm({ ...contactForm, receptionHours: e.target.value })}
                                                style={inputStyle}
                                                placeholder="Open 24/7"
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Check-in / Check-out</label>
                                            <input
                                                type="text"
                                                value={contactForm.checkInOut}
                                                onChange={(e) => setContactForm({ ...contactForm, checkInOut: e.target.value })}
                                                style={inputStyle}
                                                placeholder="Check-in: 12 PM | Check-out: 11 AM"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            /* ============ VIEW MODE ============ */
                            <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                                <InfoRow label="📍 Address 1"    value={contactInfo?.addressLine1   || '—'} />
                                <InfoRow label="📍 Address 2"    value={contactInfo?.addressLine2   || '—'} />
                                <InfoRow label="📞 Phone 1"      value={contactInfo?.phone1         || '—'} />
                                <InfoRow label="📞 Phone 2"      value={contactInfo?.phone2         || '—'} />
                                <InfoRow label="✉️ Email 1"      value={contactInfo?.email1         || '—'} />
                                <InfoRow label="✉️ Email 2"      value={contactInfo?.email2         || '—'} />
                                <InfoRow label="⏰ Hours"        value={contactInfo?.receptionHours || '—'} />
                                <InfoRow label="⏰ Check-in/out" value={contactInfo?.checkInOut     || '—'} />
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#F8F9FA',
            borderRadius: 8,
            borderLeft: '3px solid #D4AF37'
        }}>
            <span style={{ color: '#6C757D', fontWeight: 600 }}>{label}</span>
            <span style={{ color: '#0A1E3F', fontWeight: 700 }}>{value}</span>
        </div>
    );
}

export default AdminSettings;