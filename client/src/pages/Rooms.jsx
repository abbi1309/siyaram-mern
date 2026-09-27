import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RoomCard from '../components/RoomCard';
import RoomDetailsModal from '../components/RoomDetailsModal';
import { getAllRooms } from '../api/rooms';

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomType, setRoomType] = useState('all');
    const [priceRange, setPriceRange] = useState(5000);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await getAllRooms();
            if (data.success) setRooms(data.rooms);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter((r) => {
        const matchType = roomType === 'all' || r.roomType === roomType;
        const matchPrice = r.pricePerNight <= priceRange;
        return matchType && matchPrice;
    });

    return (
        <>
            <Navbar />
            <div
                className="container"
                style={{ padding: '60px 24px', minHeight: '60vh' }}
            >
                <div className="section-header">
                    <span className="section-label">Browse Rooms</span>
                    <h1 className="section-title">Find Your Perfect Room</h1>
                    <p className="section-description">
                        Search from our wide range of rooms and suites
                    </p>
                </div>

                {/* 👇 className add kiya yahan */}
                <div className="rooms-page-wrapper">
                    <aside className="rooms-filters">
                        <h3
                            style={{
                                marginBottom: 20,
                                color: 'var(--navy)',
                            }}
                        >
                            Filters
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Room Type</label>
                            <select
                                className="form-control"
                                value={roomType}
                                onChange={(e) => setRoomType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="Deluxe Room">
                                    Deluxe Room
                                </option>
                                <option value="Executive Suite">
                                    Executive Suite
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Max Price: ₹{priceRange}
                            </label>
                            <input
                                type="range"
                                min="500"
                                max="5000"
                                step="100"
                                value={priceRange}
                                onChange={(e) =>
                                    setPriceRange(Number(e.target.value))
                                }
                                style={{ width: '100%' }}
                            />
                        </div>
                    </aside>

                    <main className="rooms-main">
                        <p
                            style={{
                                marginBottom: 20,
                                color: 'var(--text-muted)',
                            }}
                        >
                            {filteredRooms.length} rooms found
                        </p>
                        {loading ? (
                            <div className="loader"></div>
                        ) : filteredRooms.length === 0 ? (
                            <p
                                style={{
                                    textAlign: 'center',
                                    padding: 40,
                                }}
                            >
                                No rooms match your filters
                            </p>
                        ) : (
                            <div className="rooms-grid-page">
                                {filteredRooms.map((r) => (
                                    <RoomCard
                                        key={r._id}
                                        room={r}
                                        onDetails={setSelectedRoom}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
            {selectedRoom && (
                <RoomDetailsModal
                    room={selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                />
            )}
        </>
    );
}

export default Rooms;