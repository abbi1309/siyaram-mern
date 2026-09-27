// ============================================
// NAVBAR COMPONENT
// Top navigation bar — user dropdown style
// ============================================

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

function Navbar() {
    // ---------- AUTH ----------
    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // ---------- STATE ----------
    const [mobileOpen, setMobileOpen] = useState(false);   // Mobile drawer
    const [userMenuOpen, setUserMenuOpen] = useState(false); // User dropdown

    // Reference — bahar click detect karne ke liye
    const userMenuRef = useRef(null);

    // ---------- EFFECT: Page change pe sab menus band ----------
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    // ---------- EFFECT: Mobile menu open ho to body scroll lock ----------
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    // ---------- EFFECT: Bahar click pe dropdown band ----------
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    // ---------- HANDLERS ----------
    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        setUserMenuOpen(false);
        navigate('/');
    };

    // ---------- NAV LINKS ----------
    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/rooms', label: 'Rooms' },
        { to: '/amenities', label: 'Amenities' },
        { to: '/gallery', label: 'Gallery' },
        { to: '/about', label: 'About' },
        { to: '/offers', label: 'Offers' },
        { to: '/contact', label: 'Contact' },
    ];

    // ---------- USER MENU ITEMS ----------
    const userMenuItems = [
        { to: '/profile', label: 'My Profile', icon: '👤' },
        { to: '/my-bookings', label: 'My Bookings', icon: '🏨' },
        { to: '/settings', label: 'Settings', icon: '⚙️' },
    ];

    // Admin ke liye extra
    if (user?.role === 'admin') {
        userMenuItems.push({
            to: '/admin',
            label: 'Admin Panel',
            icon: '🛡️',
        });
    }

    return (
        <>
            <nav
                style={{
                    background: 'var(--navy)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(212,175,55,0.15)',
                }}
            >
                <div
                    style={{
                        maxWidth: '1400px',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px',
                        height: '72px',
                        gap: '12px',
                    }}
                >
                    {/* ═══════ LOGO ═══════ */}
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            textDecoration: 'none',
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 26,
                                color: 'var(--gold)',
                                filter:
                                    'drop-shadow(0 0 10px rgba(212,175,55,0.5))',
                                display: 'inline-block',
                                animation: 'rotate3DCrown 6s infinite linear',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            ♔
                        </div>
                        <div
                            style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'white',
                                lineHeight: 1.1,
                                letterSpacing: '0.5px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            SIYARAM PALACE
                        </div>
                    </Link>

                    {/* ═══════ DESKTOP NAV LINKS ═══════ */}
                    <div
                        className="desktop-nav"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            flex: 1,
                            justifyContent: 'center',
                        }}
                    >
                        {navLinks.map((link) => (
                            <NavItem
                                key={link.to}
                                to={link.to}
                                label={link.label}
                            />
                        ))}
                    </div>

                    {/* ═══════ DESKTOP RIGHT ACTIONS ═══════ */}
                    <div
                        className="desktop-actions"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexShrink: 0,
                        }}
                    >
                        {/* Phone */}
                        <a
                            href="tel:+919315377668"
                            className="desktop-phone"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: 13,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 10px',
                                borderRadius: 8,
                            }}
                        >
                            <span style={{ color: 'var(--gold)', fontSize: 14 }}>
                                📞
                            </span>
                            +91 98765 43210
                        </a>

                        {/* ═══════ NOT LOGGED IN ═══════ */}
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    to="/login"
                                    style={{
                                        padding: '9px 18px',
                                        background: 'transparent',
                                        color: 'white',
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    style={{
                                        padding: '9px 18px',
                                        background:
                                            'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                                        color: 'var(--navy)',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        boxShadow:
                                            '0 6px 20px rgba(212,175,55,0.3)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Book Now
                                </Link>
                            </>
                        ) : (
                            /* ═══════ USER DROPDOWN ═══════ */
                            <div
                                ref={userMenuRef}
                                style={{ position: 'relative' }}
                            >
                                {/* User Button */}
                                <button
                                    onClick={() =>
                                        setUserMenuOpen(!userMenuOpen)
                                    }
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '6px 12px 6px 6px',
                                        background: userMenuOpen
                                            ? 'rgba(212,175,55,0.15)'
                                            : 'rgba(255,255,255,0.08)',
                                        border: userMenuOpen
                                            ? '1px solid var(--gold)'
                                            : '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 30,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {/* Avatar */}
                                    <div
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: '50%',
                                            background:
                                                'linear-gradient(135deg, #D4AF37, #B8912E)',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 14,
                                            fontWeight: 800,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {(user?.name || 'U')
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    {/* Name */}
                                    <span
                                        className="desktop-user"
                                        style={{
                                            color: 'white',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {user.name?.split(' ')[0]}
                                    </span>

                                    {/* Arrow */}
                                    <span
                                        style={{
                                            color: 'var(--gold)',
                                            fontSize: 10,
                                            transform: userMenuOpen
                                                ? 'rotate(180deg)'
                                                : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                        }}
                                    >
                                        ▼
                                    </span>
                                </button>

                                {/* ═══════ DROPDOWN MENU — OPTION 1 ═══════ */}
                                {userMenuOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 10px)',
                                            right: 0,
                                            minWidth: 240,
                                            background: '#fff',
                                            borderRadius: 14,
                                            boxShadow:
                                                '0 12px 40px rgba(0,0,0,0.25)',
                                            overflow: 'hidden',
                                            animation: 'dropdownFade 0.2s ease',
                                            zIndex: 2000,
                                        }}
                                    >
                                        {/* ---------- USER HEADER ---------- */}
                                        <div
                                            style={{
                                                padding: '16px 18px',
                                                background:
                                                    'linear-gradient(135deg, #0A1E3F, #1A3A6B)',
                                                color: '#fff',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    marginBottom: 4,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {user.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    opacity: 0.75,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {user.email}
                                            </div>
                                        </div>

                                        {/* ---------- MENU ITEMS ---------- */}
                                        <div style={{ padding: 8 }}>
                                            {userMenuItems.map((item) => (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() =>
                                                        setUserMenuOpen(false)
                                                    }
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 12,
                                                        padding: '11px 14px',
                                                        color: 'var(--navy)',
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        textDecoration: 'none',
                                                        borderRadius: 8,
                                                        transition:
                                                            'background 0.15s',
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.background =
                                                            '#F5F7FA')
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.background =
                                                            'transparent')
                                                    }
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 16,
                                                            width: 20,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </span>
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* ---------- DIVIDER ---------- */}
                                        <div
                                            style={{
                                                height: 1,
                                                background: '#F0F2F5',
                                                margin: '0 8px',
                                            }}
                                        />

                                        {/* ---------- LOGOUT ---------- */}
                                        <div style={{ padding: 8 }}>
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    padding: '11px 14px',
                                                    color: '#DC2626',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    background: 'transparent',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background =
                                                        '#FEF2F2')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background =
                                                        'transparent')
                                                }
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 16,
                                                        width: 20,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    🚪
                                                </span>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ═══════ MOBILE HAMBURGER ═══════ */}
                    <button
                        className="hamburger"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Menu"
                        style={{
                            display: 'none',
                            background: 'transparent',
                            border: '1px solid rgba(212,175,55,0.5)',
                            borderRadius: 8,
                            width: 42,
                            height: 42,
                            color: 'var(--gold)',
                            fontSize: 20,
                            fontWeight: 800,
                            cursor: 'pointer',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* ═══════ RESPONSIVE CSS ═══════ */}
                <style>{`
                    .nav-item {
                        color: rgba(255,255,255,0.85);
                        padding: 8px 12px;
                        border-radius: 8px;
                        font-size: 13px;
                        font-weight: 500;
                        transition: all 0.3s;
                        text-decoration: none;
                        white-space: nowrap;
                    }
                    .nav-item:hover {
                        color: var(--gold);
                    }

                    @media (max-width: 1150px) {
                        .desktop-phone { display: none !important; }
                    }

                    @media (max-width: 1024px) {
                        .desktop-nav { display: none !important; }
                    }

                    @media (max-width: 900px) {
                        .desktop-actions { display: none !important; }
                        .hamburger { display: flex !important; }
                    }

                    @media (max-width: 500px) {
                        .desktop-user { display: none !important; }
                    }

                    @keyframes rotate3DCrown {
                        0% { transform: rotateY(0deg); }
                        100% { transform: rotateY(360deg); }
                    }

                    @keyframes dropdownFade {
                        from { opacity: 0; transform: translateY(-8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}</style>
            </nav>

            {/* ═══════ MOBILE MENU DRAWER ═══════ */}
            {mobileOpen && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setMobileOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 1001,
                            top: 72,
                        }}
                    />

                    {/* Drawer */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 72,
                            right: 0,
                            width: '300px',
                            maxWidth: '85vw',
                            height: 'calc(100vh - 72px)',
                            background: 'var(--navy)',
                            zIndex: 1002,
                            overflowY: 'auto',
                            boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
                            padding: '20px',
                            animation: 'slideInRight 0.3s ease',
                        }}
                    >
                        {/* Nav Links */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                marginBottom: 20,
                            }}
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        padding: '12px 16px',
                                        color: 'rgba(255,255,255,0.9)',
                                        textDecoration: 'none',
                                        fontSize: 15,
                                        fontWeight: 600,
                                        borderRadius: 10,
                                        background:
                                            location.pathname === link.to
                                                ? 'rgba(212,175,55,0.15)'
                                                : 'transparent',
                                        borderLeft:
                                            location.pathname === link.to
                                                ? '3px solid var(--gold)'
                                                : '3px solid transparent',
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div
                            style={{
                                height: 1,
                                background: 'rgba(255,255,255,0.1)',
                                marginBottom: 20,
                            }}
                        ></div>

                        {/* Phone */}
                        <a
                            href="tel:+919315377668"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '12px 16px',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: 14,
                                fontWeight: 600,
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 10,
                                marginBottom: 20,
                            }}
                        >
                            <span style={{ color: 'var(--gold)', fontSize: 18 }}>
                                📞
                            </span>
                            +91 98765 43210
                        </a>

                        {/* User Section */}
                        {!isLoggedIn ? (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                }}
                            >
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        padding: '14px',
                                        background: 'transparent',
                                        color: 'white',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderRadius: 10,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        padding: '14px',
                                        background:
                                            'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                                        color: 'var(--navy)',
                                        borderRadius: 10,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                    }}
                                >
                                    🏨 Book Now
                                </Link>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                }}
                            >
                                {/* User Info */}
                                <div
                                    style={{
                                        padding: 12,
                                        background:
                                            'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                                        borderRadius: 12,
                                        marginBottom: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            color: '#fff',
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {user.name}
                                    </div>
                                    <div
                                        style={{
                                            color: 'rgba(255,255,255,0.6)',
                                            fontSize: 11,
                                            marginTop: 2,
                                        }}
                                    >
                                        {user.email}
                                    </div>
                                </div>

                                {/* Menu items */}
                                {userMenuItems.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '12px 16px',
                                            color: 'white',
                                            background:
                                                location.pathname === item.to
                                                    ? 'rgba(212,175,55,0.15)'
                                                    : 'rgba(255,255,255,0.05)',
                                            borderRadius: 10,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 16,
                                                width: 20,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </Link>
                                ))}

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '14px',
                                        background:
                                            'linear-gradient(135deg, #DC2626, #991B1B)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 10,
                                        fontSize: 14,
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        marginTop: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 16,
                                            width: 20,
                                            textAlign: 'center',
                                        }}
                                    >
                                        🚪
                                    </span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

// ============================================
// NAV ITEM COMPONENT
// Desktop nav links ke liye
// ============================================
function NavItem({ to, href, label }) {
    if (href) {
        return (
            <a href={href} className="nav-item">
                {label}
            </a>
        );
    }
    return (
        <Link to={to} className="nav-item">
            {label}
        </Link>
    );
}

export default Navbar;