import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Hero() {
    const navigate = useNavigate();
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState('2');

    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        setCheckIn(tomorrow.toISOString().split('T')[0]);
        setCheckOut(dayAfter.toISOString().split('T')[0]);
    }, []);

    const handleSearch = () => {
        if (new Date(checkOut) <= new Date(checkIn)) {
            alert('Check-out must be after check-in');
            return;
        }
        navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
    };

    return (
        <section style={{ position: 'relative' }}>
            {/* HERO SECTION */}
            <div style={{
                position: 'relative',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                padding: '80px',
                backgroundImage: `linear-gradient(90deg, rgba(10,30,63,0.92) 0%, rgba(10,30,63,0.70) 45%, rgba(10,30,63,0.30) 100%), url('/images/hotel-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                color: 'white'
            }}>
                <div style={{ maxWidth: 620, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 25, color: '#D4AF37',
                        fontSize: 12, fontWeight: 600,
                        letterSpacing: '3px', textTransform: 'uppercase'
                    }}>
                        <span style={{ width: 40, height: 2, background: '#D4AF37' }}></span>
                        Welcome to Siyaram Palace
                    </div>

                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 'clamp(38px, 4.5vw, 64px)',
                        color: 'white',
                        lineHeight: 1.1,
                        marginBottom: 25,
                        fontWeight: 700,
                        textShadow: '0 4px 20px rgba(0,0,0,0.6)'
                    }}>
                        Experience <span style={{
                            color: '#D4AF37',
                            fontStyle: 'italic',
                            fontWeight: 500
                        }}>Royal Luxury</span>
                        <br />
                        at Siyaram Palace
                    </h1>

                    <p style={{
                        fontSize: 'clamp(14px, 1.3vw, 17px)',
                        color: 'rgba(255,255,255,0.9)',
                        lineHeight: 1.7,
                        marginBottom: 35,
                        maxWidth: 540,
                        fontWeight: 300,
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        A perfect blend of royal heritage and modern luxury, offering an
                        unforgettable stay experience in the heart of India.
                    </p>

                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/rooms')}
                            style={{
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                                color: '#0A1E3F',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                boxShadow: '0 10px 30px rgba(212,175,55,0.4)',
                                transition: 'all 0.3s',
                                letterSpacing: '0.5px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(212,175,55,0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(212,175,55,0.4)';
                            }}
                        >
                            📅 Book Your Stay
                        </button>

                        <button
                            onClick={() => navigate('/rooms')}
                            style={{
                                padding: '14px 32px',
                                background: 'transparent',
                                color: 'white',
                                border: '2px solid rgba(255,255,255,0.5)',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                transition: 'all 0.3s',
                                letterSpacing: '0.5px',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#D4AF37';
                                e.currentTarget.style.color = '#D4AF37';
                                e.currentTarget.style.background = 'rgba(212,175,55,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            Explore Rooms →
                        </button>
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 50,
                    left: 80,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    zIndex: 3
                }}>
                    <span style={{
                        fontSize: 26, color: '#D4AF37',
                        filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.6))'
                    }}>♔</span>
                    <div>
                        <div style={{
                            color: 'white', fontSize: 13, fontStyle: 'italic',
                            fontFamily: 'Playfair Display, serif', fontWeight: 600
                        }}>More Than Just a Stay</div>
                        <div style={{
                            color: '#D4AF37', fontSize: 12,
                            fontFamily: 'Playfair Display, serif', fontStyle: 'italic'
                        }}>It's a Royal Experience</div>
                    </div>
                </div>
            </div>

            {/* FEATURES STRIP */}
            <div style={{
                background: '#061428',
                borderTop: '1px solid rgba(212,175,55,0.2)',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
                padding: '24px 80px',
                position: 'relative',
                zIndex: 5
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 20,
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    <FeatureItem icon="🛏️" title="Comfortable Rooms" subtitle="Stay in luxury" />
                    <FeatureItem icon="🍽️" title="Delicious Food" subtitle="Multi-cuisine restaurant" />
                    <FeatureItem icon="🛡️" title="24/7 Support" subtitle="Always here for you" />
                    <FeatureItem icon="📍" title="Prime Location" subtitle="Easy access to city" />
                </div>
            </div>

            {/* WHITE SEARCH SECTION */}
            <div style={{
                background: 'white',
                padding: '20px 80px 20px',
                position: 'relative'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 24,
                        padding: 10,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr auto',
                        gap: 0,
                        boxShadow: '0 20px 60px rgba(10,30,63,0.15), 0 0 0 1px rgba(212,175,55,0.2)',
                        border: '2px solid rgba(212,175,55,0.25)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: 3,
                            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                            opacity: 0.8
                        }} />

                        <SearchField
                            icon="📅"
                            label="Check-in Date"
                            value={checkIn}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={setCheckIn}
                        />
                        <SearchField
                            icon="📅"
                            label="Check-out Date"
                            value={checkOut}
                            min={checkIn}
                            onChange={setCheckOut}
                            border
                        />
                        <SearchField
                            icon="👥"
                            label="Guests"
                            value={guests}
                            onChange={setGuests}
                            type="select"
                            border
                        />

                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '0 36px',
                                background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                                color: '#0A1E3F',
                                border: 'none',
                                borderRadius: 16,
                                fontSize: 14,
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                boxShadow: '0 10px 30px rgba(212,175,55,0.4)',
                                transition: 'all 0.3s',
                                letterSpacing: '0.5px',
                                whiteSpace: 'nowrap',
                                margin: 4
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(212,175,55,0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(212,175,55,0.4)';
                            }}
                        >
                            🔍 Search Rooms
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ icon, title, subtitle }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'white' }}>
            <div style={{ fontSize: 24, color: '#D4AF37' }}>{icon}</div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{subtitle}</div>
            </div>
        </div>
    );
}

function SearchField({ icon, label, value, min, onChange, type, border }) {
    return (
        <div style={{
            padding: '14px 24px',
            borderLeft: border ? '1px solid #E5E7EB' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            transition: 'background 0.3s',
            cursor: 'pointer',
            borderRadius: 16
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.06)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0
            }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{
                    display: 'block',
                    fontSize: 10,
                    color: '#B8941F',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    marginBottom: 4,
                    letterSpacing: '1px'
                }}>{label}</label>
                {type === 'select' ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'inherit',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#0A1E3F',
                            cursor: 'pointer',
                            background: 'transparent'
                        }}
                    >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                    </select>
                ) : (
                    <input
                        type="date"
                        value={value}
                        min={min}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'inherit',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#0A1E3F',
                            background: 'transparent',
                            colorScheme: 'light'
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default Hero;