 
function Features() {
    const features = [
        { icon: '🏨', title: 'Luxury Rooms', desc: 'Modern & elegant interiors' },
        { icon: '🛡️', title: 'Best Price Guarantee', desc: 'Book with confidence' },
        { icon: '📞', title: '24/7 Customer Support', desc: "We're always here for you" }
    ];

    return (
        <section style={{ background: 'var(--navy)', padding: '30px 20px', color: 'white' }}>
            <div style={{
                maxWidth: '1320px', margin: '0 auto',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 30
            }}>
                {features.map((f, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 15,
                        padding: '10px 20px',
                        borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                        <div style={{ fontSize: 28, color: 'var(--gold)', flexShrink: 0 }}>{f.icon}</div>
                        <div>
                            <h4 style={{
                                color: 'white', fontFamily: 'Poppins, sans-serif',
                                fontSize: 14, fontWeight: 600, marginBottom: 2
                            }}>{f.title}</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Features;