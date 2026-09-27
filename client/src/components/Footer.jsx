import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

function Footer() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        axios
            .get(`${API}/api/settings`)
            .then(({ data }) => {
                if (data.success) setSettings(data.settings);
            })
            .catch((err) => console.error('Footer settings load failed:', err));
    }, []);

    const hotelName   = settings?.hotelName || 'Siyaram Palace';
    const description = settings?.footer?.description ||
        'Experience divine hospitality near Ram Mandir. Modern amenities with traditional values.';
    const location    = settings?.location || 'Near Ram Mandir, Ayodhya';
    const phone       = settings?.phone    || '+91-9315377668';
    const email       = settings?.email    || 'info@siyarampace.in';
    const copyright   = settings?.footer?.copyright ||
        `© ${new Date().getFullYear()} Siyaram Palace. All Rights Reserved.`;
    const facebook    = settings?.facebook  || '';
    const instagram   = settings?.instagram || '';
    const whatsapp    = settings?.whatsapp  || '';

    return (
        <footer
            style={{
                background: 'var(--navy)',
                color: 'rgba(255,255,255,0.7)',
                padding: '60px 20px 25px',
                marginTop: 40,
            }}
        >
            <div
                style={{
                    maxWidth: '1320px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 40,
                    paddingBottom: 40,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                {/* Logo + Tagline */}
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 16,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 28,
                                color: '#D4AF37',
                                filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))',
                                display: 'inline-block',
                                animation: 'rotate3DCrown 6s infinite linear',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            ♔
                        </div>
                        <h3
                            style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: 24,
                                fontWeight: 700,
                                color: '#D4AF37',
                                margin: 0,
                            }}
                        >
                            {hotelName}
                        </h3>
                    </div>

                    <p
                        style={{
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.65)',
                            lineHeight: 1.7,
                            margin: 0,
                            maxWidth: 340,
                        }}
                    >
                        {description}
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={headingStyle}>Quick Links</h4>
                    <Link to="/" style={footerLink}>Home</Link>
                    <Link to="/rooms" style={footerLink}>Rooms</Link>
                    <Link to="/my-bookings" style={footerLink}>My Bookings</Link>
                </div>

                {/* Contact */}
                <div>
                    <h4 style={headingStyle}>Contact</h4>
                    <p style={footerLink}>📍 {location}</p>
                    <p style={footerLink}>📞 {phone}</p>
                    <p style={footerLink}>✉️ {email}</p>
                </div>

                {/* Follow Us */}
                <div>
                    <h4 style={headingStyle}>Follow Us</h4>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {facebook ? (
                            <a href={facebook} target="_blank" rel="noopener noreferrer" style={socialBtn}>📘</a>
                        ) : (
                            <span style={{ ...socialBtn, opacity: 0.4 }}>📘</span>
                        )}
                        {instagram ? (
                            <a href={instagram} target="_blank" rel="noopener noreferrer" style={socialBtn}>📷</a>
                        ) : (
                            <span style={{ ...socialBtn, opacity: 0.4 }}>📷</span>
                        )}
                        {whatsapp ? (
                            <a href={whatsapp} target="_blank" rel="noopener noreferrer" style={socialBtn}>💬</a>
                        ) : (
                            <span style={{ ...socialBtn, opacity: 0.4 }}>💬</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div
                style={{
                    maxWidth: '1320px',
                    margin: '20px auto 0',
                    paddingTop: 20,
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.4)',
                }}
            >
                {copyright}
            </div>

            <style>{`
                @keyframes rotate3DCrown {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
            `}</style>
        </footer>
    );
}

const headingStyle = {
    color: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 18,
};

const footerLink = {
    display: 'block',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    padding: '5px 0',
    textDecoration: 'none',
};

const socialBtn = {
    width: 36,
    height: 36,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontSize: 16,
    color: 'inherit',
};

export default Footer;