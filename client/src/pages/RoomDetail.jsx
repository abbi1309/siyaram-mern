 
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getRoomById } from '../api/rooms';

function RoomDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);

    useEffect(() => { loadRoom(); }, [id]);

    const loadRoom = async () => {
        try {
            const data = await getRoomById(id);
            if (data.success) setRoom(data.room);
        } catch (e) { console.error(e); }
    };

    if (!room) return (
        <>
            <Navbar />
            <div className="loader" style={{ marginTop: 200 }}></div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 24px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                    <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link> &gt;
                    <Link to="/rooms" style={{ color: 'var(--text-muted)' }}> Rooms</Link> &gt;
                    <span style={{ color: 'var(--gold-dark)' }}> Room {room.roomNumber}</span>
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30 }}>
                    <div>
                        <div style={{
                            aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                            borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 120, marginBottom: 20
                        }}>🏨</div>

                        <h1 style={{ color: 'var(--navy)', marginBottom: 8 }}>
                            Room {room.roomNumber} — {room.roomType}
                        </h1>
                        <div style={{ display: 'flex', gap: 15, color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                            <span>⭐ 4.8 (45 reviews)</span>
                            <span>🛏️ {room.bedType}</span>
                            <span>📐 {room.roomSize} m²</span>
                            <span>👥 Max {room.maxGuests}</span>
                        </div>

                        <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 20 }}>
                            <h3 style={{ marginBottom: 12 }}>Room Description</h3>
                            <p>{room.description}</p>
                        </div>

                        <div style={{ background: 'white', padding: 24, borderRadius: 16 }}>
                            <h3 style={{ marginBottom: 16 }}>Amenities</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {Object.entries(room.amenities || {}).filter(([k, v]) => v).map(([k]) => (
                                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                        ✅ {k.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside style={{
                        background: 'white', padding: 24, borderRadius: 16,
                        height: 'fit-content', position: 'sticky', top: 100,
                        borderTop: '4px solid var(--gold)'
                    }}>
                        <div style={{ marginBottom: 20 }}>
                            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)' }}>₹{room.pricePerNight}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/ night</span>
                        </div>

                        <button
                            className="btn btn-primary btn-block btn-lg"
                            onClick={() => navigate(`/booking/${room._id}`)}
                            disabled={room.status !== 'Available'}
                        >
                            {room.status === 'Available' ? '📝 Book Now' : 'Not Available'}
                        </button>

                        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
                            <p style={{ marginBottom: 8 }}>📞 Need help? +91-9315377668</p>
                            <p>✅ Free cancellation up to 24h</p>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default RoomDetail;