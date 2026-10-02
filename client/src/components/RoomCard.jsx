import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function RoomCard({ room, onDetails }) {
    const navigate = useNavigate();
    const cardRef = useRef(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

    const isAvailable = room.status === 'Available';
    const isBooked = room.status === 'Booked';
    const isOccupied = room.status === 'Occupied';
    const isMaintenance = room.status === 'Maintenance';

    // Pick image based on room type
    const roomImages = {
        'Deluxe Room': ['/images/viewRoom.jpg', '/images/viewRoom.jpg', '/images/viewRoom.jpg'],
        'Executive Suite': ['/images/viewRoom.jpg', '/images/viewRoom.jpg', '/images/viewRoom.jpg']
    };
    const imageIndex = parseInt(room.roomNumber) % 3;
    const image = roomImages[room.roomType]?.[imageIndex] || '/images/lobby.jpg';

    // 3D Tilt handler
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        setTilt({ x: rotateX, y: rotateY });
        setGlowPos({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setGlowPos({ x: 50, y: 50 });
    };

    const handleBook = (e) => {
        e.stopPropagation();
        navigate(`/booking/${room._id}`);
    };

    const toggleFavorite = (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    return (
        <div
            ref={cardRef}
            onClick={() => onDetails(room)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                background: 'white',
                borderRadius: 20,
                overflow: 'hidden',
                transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
                transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformStyle: 'preserve-3d',
                boxShadow: tilt.x !== 0 || tilt.y !== 0
                    ? '0 25px 60px rgba(10,30,63,0.18), 0 0 0 1px rgba(212,175,55,0.2)'
                    : '0 4px 20px rgba(10,30,63,0.08)',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(10,30,63,0.06)',
                cursor: 'pointer',
                position: 'relative'
            }}
        >
            {/* Dynamic Glow */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(212,175,55,0.15) 0%, transparent 40%)`,
                opacity: tilt.x !== 0 || tilt.y !== 0 ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none',
                zIndex: 10,
                borderRadius: 20
            }} />

            {/* Image Section */}
            <div style={{
                position: 'relative',
                height: 240,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1A2F52, #0A1E3F)',
                transform: 'translateZ(20px)'
            }}>
                <img
                    src={image}
                    alt={`Room ${room.roomNumber}`}
                    onLoad={() => setImgLoaded(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease, opacity 0.5s',
                        opacity: imgLoaded ? 1 : 0,
                        transform: (tilt.x !== 0 || tilt.y !== 0) ? 'scale(1.08)' : 'scale(1)',
                        filter: isBooked ? 'grayscale(0.5) brightness(0.85)' : 'none'
                    }}
                />

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)',
                    pointerEvents: 'none'
                }} />

                {/* Room Number Badge */}
                <div style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: 'rgba(10,30,63,0.95)',
                    backdropFilter: 'blur(10px)',
                    color: 'var(--gold)',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 800,
                    fontFamily: 'Playfair Display, serif',
                    letterSpacing: '1px',
                    border: '1px solid rgba(212,175,55,0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transform: 'translateZ(40px)'
                }}>
                    #{room.roomNumber}
                </div>

                {/* Wishlist Heart */}
                <button
                    onClick={toggleFavorite}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateZ(40px)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateZ(40px) scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateZ(40px) scale(1)'}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>

                {/* Availability Badge */}
                <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 66,
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    color: 'white',
                    background: isAvailable
                        ? 'linear-gradient(135deg, #28A745, #1e8449)'
                        : isBooked
                        ? 'linear-gradient(135deg, #F59E0B, #B45309)'
                        : isOccupied
                        ? 'linear-gradient(135deg, #3B82F6, #1E40AF)'
                        : 'linear-gradient(135deg, #DC3545, #b02a37)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    {isAvailable
                        ? '✓ Available'
                        : isBooked
                        ? '✕ Booked'
                        : isOccupied
                        ? '● Occupied Now'
                        : room.status}
                </div>

                {/* Rating */}
                <div style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 12px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateZ(30px)'
                }}>
                    <span style={{ color: '#FFB400', fontSize: 14 }}>★</span>
                    <span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 13 }}>4.8</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(45)</span>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                <div>
                    <h3 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--navy)',
                        margin: 0,
                        marginBottom: 6
                    }}>
                        Deluxe Room
                    </h3>
                    <div style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        gap: 8
                    }}>
                        <span>🏢 Floor {room.floor}</span>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>📐 {room.roomSize} m²</span>
                    </div>
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <FeaturePill icon="🛏️" text={room.bedType} />
                    {/* <FeaturePill icon="👁️" text={room.view} /> */}
                    <FeaturePill icon="👥" text={`Max ${room.maxGuests}`} />
                </div>

                {/* Amenities */}
                <div style={{
                    display: 'flex',
                    gap: 10,
                    paddingTop: 12,
                    borderTop: '1px dashed #E5E7EB'
                }}>
                    {room.amenities?.ac && <AmenityIcon icon="❄️" label="AC" />}
                    {room.amenities?.wifi && <AmenityIcon icon="📶" label="WiFi" />}
                    {room.amenities?.tv && <AmenityIcon icon="📺" label="TV" />}
                    {/* {room.amenities?.breakfast && <AmenityIcon icon="🍳" label="Breakfast" />} */}
                </div>

                {/* Price + Book */}
                <div style={{
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 16,
                    borderTop: '1px solid #F0F2F5',
                    gap: 12
                }}>
                    {/* Price — Free Cancellation hata diya */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{
                            fontSize: 26,
                            fontWeight: 800,
                            color: isBooked ? '#9CA3AF' : 'var(--navy)',
                            fontFamily: 'Playfair Display, serif',
                            lineHeight: 1,
                            textDecoration: isBooked ? 'line-through' : 'none'
                        }}>₹{room.pricePerNight || 1500}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ night</span>
                    </div>

                    {isAvailable ? (
                        <button
                            onClick={handleBook}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                                color: 'var(--navy)',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 6px 20px rgba(212,175,55,0.3)',
                                whiteSpace: 'nowrap',
                                transform: 'translateZ(30px)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateZ(30px) translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(212,175,55,0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateZ(30px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212,175,55,0.3)';
                            }}
                        >
                            Book Now
                        </button>
                    ) : isOccupied ? (
                        <button
                            onClick={handleBook}
                            style={{
                                padding: '10px 16px',
                                background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
                                whiteSpace: 'nowrap',
                                transform: 'translateZ(30px)',
                                lineHeight: 1.3,
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateZ(30px) translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(59,130,246,0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateZ(30px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.35)';
                            }}
                        >
                            📅 Book
                            <br />
                            <span style={{ fontSize: 10, opacity: 0.9 }}>
                                Future Dates
                            </span>
                        </button>
                    ) : (
                        <button
                            disabled
                            title={
                                isBooked
                                    ? 'Ye room in dates ke liye already booked hai'
                                    : 'Room abhi available nahi hai'
                            }
                            style={{
                                padding: '12px 24px',
                                background: isBooked ? '#FEF3C7' : '#F0F2F5',
                                color: isBooked ? '#92400E' : '#9CA3AF',
                                border: isBooked ? '1px solid #F59E0B' : 'none',
                                borderRadius: 10,
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'not-allowed',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {isBooked ? '✕ Booked' : 'Unavailable'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function FeaturePill({ icon, text }) {
    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: '#F8F9FA',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-body)',
            whiteSpace: 'nowrap'
        }}>
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
}

function AmenityIcon({ icon, label }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            flex: 1
        }}>
            <div style={{
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                background: '#F0F9FF',
                borderRadius: 10,
                border: '1px solid #DBEAFE'
            }}>
                {icon}
            </div>
            <div style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                fontWeight: 600
            }}>{label}</div>
        </div>
    );
}

export default RoomCard;