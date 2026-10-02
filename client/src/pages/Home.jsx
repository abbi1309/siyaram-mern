import { useState, useEffect } from 'react';
import CounterAnimation from '../components/CounterAnimation';
import { useScrollReveal } from '../hooks/useScrollReveal';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Rooms from '../components/Rooms';
import WhyChooseUs from '../components/WhyChooseUs';
import Reviews from '../components/Reviews';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
// import Chatbot from '../components/Chatbot';
import WhatsAppButton from '../components/WhatsAppButton';
import RoomDetailsModal from '../components/RoomDetailsModal';
import Lightbox from '../components/Lightbox';
import { getAllRooms } from '../api/rooms';

function Home() {
    useScrollReveal();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [lightboxData, setLightboxData] = useState(null);

    useEffect(() => { loadRooms(); }, []);

    const loadRooms = async () => {
        try {
            const data = await getAllRooms();
            if (data.success) setRooms(data.rooms);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <Rooms rooms={rooms} loading={loading} onDetails={setSelectedRoom} />

            {/* STATISTICS SECTION */}
            <section className="section" style={{ background: 'white', padding: '80px 20px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{
                        marginBottom: 15,
                        color: 'var(--navy)',
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 36
                    }}>
                        Hamare Statistics
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 50, fontSize: 15 }}>
                        Numbers jo humein special banate hain
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 30
                    }}>
                        <div className="reveal">
                            <div style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: 'var(--gold)',
                                fontFamily: 'Playfair Display, serif',
                                lineHeight: 1
                            }}>
                                <CounterAnimation end={12} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>
                                Luxury Rooms
                            </div>
                        </div>

                        <div className="reveal reveal-delay-1">
                            <div style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: 'var(--gold)',
                                fontFamily: 'Playfair Display, serif',
                                lineHeight: 1
                            }}>
                                <CounterAnimation end={500} suffix="+" />
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>
                                Happy Guests
                            </div>
                        </div>

                        <div className="reveal reveal-delay-2">
                            <div style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: 'var(--gold)',
                                fontFamily: 'Playfair Display, serif',
                                lineHeight: 1
                            }}>
                                <CounterAnimation end={4.8} decimals={1} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>
                                Guest Rating
                            </div>
                        </div>

                        <div className="reveal reveal-delay-3">
                            <div style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: 'var(--gold)',
                                fontFamily: 'Playfair Display, serif',
                                lineHeight: 1
                            }}>
                                <CounterAnimation end={24} suffix="/7" />
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>
                                Support
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <WhyChooseUs />
            <Reviews />
            {/* <Gallery onOpenLightbox={(src, caption) => setLightboxData({ src, caption })} /> */}
            <CTABanner />
            <Footer />
            <WhatsAppButton />

            {selectedRoom && (
                <RoomDetailsModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
            )}
            {lightboxData && (
                <Lightbox src={lightboxData.src} caption={lightboxData.caption} onClose={() => setLightboxData(null)} />
            )}
        </>
    );
}

export default Home;