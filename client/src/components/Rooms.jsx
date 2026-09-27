import RoomCard from './RoomCard';

function Rooms({ rooms, loading, onDetails }) {
    return (
        <section className="section" id="rooms" style={{ padding: '80px 0' }}>
            <div className="container">
                <div className="section-header">
                    <span className="section-label">Rooms</span>
                    <h2 className="section-title">Featured Rooms</h2>
                    <p className="section-description">
                        Discover our most popular room types, designed for your
                        comfort and luxury
                    </p>
                </div>

                {loading ? (
                    <div className="rooms-grid">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                style={{
                                    height: 400,
                                    borderRadius: 16,
                                    background:
                                        'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'skeleton 1.5s infinite',
                                }}
                            ></div>
                        ))}
                    </div>
                ) : rooms.length === 0 ? (
                    <p
                        style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                        }}
                    >
                        No rooms available at the moment
                    </p>
                ) : (
                    <div className="rooms-grid">
                        {rooms.map((room) => (
                            <RoomCard
                                key={room._id}
                                room={room}
                                onDetails={onDetails}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Rooms;