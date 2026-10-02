import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Amenities() {
    const amenities = [
        { icon: '❄️', title: 'Air Conditioning', desc: '24/7 climate control in all rooms' },
        { icon: '📶', title: 'Free WiFi', desc: 'High-speed internet throughout' },
        { icon: '🚿', title: 'Attached Bathroom', desc: 'Modern fixtures with hot water' },
        { icon: '📺', title: 'LED TV', desc: 'Cable connection with 100+ channels' },
        { icon: '🛎️', title: 'Room Service', desc: '24/7 in-room dining' },
        // { icon: '🍳', title: 'Breakfast', desc: 'Complimentary breakfast (Suites)' },
        { icon: '🚗', title: 'Free Parking', desc: 'Secured parking for 50+ cars' },
        { icon: '🧹', title: 'Daily Housekeeping', desc: 'Clean rooms every day' },
        { icon: '🔌', title: 'Power Backup', desc: '24/7 electricity backup' },
        { icon: '☕', title: 'Tea/Coffee Maker', desc: 'In-room beverage station' },
        { icon: '🛕', title: 'Ram Mandir Shuttle', desc: 'Free shuttle to Ram Mandir' },
        { icon: '🎯', title: '24/7 Security', desc: 'CCTV surveillance & guards' }
    ];

    return (
        <>
            <Navbar />
            <div style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, #1a1a2e 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h1 style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontSize: 48, marginBottom: 15 }}>
                    Our Amenities
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
                    World-class facilities for a memorable stay experience
                </p>
            </div>

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 24
                }}>
                    {amenities.map((a, i) => (
                        <div key={i} style={{
                            background: 'white',
                            padding: 28,
                            borderRadius: 16,
                            textAlign: 'center',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 20px rgba(10,30,63,0.06)',
                            transition: 'all 0.3s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(212,175,55,0.15)';
                            e.currentTarget.style.borderColor = 'var(--gold)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,30,63,0.06)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }}>
                            <div style={{
                                fontSize: 48,
                                marginBottom: 15,
                                display: 'inline-block',
                                width: 80,
                                height: 80,
                                lineHeight: '80px',
                                background: 'linear-gradient(135deg, #FFF8E1, #FFE5B4)',
                                borderRadius: '50%'
                            }}>{a.icon}</div>
                            <h3 style={{
                                fontFamily: 'Playfair Display, serif',
                                color: 'var(--navy)',
                                fontSize: 18,
                                marginBottom: 8
                            }}>{a.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>{a.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Amenities;