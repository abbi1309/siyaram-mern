import { useState, useEffect } from 'react';
import { getAllRooms } from '../../api/rooms';
import { updateRoomStatus, updateRoom } from '../../api/admin';
import toast from 'react-hot-toast';

function RoomsGrid() {
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await getAllRooms();
            if (data.success) {
                // Sort by room number
                const sorted = [...data.rooms].sort(
                    (a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)
                );
                setRooms(sorted);
                setStats(data.stats);

                // 🔍 DEBUG
                console.log('🟢 V4 Code Running - Total rooms:', data.rooms.length);
                console.log('🟢 Room numbers:', sorted.map(r => r.roomNumber).join(', '));
                console.log('🟢 First room:', sorted[0]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateRoomStatus(id, status);
            toast.success('Room updated');
            loadRooms();
        } catch (e) {
            toast.error('Error updating');
        }
    };

    const handlePriceUpdate = async (id, newPrice) => {
        try {
            await updateRoom(id, { pricePerNight: Number(newPrice) });
            toast.success(`Price updated to ₹${newPrice} ✅`);
            loadRooms();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Price update failed');
        }
    };

    const colors = {
        Available: { bg: '#E8F5E9', border: '#27AE60', text: '#166534', icon: '✓' },
        Occupied: { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', icon: '●' },
        Maintenance: { bg: '#F3F4F6', border: '#95A5A6', text: '#4B5563', icon: '🔧' },
        Cleaning: { bg: '#FEF3C7', border: '#F39C12', text: '#92400E', icon: '🧹' },
    };

    return (
        <div
            style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: 25,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div>
                    <h3
                        style={{
                            color: '#0A1E3F',
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 20,
                            margin: 0,
                            marginBottom: 4,
                        }}
                    >
                        🏨 Room Management [V4]
                    </h3>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                        Manage all {rooms.length} rooms
                    </div>
                </div>

                {stats && (
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <StatBadge label="Available" value={stats.available} color="#27AE60" />
                        <StatBadge label="Occupied" value={stats.occupied} color="#DC2626" />
                        <StatBadge label="Cleaning" value={stats.cleaning} color="#F39C12" />
                        <StatBadge label="Maintenance" value={stats.maintenance} color="#95A5A6" />
                    </div>
                )}
            </div>

            {rooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                    ⏳ Loading rooms...
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: 12,
                    }}
                >
                    {rooms.map((room) => (
                        <RoomCell
                            key={room._id}
                            room={room}
                            color={colors[room.status] || colors['Available']}
                            onStatusChange={handleStatusChange}
                            onPriceUpdate={handlePriceUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════
// ROOM CELL
// ═══════════════════════════════════════════════
function RoomCell({ room, color, onStatusChange, onPriceUpdate }) {
    const [editingPrice, setEditingPrice] = useState(false);
    const [priceInput, setPriceInput] = useState(room.pricePerNight || 1500);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const num = Number(priceInput);
        if (!num || num < 100) {
            return toast.error('Minimum ₹100 price daalein');
        }
        if (num > 100000) {
            return toast.error('Maximum ₹100000 price');
        }

        setSaving(true);
        await onPriceUpdate(room._id, num);
        setSaving(false);
        setEditingPrice(false);
    };

    const handleCancel = () => {
        setPriceInput(room.pricePerNight || 1500);
        setEditingPrice(false);
    };

    return (
        <div
            style={{
                background: color.bg,
                border: `2px solid ${color.border}`,
                borderRadius: 12,
                padding: 14,
                textAlign: 'center',
                transition: 'all 0.3s',
            }}
        >
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: color.text,
                    fontFamily: 'Playfair Display, serif',
                    marginBottom: 4,
                }}
            >
                {room.roomNumber}
            </div>

            <div
                style={{
                    fontSize: 10,
                    color: color.text,
                    fontWeight: 700,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}
            >
                {color.icon} {room.status}
            </div>

            {!editingPrice ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginBottom: 10,
                        padding: '6px 8px',
                        background: 'rgba(255,255,255,0.6)',
                        borderRadius: 8,
                    }}
                >
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#0A1E3F',
                            fontFamily: 'Playfair Display, serif',
                        }}
                    >
                        ₹{room.pricePerNight || 1500}
                    </span>
                    <span style={{ fontSize: 9, color: '#6C757D' }}>/night</span>
                    <button
                        onClick={() => {
                            setPriceInput(room.pricePerNight || 1500);
                            setEditingPrice(true);
                        }}
                        title="Edit price"
                        style={{
                            marginLeft: 4,
                            background: '#FEF3C7',
                            border: '1px solid #F59E0B',
                            borderRadius: 6,
                            padding: '2px 6px',
                            fontSize: 11,
                            cursor: 'pointer',
                            lineHeight: 1,
                        }}
                    >
                        ✏️
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    <input
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        autoFocus
                        style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '6px 8px',
                            border: '1.5px solid #D4AF37',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 700,
                            outline: 'none',
                            textAlign: 'center',
                        }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        title="Save"
                        style={{
                            padding: '4px 8px',
                            background: saving ? '#9CA3AF' : '#22C55E',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving ? '...' : '✓'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        title="Cancel"
                        style={{
                            padding: '4px 8px',
                            background: '#F3F4F6',
                            color: '#6B7280',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <select
                value={room.status}
                onChange={(e) => onStatusChange(room._id, e.target.value)}
                style={{
                    width: '100%',
                    fontSize: 11,
                    padding: '5px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    color: '#0A1E3F',
                }}
            >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
            </select>
        </div>
    );
}

function StatBadge({ label, value, color }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: '#F8F9FA',
                borderRadius: 999,
                fontSize: 11,
            }}
        >
            <span
                style={{
                    width: 8,
                    height: 8,
                    background: color,
                    borderRadius: '50%',
                }}
            />
            <span style={{ color: '#6C757D' }}>{label}</span>
            <strong style={{ color: '#0A1E3F' }}>{value}</strong>
        </div>
    );
}

export default RoomsGrid;