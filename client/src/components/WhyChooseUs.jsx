import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

function WhyChooseUs() {
    const [wcu, setWcu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`${API}/api/settings`)
            .then(({ data }) => {
                if (data.success && data.settings.whyChooseUs) {
                    setWcu(data.settings.whyChooseUs);
                }
            })
            .catch((err) => console.error('WhyChooseUs load failed:', err))
            .finally(() => setLoading(false));
    }, []);

    // Loading state — simple placeholder
    if (loading || !wcu) {
        return (
            <section className="section" style={{ background: 'white', padding: '80px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        ⏳ Loading...
                    </div>
                </div>
            </section>
        );
    }

    const points = wcu.features || [];

    return (
        <section className="section" style={{ background: 'white', padding: '80px 0' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 60,
                    alignItems: 'center'
                }}>
                    <div style={{
                        aspectRatio: 1,
                        background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                        borderRadius: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 30px 60px rgba(10,30,63,0.3)'
                    }}>
                        {/* 👇 Ram Mandir Image */}
                        <img
                            src="/images/ram-mandir.png"
                            alt="Ram Mandir"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'relative',
                                zIndex: 2
                            }}
                        />
                    </div>

                    <div>
                        <span className="section-label">✨ {wcu.badge}</span>
                        <h2 className="section-title" style={{ textAlign: 'left' }}>
                            {wcu.title}
                        </h2>
                        <p style={{ marginBottom: 30 }}>
                            {wcu.subtitle}
                        </p>

                        <div style={{ display: 'grid', gap: 20 }}>
                            {points.map((p, i) => (
                                <div key={i} style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                                    <div style={{
                                        fontSize: 24,
                                        background: '#FFF8E1',
                                        padding: 10,
                                        borderRadius: 12,
                                        minWidth: 48,
                                        textAlign: 'center'
                                    }}>{p.icon}</div>
                                    <div>
                                        <div style={{
                                            fontWeight: 700,
                                            color: 'var(--navy)',
                                            fontSize: 15,
                                            marginBottom: 2
                                        }}>{p.title}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                            {p.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhyChooseUs;