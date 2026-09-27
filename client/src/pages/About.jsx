import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
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
                    About Siyaram Palace
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 700, margin: '0 auto', fontSize: 16 }}>
                    Where royal heritage meets modern luxury
                </p>
            </div>

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 40,
                    alignItems: 'center'
                }}>
                    <div style={{
                        aspectRatio: '4/3',
                        borderRadius: 20,
                        background: `url('/images/hotel-bg.jpg') center/cover`,
                        boxShadow: '0 20px 50px rgba(10,30,63,0.15)'
                    }} />
                    <div>
                        <span style={{
                            fontSize: 12,
                            color: 'var(--gold-dark)',
                            fontWeight: 700,
                            letterSpacing: '3px',
                            textTransform: 'uppercase'
                        }}>About Us</span>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            color: 'var(--navy)',
                            fontSize: 36,
                            marginTop: 15,
                            marginBottom: 20
                        }}>
                            A Royal Experience in Ayodhya
                        </h2>
                        <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-body)', marginBottom: 15 }}>
                            Siyaram Palace is a premier hotel located in the heart of Ayodhya,
                            just 500 meters from Ram Mandir. We offer a perfect blend of
                            traditional Indian hospitality and modern comfort.
                        </p>
                        <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-body)', marginBottom: 25 }}>
                            Whether you're here for darshan at Ram Mandir, exploring the city's
                            rich history, or simply seeking a peaceful retreat, our 12 beautifully
                            designed rooms ensure a memorable stay.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <StatCard number="12" label="Luxury Rooms" />
                            <StatCard number="500+" label="Happy Guests" />
                            <StatCard number="4.8★" label="Guest Rating" />
                            <StatCard number="500m" label="From Ram Mandir" />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

function StatCard({ number, label }) {
    return (
        <div style={{
            background: '#FFF8E1',
            padding: 20,
            borderRadius: 12,
            borderLeft: '4px solid var(--gold)'
        }}>
            <div style={{
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--navy)',
                fontFamily: 'Playfair Display, serif'
            }}>{number}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
        </div>
    );
}

export default About;