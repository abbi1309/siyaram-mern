import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function StatusChart({ data }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Destroy existing chart
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // ⭐ Handle empty/missing data gracefully
        const validData = Array.isArray(data) && data.length > 0
            ? data.filter(d => d && d._id && d.count > 0)
            : [];

        const hasData = validData.length > 0;

        // ⭐ If no data, show a message but keep structure
        const labels = hasData
            ? validData.map(d => d._id)
            : ['No Data'];

        const values = hasData
            ? validData.map(d => d.count)
            : [0];

        const statusColors = {
            'Confirmed': '#27AE60',
            'Pending': '#F39C12',
            'Cancelled': '#DC2626',
            'Checked-In': '#3498DB',
            'Completed': '#8B5CF6'
        };

        const backgroundColors = hasData
            ? validData.map(d => statusColors[d._id] || '#95A5A6')
            : ['#E5E7EB'];

        const ctx = canvasRef.current.getContext('2d');

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Bookings',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderRadius: 8,
                    borderSkipped: false,
                    barThickness: 50,
                    maxBarThickness: 60
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: hasData,
                        backgroundColor: '#0A1E3F',
                        padding: 12,
                        titleColor: '#D4AF37',
                        bodyColor: 'white',
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} booking${ctx.parsed.y > 1 ? 's' : ''}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#F0F2F5' },
                        ticks: {
                            stepSize: 1,
                            precision: 0,
                            color: '#6C757D',
                            font: { size: 11 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#6C757D',
                            font: { size: 11, weight: 600 }
                        }
                    }
                },
                // ⭐ Show "No data" text if empty
                animation: hasData ? { duration: 800 } : false
            },
            plugins: hasData ? [] : [{
                id: 'noDataPlugin',
                afterDraw: (chart) => {
                    const { ctx, chartArea } = chart;
                    ctx.save();
                    ctx.font = 'bold 16px Poppins, sans-serif';
                    ctx.fillStyle = '#9CA3AF';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const centerX = (chartArea.left + chartArea.right) / 2;
                    const centerY = (chartArea.top + chartArea.bottom) / 2;
                    ctx.fillText('📊 No bookings yet', centerX, centerY);
                    ctx.font = '12px Poppins, sans-serif';
                    ctx.fillStyle = '#CBD5E1';
                    ctx.fillText('Bookings will appear here', centerX, centerY + 25);
                    ctx.restore();
                }
            }]
        });

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [data]);

    // ⭐ Show count total
    const totalCount = Array.isArray(data)
        ? data.reduce((sum, d) => sum + (d?.count || 0), 0)
        : 0;

    return (
        <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20
            }}>
                <div>
                    <h3 style={{
                        color: '#0A1E3F',
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 18,
                        margin: 0,
                        marginBottom: 4
                    }}>📊 Booking Status</h3>
                    <div style={{
                        fontSize: 12,
                        color: '#9CA3AF'
                    }}>Current status breakdown</div>
                </div>
                <div style={{
                    padding: '6px 14px',
                    background: totalCount > 0 ? '#E8F8F0' : '#F0F2F5',
                    color: totalCount > 0 ? '#27AE60' : '#9CA3AF',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700
                }}>
                    {totalCount} total
                </div>
            </div>
            <div style={{ height: 280, position: 'relative' }}>
                <canvas ref={canvasRef} />
            </div>

            {/* Legend */}
            {totalCount > 0 && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid #F0F2F5',
                    justifyContent: 'center'
                }}>
                    {[
                        { label: 'Pending', color: '#F39C12' },
                        { label: 'Confirmed', color: '#27AE60' },
                        { label: 'Checked-In', color: '#3498DB' },
                        { label: 'Completed', color: '#8B5CF6' },
                        { label: 'Cancelled', color: '#DC2626' }
                    ].map(s => (
                        <div key={s.label} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11,
                            color: '#6C757D'
                        }}>
                            <span style={{
                                width: 10,
                                height: 10,
                                background: s.color,
                                borderRadius: 2
                            }} />
                            {s.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StatusChart;