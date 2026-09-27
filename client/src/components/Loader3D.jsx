function Loader3D() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD59E 50%, #FFC773 100%)',
            perspective: '1000px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background Decorative Circles */}
            <div style={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212,175,55,0.2), transparent 70%)',
                top: '10%',
                left: '10%',
                animation: 'floatSlow 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,153,51,0.15), transparent 70%)',
                bottom: '10%',
                right: '10%',
                animation: 'floatSlow 10s ease-in-out infinite reverse'
            }} />

            {/* Main 3D Card */}
            <div style={{
                background: 'linear-gradient(135deg, #0A1E3F, #1A2F52, #0A1E3F)',
                borderRadius: 30,
                padding: '60px 80px',
                boxShadow: `
                    0 30px 80px rgba(10,30,63,0.4),
                    0 0 0 1px rgba(212,175,55,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.1)
                `,
                transform: 'rotateX(5deg) rotateY(-5deg)',
                animation: 'cardFloat3D 4s ease-in-out infinite',
                transformStyle: 'preserve-3d',
                position: 'relative'
            }}>
                {/* Temple Icon - 3D Rotating */}
                <div style={{
                    transform: 'translateZ(30px)',
                    animation: 'templeFloat 3s ease-in-out infinite',
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'
                }}>
                    {/* Temple SVG with 3D effect */}
                    <svg width="150" height="150" viewBox="0 0 150 150">
                        {/* Base platforms */}
                        <rect x="25" y="120" width="100" height="8" rx="2" fill="#8B5A2B" />
                        <rect x="30" y="112" width="90" height="8" rx="2" fill="#A0703A" />
                        <rect x="35" y="104" width="80" height="8" rx="2" fill="#8B5A2B" />
                        <rect x="40" y="96" width="70" height="8" rx="2" fill="#A0703A" />
                        
                        {/* Main dome/temple body */}
                        <path d="M 45 96 Q 45 60 75 45 Q 105 60 105 96 Z" 
                              fill="url(#templeGradient)" 
                              stroke="#D4AF37" 
                              strokeWidth="1.5" />
                        
                        {/* Door */}
                        <rect x="65" y="75" width="20" height="21" rx="2" fill="#4A2810" />
                        <rect x="67" y="77" width="16" height="17" rx="1" fill="#2A1508" />
                        
                        {/* Golden stripes */}
                        <path d="M 55 75 L 95 75" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 60 68 L 90 68" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 65 61 L 85 61" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                        
                        {/* Kalash (top spire) */}
                        <circle cx="75" cy="38" r="5" fill="#D4AF37" />
                        <polygon points="75,20 70,35 80,35" fill="#FFD700" />
                        <circle cx="75" cy="18" r="2.5" fill="#FFD700" />
                        <rect x="72" y="35" width="6" height="4" fill="#B8941F" />
                        
                        {/* Gradients */}
                        <defs>
                            <linearGradient id="templeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFA726" />
                                <stop offset="50%" stopColor="#FF9800" />
                                <stop offset="100%" stopColor="#E65100" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Loading Text with 3D */}
                <div style={{
                    marginTop: 30,
                    textAlign: 'center',
                    transform: 'translateZ(20px)'
                }}>
                    <div style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 28,
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #D4AF37, #FFD700, #D4AF37)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'gradientShift 3s ease infinite',
                        letterSpacing: '2px'
                    }}>
                        SIYARAM PALACE
                    </div>
                    <div style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 11,
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        marginTop: 8
                    }}>
                        Hotel & Restaurant
                    </div>
                </div>

                {/* Loading Dots */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 10,
                    marginTop: 30,
                    transform: 'translateZ(15px)'
                }}>
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
                                boxShadow: '0 0 20px rgba(212,175,55,0.8)',
                                animation: `bounceDot 1.4s ease-in-out ${i * 0.2}s infinite`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Inline Styles */}
            <style>{`
                @keyframes cardFloat3D {
                    0%, 100% {
                        transform: rotateX(5deg) rotateY(-5deg) translateY(0);
                    }
                    50% {
                        transform: rotateX(5deg) rotateY(-5deg) translateY(-15px);
                    }
                }

                @keyframes templeFloat {
                    0%, 100% {
                        transform: translateZ(30px) translateY(0) scale(1);
                    }
                    50% {
                        transform: translateZ(30px) translateY(-8px) scale(1.03);
                    }
                }

                @keyframes floatSlow {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, -30px) scale(1.1); }
                }

                @keyframes bounceDot {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: translateY(-15px) scale(1.2);
                        opacity: 0.6;
                    }
                }

                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>
        </div>
    );
}

export default Loader3D;