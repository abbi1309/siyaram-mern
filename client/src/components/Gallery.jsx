 
function Gallery({ onOpenLightbox }) {
    const images = [
        { src: '/images/rammandir.jpg', caption: 'Ram Mandir View' },
        { src: '/images/gallery1.jpeg', caption: 'Hotel Front' },
        { src: '/images/gallery2.jpeg', caption: 'Deluxe Room' },
        { src: '/images/gallery3.jpeg', caption: 'Reception Lobby' }
    ];

    return (
        <section className="section" id="gallery" style={{ background: 'white' }}>
            <div className="container">
                <div className="section-header">
                    <span className="section-label">Photo Gallery</span>
                    <h2 className="section-title">A Glimpse of Siyaram Palace</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                    {images.map((img, i) => (
                        <div
                            key={i}
                            onClick={() => onOpenLightbox(img.src, img.caption)}
                            style={{
                                position: 'relative',
                                aspectRatio: '4/3',
                                borderRadius: 16,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                            }}
                        >
                            <img
                                src={img.src}
                                alt={img.caption}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            />
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)',
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'flex-end', alignItems: 'center',
                                padding: 20, opacity: 0, transition: '0.3s', color: 'white'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                            >
                                <div style={{ fontSize: 30, marginBottom: 8 }}>🔍</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{img.caption}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Gallery;