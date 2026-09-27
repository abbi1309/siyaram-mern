import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = import.meta.env.VITE_API_URL || '';

export default function GalleryPage() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Hotel', 'Rooms', 'Restaurant', 'Exterior', 'Other'];

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const { data } = await axios.get(`${API}/api/gallery`);
            if (data.success) setImages(data.images);
        } catch (err) {
            console.error('Gallery load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered =
        filter === 'All'
            ? images
            : images.filter((img) => img.category === filter);

    return (
        <>
            <Navbar />

            {/* Hero */}
            <div
                style={{
                    background:
                        'linear-gradient(135deg, #0A1E3F 0%, #1A3A6B 100%)',
                    color: '#fff',
                    padding: '80px 24px',
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 52,
                        marginBottom: 12,
                    }}
                >
                    Photo Gallery
                </h1>
                <p style={{ opacity: 0.85, fontSize: 16 }}>
                    A visual journey through Siyaram Palace
                </p>
            </div>

            <div className="container" style={{ padding: '40px 24px' }}>
                {/* Category Filter */}
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginBottom: 40,
                    }}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: 999,
                                border:
                                    filter === cat
                                        ? '2px solid var(--gold)'
                                        : '2px solid #E5E7EB',
                                background:
                                    filter === cat ? 'var(--gold)' : '#fff',
                                color:
                                    filter === cat
                                        ? '#0A1E3F'
                                        : 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 80,
                            color: 'var(--text-muted)',
                        }}
                    >
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                        <p>No images yet. Admin will upload soon!</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && filtered.length > 0 && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 20,
                        }}
                    >
                        {filtered.map((img, i) => (
                            <div
                                key={img._id}
                                onClick={() => setSelected(img)}
                                style={{
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(10,30,63,0.08)',
                                    transition:
                                        'transform 0.3s, box-shadow 0.3s',
                                    background: '#fff',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                        'translateY(-6px)';
                                    e.currentTarget.style.boxShadow =
                                        '0 16px 40px rgba(10,30,63,0.18)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        'translateY(0)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 20px rgba(10,30,63,0.08)';
                                }}
                            >
                                <img
                                    src={`${API}${img.imageUrl}`}
                                    alt={img.title || 'Gallery'}
                                    style={{
                                        width: '100%',
                                        height: 240,
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                                {img.title && (
                                    <div
                                        style={{
                                            padding: '12px 16px',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: 'var(--navy)',
                                        }}
                                    >
                                        {img.title}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selected && (
                <div
                    onClick={() => setSelected(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.92)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: 20,
                        cursor: 'zoom-out',
                    }}
                >
                    <img
                        src={`${API}${selected.imageUrl}`}
                        alt={selected.title}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            borderRadius: 12,
                            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                        }}
                    />
                </div>
            )}

            <Footer />
        </>
    );
}