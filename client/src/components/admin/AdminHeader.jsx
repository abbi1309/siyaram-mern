import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminHeader({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={{
            background: 'white',
            padding: '14px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Menu Button (mobile) */}
            <button
                onClick={onMenuClick}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 22,
                    cursor: 'pointer',
                    color: '#0A1E3F',
                    display: window.innerWidth > 900 ? 'none' : 'block'
                }}
            >☰</button>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: 400 }}>
                <input
                    type="text"
                    placeholder="🔍 Search bookings, guests..."
                    style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: '2px solid #F0F2F5',
                        borderRadius: 10,
                        fontSize: 13,
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <div style={{ flex: 1 }} />

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowProfile(!showProfile)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 4
                    }}
                >
                    <div style={{
                        width: 38,
                        height: 38,
                        background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                        color: '#0A1E3F',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16
                    }}>{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
                    <span style={{ fontWeight: 600, color: '#0A1E3F', fontSize: 14 }}>
                        {user?.name || 'Admin'}
                    </span>
                </button>

                {showProfile && (
                    <div style={{
                        position: 'absolute',
                        top: 50,
                        right: 0,
                        background: 'white',
                        borderRadius: 12,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        minWidth: 220,
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F2F5' }}>
                            <div style={{ fontWeight: 700, color: '#0A1E3F' }}>{user?.name}</div>
                            <div style={{ fontSize: 12, color: '#6C757D' }}>{user?.email}</div>
                        </div>
                        <button
                            onClick={() => { navigate('/admin/settings'); setShowProfile(false); }}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: 13,
                                color: '#0A1E3F'
                            }}
                        >⚙️ Settings</button>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '12px 20px',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: 13,
                                color: '#DC2626',
                                borderTop: '1px solid #F0F2F5'
                            }}
                        >🚪 Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default AdminHeader;