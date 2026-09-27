function StatsGrid({ summary, analytics }) {
    if (!summary) {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 18,
                marginBottom: 25
            }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 22,
                        height: 140,
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton 1.5s infinite'
                    }} />
                ))}
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Bookings',
            value: summary.totalBookings || 0,
            icon: '📋',
            color: '#3498DB',
            bg: '#EBF5FB',
            sub: `${summary.confirmed || 0} confirmed`
        },
        {
            label: 'Total Revenue',
            value: '₹' + (summary.totalRevenue || 0).toLocaleString('en-IN'),
            icon: '💰',
            color: '#27AE60',
            bg: '#E8F8F0',
            sub: 'All time earnings'
        },
        {
            label: 'Total Users',
            value: summary.totalUsers || 0,
            icon: '👥',
            color: '#8B5CF6',
            bg: '#F3E8FF',
            sub: 'Registered users'
        },
        {
            label: 'Occupancy Rate',
            value: (summary.occupancyRate || 0) + '%',
            icon: '🏨',
            color: '#F39C12',
            bg: '#FEF5E7',
            sub: `${summary.occupiedRooms || 0}/${summary.totalRooms || 0} rooms`
        }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginBottom: 25
        }}>
            {stats.map((s, i) => (
                <div
                    key={i}
                    style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 22,
                        borderLeft: `5px solid ${s.color}`,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                    }}
                >
                    {/* Background Icon */}
                    <div style={{
                        position: 'absolute',
                        right: -10,
                        top: -10,
                        fontSize: 90,
                        opacity: 0.05
                    }}>{s.icon}</div>

                    <div style={{
                        width: 48,
                        height: 48,
                        background: s.bg,
                        color: s.color,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        marginBottom: 14
                    }}>{s.icon}</div>

                    <div style={{
                        fontSize: 11,
                        color: '#6C757D',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        marginBottom: 6
                    }}>{s.label}</div>

                    <div style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: '#0A1E3F',
                        fontFamily: 'Playfair Display, serif',
                        lineHeight: 1
                    }}>{s.value}</div>

                    <div style={{
                        fontSize: 11,
                        color: '#9CA3AF',
                        marginTop: 8
                    }}>{s.sub}</div>
                </div>
            ))}
        </div>
    );
}

export default StatsGrid;