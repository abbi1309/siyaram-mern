 
import { useNavigate } from 'react-router-dom';

function RoomDetailsModal({ room, onClose }) {
    const navigate = useNavigate();
    const amenitiesList = [
        { key: 'ac', label: 'Air Conditioner', icon: '❄️' },
        { key: 'wifi', label: 'Free WiFi', icon: '📶' },
        { key: 'attachedBathroom', label: 'Attached Bathroom', icon: '🚿' },
        { key: 'tv', label: 'LED TV', icon: '📺' },
        { key: 'hotWater', label: '24/7 Hot Water', icon: '🌡️' },
        { key: 'roomService', label: 'Room Service', icon: '🛎️' },
        { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
        { key: 'parking', label: 'Free Parking', icon: '🚗' }
    ];

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 10000, padding: 20,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            overflowY: 'auto'
        }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                background: 'white', maxWidth: 700, width: '100%',
                borderRadius: 20, padding: 32, position: 'relative',
                borderTop: '6px solid var(--gold)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: 16, right: 20,
                    fontSize: 30, color: 'var(--text-muted)',
                    cursor: 'pointer', background: 'none', border: 'none'
                }}>×</button>

                <h2 style={{ color: 'var(--navy)', marginBottom: 5 }}>
                    Room {room.roomNumber} — {room.roomType}
                </h2>
                <div style={{ display: 'flex', gap: 15, color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                    <span>🛏️ {room.bedType}</span>
                    <span>👁️ {room.view}</span>
                    <span>👥 Max {room.maxGuests}</span>
                    <span>📐 {room.roomSize} m²</span>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                    color: 'white', padding: '20px 24px',
                    borderRadius: 14, marginBottom: 24,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase' }}>Price per Night</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold)' }}>₹{room.pricePerNight}</div>
                    </div>
                    <div style={{ fontSize: 46 }}>💰</div>
                </div>

                <h3 style={{ marginBottom: 14 }}>✨ Amenities</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                    {amenitiesList.map(a => (
                        <div key={a.key} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px',
                            background: room.amenities?.[a.key] ? '#E8F5E9' : '#F5F5F5',
                            borderRadius: 10, fontSize: 12.5,
                            color: room.amenities?.[a.key] ? '#166534' : '#999'
                        }}>
                            <span style={{ fontSize: 16 }}>{a.icon}</span>
                            <span>{a.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                    <button onClick={onClose} className="btn btn-outline">Close</button>
                    {room.status === 'Available' ? (
                        <button onClick={() => { onClose(); navigate(`/booking/${room._id}`); }} className="btn btn-primary">
                            📝 Book — ₹{room.pricePerNight}/night
                        </button>
                    ) : (
                        <button className="btn btn-outline" disabled>Unavailable</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RoomDetailsModal;