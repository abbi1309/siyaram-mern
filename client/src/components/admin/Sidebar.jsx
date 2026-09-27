import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ isOpen, onClose }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const links = [
        { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
        { to: '/admin/bookings', label: 'Bookings', icon: '📋' },
        { to: '/admin/rooms', label: 'Rooms', icon: '🏨' },
        { to: '/admin/cancel-requests', label: 'Cancel Requests', icon: '⚠️' },
        { to: '/admin/users', label: 'Users', icon: '👥' },
        { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
        { to: '/admin/gallery', label: 'Gallery', icon: '📸' },
        { to: '/admin/messages', label: 'Messages', icon: '📬' },   // 👈 YE ADD KIYA
        { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
        { to: '/admin/coupons', label: 'Offers', icon: '🎁' },   // ✅ FIXED
    ];

    const handleLogout = () => {
        if (confirm('Logout karna hai?')) {
            logout();
            navigate('/');
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        display: window.innerWidth <= 900 ? 'block' : 'none'
                    }}
                />
            )}

            <aside style={{
                width: 260,
                background: 'linear-gradient(180deg, #0A1E3F 0%, #061428 100%)',
                height: '100vh',
                overflow: 'hidden',
                position: 'fixed',
                left: 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                transform: window.innerWidth <= 900
                    ? (isOpen ? 'translateX(0)' : 'translateX(-100%)')
                    : 'translateX(0)',
                transition: 'transform 0.3s ease',
                boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
            }}>
                {/* Logo */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        color: '#0A1E3F',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(212,175,55,0.4)'
                    }}>♔</div>
                    <div>
                        <div style={{
                            color: 'white',
                            fontFamily: 'Playfair Display, serif',
                            fontWeight: 700,
                            fontSize: 16,
                            lineHeight: 1.1
                        }}>SIYARAM PALACE</div>
                        <div style={{
                            color: '#D4AF37',
                            fontSize: 9,
                            letterSpacing: '2px',
                            marginTop: 3,
                            fontWeight: 600
                        }}>ADMIN PANEL</div>
                    </div>
                </div>

                {/* User Info */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        background: 'rgba(212,175,55,0.15)',
                        border: '1px solid rgba(212,175,55,0.4)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D4AF37',
                        fontWeight: 700,
                        fontSize: 16
                    }}>
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            color: 'white',
                            fontSize: 13,
                            fontWeight: 600
                        }}>{user?.name || 'Admin'}</div>
                        <div style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 11
                        }}>🛡️ Administrator</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 12px'
                }}>
                    <div style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        padding: '8px 12px',
                        textTransform: 'uppercase'
                    }}>
                        Main Menu
                    </div>

                    {links.map(l => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.end}
                            onClick={onClose}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 14px',
                                margin: '4px 0',
                                color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.75)',
                                background: isActive
                                    ? 'linear-gradient(90deg, rgba(212,175,55,0.15), transparent)'
                                    : 'transparent',
                                borderLeft: isActive ? '3px solid #D4AF37' : '3px solid transparent',
                                textDecoration: 'none',
                                fontSize: 14,
                                fontWeight: isActive ? 700 : 500,
                                borderRadius: '0 8px 8px 0',
                                transition: 'all 0.2s'
                            })}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.style.borderLeftColor.includes('rgb(212')) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!e.currentTarget.style.borderLeftColor.includes('rgb(212')) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{l.icon}</span>
                            <span>{l.label}</span>
                        </NavLink>
                    ))}

                    <div style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        padding: '16px 12px 8px',
                        textTransform: 'uppercase',
                        marginTop: 15
                    }}>
                        Quick Links
                    </div>

                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 14px',
                            margin: '4px 0',
                            color: 'rgba(255,255,255,0.75)',
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                            borderRadius: 8,
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: 18 }}>🌐</span>
                        <span>View Website</span>
                    </a>
                </nav>

                {/* Logout */}
                <div style={{
                    padding: 16,
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'rgba(220,38,38,0.15)',
                            border: '1px solid rgba(220,38,38,0.4)',
                            color: '#FCA5A5',
                            borderRadius: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220,38,38,0.3)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(220,38,38,0.15)';
                            e.currentTarget.style.color = '#FCA5A5';
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;