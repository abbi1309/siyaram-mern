// ============================================
// SETTINGS PAGE
// User account ki saari settings ek jagah
// 4 Tabs: Profile | Password | Notifications | Security
// ============================================

// React hooks
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Auth context
import { useAuth } from '../context/AuthContext';

// Backend URL
const API = import.meta.env.VITE_API_URL || '';

function Settings() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    // ---------- ACTIVE TAB ----------
    const [tab, setTab] = useState('profile');

    // ═══════════════════════════════════════════
    // PROFILE TAB STATE
    // ═══════════════════════════════════════════
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [savingProfile, setSavingProfile] = useState(false);

    // ═══════════════════════════════════════════
    // PASSWORD TAB STATE
    // ═══════════════════════════════════════════
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 👇 NAYA: 3 alag show/hide states (har field ka apna icon)
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [savingPassword, setSavingPassword] = useState(false);

    // ═══════════════════════════════════════════
    // NOTIFICATIONS TAB STATE
    // ═══════════════════════════════════════════
    const [notifications, setNotifications] = useState({
        emailBooking: user?.notifications?.emailBooking ?? true,
        emailReminders: user?.notifications?.emailReminders ?? true,
        emailOffers: user?.notifications?.emailOffers ?? false,
        smsAlerts: user?.notifications?.smsAlerts ?? false,
    });
    const [savingNotifications, setSavingNotifications] = useState(false);

    // ═══════════════════════════════════════════
    // DELETE ACCOUNT STATE
    // ═══════════════════════════════════════════
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePass, setShowDeletePass] = useState(false); // 👈 NAYA
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ═══════════════════════════════════════════
    // TABS LIST
    // ═══════════════════════════════════════════
    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'password', label: 'Password', icon: '🔐' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'security', label: 'Security', icon: '🛡️' },
    ];

    // ═══════════════════════════════════════════
    // HANDLER: PROFILE UPDATE
    // ═══════════════════════════════════════════
    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (!name.trim() || name.length < 2) {
            return toast.error('Name kam se kam 2 characters');
        }
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            return toast.error('Valid 10-digit phone daalein');
        }

        setSavingProfile(true);
        try {
            const token = localStorage.getItem('token');

            const res = await axios.put(
                `${API}/api/auth/update-profile`,
                { name: name.trim(), phone },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success('Profile updated! ✅');

                updateUser({
                    name: res.data.user.name,
                    phone: res.data.user.phone,
                });

                setName(res.data.user.name);
                setPhone(res.data.user.phone);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSavingProfile(false);
        }
    };

    // ═══════════════════════════════════════════
    // HANDLER: PASSWORD CHANGE
    // ═══════════════════════════════════════════
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return toast.error('Passwords match nahi kar rahe');
        }
        if (newPassword.length < 6) {
            return toast.error('Password kam se kam 6 characters');
        }

        setSavingPassword(true);
        try {
            const token = localStorage.getItem('token');

            const res = await axios.put(
                `${API}/api/auth/update-password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success('Password changed! Dobara login karein.');

                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');

                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setSavingPassword(false);
        }
    };

    // ═══════════════════════════════════════════
    // HANDLER: NOTIFICATIONS UPDATE
    // ═══════════════════════════════════════════
    const handleNotificationsUpdate = async (e) => {
        e.preventDefault();
        setSavingNotifications(true);

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API}/api/auth/notifications`,
                notifications,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Notification settings saved ✅');
        } catch (err) {
            toast.error('Failed to save');
        } finally {
            setSavingNotifications(false);
        }
    };

    // ═══════════════════════════════════════════
    // HANDLER: DELETE ACCOUNT
    // ═══════════════════════════════════════════
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            return toast.error('Password daalein');
        }

        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(
                `${API}/api/auth/delete-account`,
                {
                    data: { password: deletePassword },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data.success) {
                toast.success('Account deleted. Goodbye!');

                setTimeout(() => {
                    logout();
                    navigate('/');
                }, 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    // ═══════════════════════════════════════════
    // COMMON STYLES
    // ═══════════════════════════════════════════
    const sectionTitle = {
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--navy)',
        marginBottom: 6,
    };
    const sectionDesc = {
        fontSize: 13,
        color: 'var(--text-muted)',
        marginBottom: 24,
    };
    const toggleRow = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid #F0F2F5',
    };
    const btnPrimary = {
        marginTop: 20,
        padding: '12px 32px',
        fontWeight: 700,
    };

    // 👇 Password input + eye button ka style
    const eyeButtonStyle = {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 18,
        padding: 4,
        lineHeight: 1,
        color: 'var(--text-muted)',
    };

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════
    return (
        <>
            <Navbar />

            <div
                className="container"
                style={{ padding: '40px 24px', minHeight: '60vh' }}
            >
                {/* PAGE HEADING */}
                <div style={{ marginBottom: 30 }}>
                    <h1
                        style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 32,
                            color: 'var(--navy)',
                            marginBottom: 6,
                        }}
                    >
                        ⚙️ Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        Manage your account
                    </p>
                </div>

                {/* LAYOUT: Sidebar + Content */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '240px 1fr',
                        gap: 30,
                        alignItems: 'start',
                    }}
                >
                    {/* TABS SIDEBAR */}
                    <aside
                        style={{
                            background: '#fff',
                            padding: 16,
                            borderRadius: 16,
                            boxShadow: '0 4px 16px rgba(10,30,63,0.06)',
                            position: 'sticky',
                            top: 100,
                        }}
                    >
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '11px 12px',
                                    background:
                                        tab === t.id
                                            ? 'linear-gradient(135deg, #D4AF37, #B8912E)'
                                            : 'transparent',
                                    color:
                                        tab === t.id ? '#fff' : 'var(--navy)',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    marginBottom: 4,
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontSize: 16 }}>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </aside>

                    {/* CONTENT AREA */}
                    <main
                        style={{
                            background: '#fff',
                            padding: 32,
                            borderRadius: 16,
                            boxShadow: '0 4px 16px rgba(10,30,63,0.06)',
                            maxWidth: 680,
                        }}
                    >
                        {/* ═══════════════════════════════
                            TAB 1: PROFILE
                        ═══════════════════════════════ */}
                        {tab === 'profile' && (
                            <form onSubmit={handleProfileUpdate}>
                                <h2 style={sectionTitle}>
                                    Profile Information
                                </h2>
                                <p style={sectionDesc}>
                                    Update your name and contact details
                                </p>

                                {/* AVATAR */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16,
                                        marginBottom: 24,
                                        paddingBottom: 24,
                                        borderBottom: '1px solid #F0F2F5',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: '50%',
                                            background:
                                                'linear-gradient(135deg, #D4AF37, #B8912E)',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 28,
                                            fontWeight: 800,
                                        }}
                                    >
                                        {(user?.name || 'U')
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                color: 'var(--navy)',
                                                fontSize: 16,
                                            }}
                                        >
                                            {user?.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            {user?.email}
                                        </div>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                marginTop: 6,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color: '#166534',
                                                background: '#DCFCE7',
                                                padding: '3px 10px',
                                                borderRadius: 10,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {user?.role === 'admin'
                                                ? '🛡️ Admin'
                                                : '✓ Verified'}
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={user?.email || ''}
                                        disabled
                                        style={{
                                            background: '#F9FAFB',
                                            cursor: 'not-allowed',
                                        }}
                                    />
                                    <p
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--text-muted)',
                                            marginTop: 4,
                                        }}
                                    >
                                        Email change nahi ho sakta
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(
                                                e.target.value.replace(/\D/g, '')
                                            )
                                        }
                                        maxLength={10}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="btn btn-primary"
                                    style={btnPrimary}
                                >
                                    {savingProfile ? '⏳ Saving...' : '💾 Save Changes'}
                                </button>
                            </form>
                        )}

                        {/* ═══════════════════════════════
                            TAB 2: PASSWORD
                        ═══════════════════════════════ */}
                        {tab === 'password' && (
                            <form onSubmit={handlePasswordChange}>
                                <h2 style={sectionTitle}>Change Password</h2>
                                <p style={sectionDesc}>
                                    Keep your account secure
                                </p>

                                {/* CURRENT PASSWORD with eye */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Current Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showCurrentPass ? 'text' : 'password'}
                                            className="form-control"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(e.target.value)
                                            }
                                            placeholder="Enter current password"
                                            required
                                            style={{ paddingRight: 45 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            style={eyeButtonStyle}
                                            title={showCurrentPass ? 'Hide password' : 'Show password'}
                                        >
                                            {showCurrentPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>

                                {/* NEW PASSWORD with eye */}
                                <div className="form-group">
                                    <label className="form-label">
                                        New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            className="form-control"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            required
                                            minLength={6}
                                            style={{ paddingRight: 45 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            style={eyeButtonStyle}
                                            title={showNewPass ? 'Hide password' : 'Show password'}
                                        >
                                            {showNewPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>

                                {/* CONFIRM PASSWORD with eye */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Confirm New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPass ? 'text' : 'password'}
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter new password"
                                            required
                                            minLength={6}
                                            style={{ paddingRight: 45 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            style={eyeButtonStyle}
                                            title={showConfirmPass ? 'Hide password' : 'Show password'}
                                        >
                                            {showConfirmPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>

                                    {/* Match check */}
                                    {confirmPassword && (
                                        <div
                                            style={{
                                                fontSize: 11,
                                                marginTop: 4,
                                                fontWeight: 600,
                                                color:
                                                    newPassword === confirmPassword
                                                        ? '#22C55E'
                                                        : '#DC2626',
                                            }}
                                        >
                                            {newPassword === confirmPassword
                                                ? '✓ Passwords match'
                                                : '✕ Passwords do not match'}
                                        </div>
                                    )}
                                </div>

                                {/* WARNING */}
                                <div
                                    style={{
                                        background: '#FEF3C7',
                                        border: '1px solid #FCD34D',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        fontSize: 12,
                                        color: '#92400E',
                                    }}
                                >
                                    ⚠️ Password change ke baad dobara login karna padega
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        savingPassword ||
                                        newPassword !== confirmPassword ||
                                        newPassword.length < 6
                                    }
                                    className="btn btn-primary"
                                    style={btnPrimary}
                                >
                                    {savingPassword ? '⏳ Changing...' : '🔐 Change Password'}
                                </button>
                            </form>
                        )}

                        {/* ═══════════════════════════════
                            TAB 3: NOTIFICATIONS
                        ═══════════════════════════════ */}
                        {tab === 'notifications' && (
                            <form onSubmit={handleNotificationsUpdate}>
                                <h2 style={sectionTitle}>
                                    🔔 Notification Preferences
                                </h2>
                                <p style={sectionDesc}>
                                    Choose how you want to be notified
                                </p>

                                <div style={toggleRow}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>
                                            Booking Confirmations
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            Email on booking confirmation
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={notifications.emailBooking}
                                        onChange={(v) =>
                                            setNotifications({
                                                ...notifications,
                                                emailBooking: v,
                                            })
                                        }
                                    />
                                </div>

                                <div style={toggleRow}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>
                                            Booking Reminders
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            Reminder before your stay
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={notifications.emailReminders}
                                        onChange={(v) =>
                                            setNotifications({
                                                ...notifications,
                                                emailReminders: v,
                                            })
                                        }
                                    />
                                </div>

                                <div style={toggleRow}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>
                                            Offers & Promotions
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            Special deals and discounts
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={notifications.emailOffers}
                                        onChange={(v) =>
                                            setNotifications({
                                                ...notifications,
                                                emailOffers: v,
                                            })
                                        }
                                    />
                                </div>

                                <div style={{ ...toggleRow, borderBottom: 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>
                                            SMS Alerts
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            SMS notifications
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={notifications.smsAlerts}
                                        onChange={(v) =>
                                            setNotifications({
                                                ...notifications,
                                                smsAlerts: v,
                                            })
                                        }
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingNotifications}
                                    className="btn btn-primary"
                                    style={btnPrimary}
                                >
                                    {savingNotifications
                                        ? '⏳ Saving...'
                                        : '💾 Save Settings'}
                                </button>
                            </form>
                        )}

                        {/* ═══════════════════════════════
                            TAB 4: SECURITY
                        ═══════════════════════════════ */}
                        {tab === 'security' && (
                            <div>
                                <h2 style={sectionTitle}>🛡️ Security</h2>
                                <p style={sectionDesc}>
                                    Account security information
                                </p>

                                <div
                                    style={{
                                        background: '#F0F9FF',
                                        border: '1px solid #BAE6FD',
                                        borderRadius: 12,
                                        padding: 20,
                                        marginBottom: 24,
                                    }}
                                >
                                    <div style={{ fontSize: 13, color: '#075985', marginBottom: 8 }}>
                                        <strong>Account Created:</strong>{' '}
                                        {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN')}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#075985', marginBottom: 8 }}>
                                        <strong>Email:</strong> {user?.email}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#075985' }}>
                                        <strong>Role:</strong>{' '}
                                        {user?.role === 'admin' ? '🛡️ Administrator' : '👤 User'}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: '#F0FDF4',
                                        border: '1px solid #86EFAC',
                                        borderRadius: 12,
                                        padding: 20,
                                        marginBottom: 24,
                                    }}
                                >
                                    <h4
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#166534',
                                            marginBottom: 12,
                                        }}
                                    >
                                        💡 Security Tips
                                    </h4>
                                    <ul
                                        style={{
                                            fontSize: 12,
                                            color: '#166534',
                                            paddingLeft: 20,
                                            lineHeight: 1.8,
                                            margin: 0,
                                        }}
                                    >
                                        <li>Use a strong unique password</li>
                                        <li>Never share your password</li>
                                        <li>Logout from shared devices</li>
                                        <li>Check bookings regularly</li>
                                    </ul>
                                </div>

                                <div
                                    style={{
                                        background: '#FEF2F2',
                                        border: '1px solid #FCA5A5',
                                        borderRadius: 12,
                                        padding: 20,
                                    }}
                                >
                                    <h4
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#991B1B',
                                            marginBottom: 6,
                                        }}
                                    >
                                        ⚠️ Danger Zone
                                    </h4>
                                    <p
                                        style={{
                                            fontSize: 12,
                                            color: '#991B1B',
                                            marginBottom: 16,
                                        }}
                                    >
                                        Once deleted, your account cannot be
                                        recovered.
                                    </p>

                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            style={{
                                                padding: '10px 24px',
                                                background: '#DC2626',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: 13,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            🗑️ Delete My Account
                                        </button>
                                    ) : (
                                        <div>
                                            {/* 👇 Password input with eye */}
                                            <div style={{ position: 'relative', marginBottom: 12 }}>
                                                <input
                                                    type={showDeletePass ? 'text' : 'password'}
                                                    className="form-control"
                                                    placeholder="Apna password daalein"
                                                    value={deletePassword}
                                                    onChange={(e) =>
                                                        setDeletePassword(e.target.value)
                                                    }
                                                    style={{ paddingRight: 45 }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeletePass(!showDeletePass)}
                                                    style={eyeButtonStyle}
                                                    title={showDeletePass ? 'Hide password' : 'Show password'}
                                                >
                                                    {showDeletePass ? '🙈' : '👁️'}
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        setDeletePassword('');
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 20px',
                                                        background: '#fff',
                                                        color: 'var(--navy)',
                                                        border: '1.5px solid #E5E7EB',
                                                        borderRadius: 8,
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleting}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 20px',
                                                        background: deleting
                                                            ? '#9CA3AF'
                                                            : '#DC2626',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 8,
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        cursor: deleting
                                                            ? 'not-allowed'
                                                            : 'pointer',
                                                    }}
                                                >
                                                    {deleting
                                                        ? '⏳ Deleting...'
                                                        : 'Confirm Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <Footer />
        </>
    );
}

// ============================================
// TOGGLE SWITCH COMPONENT
// ============================================
function ToggleSwitch({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            style={{
                position: 'relative',
                width: 48,
                height: 26,
                borderRadius: 13,
                border: 'none',
                background: checked
                    ? 'linear-gradient(135deg, #D4AF37, #B8912E)'
                    : '#E5E7EB',
                cursor: 'pointer',
                transition: 'background 0.3s',
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    position: 'absolute',
                    top: 3,
                    left: checked ? 25 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
            />
        </button>
    );
}

export default Settings;