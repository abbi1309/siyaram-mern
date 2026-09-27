import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function RevenueChart({ data }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        // Destroy existing chart
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const labels = data.length > 0
            ? data.map(d => {
                const date = new Date(d._id);
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            })
            : ['No data'];

        const values = data.length > 0
            ? data.map(d => d.revenue)
            : [0];

        const ctx = canvasRef.current.getContext('2d');
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.3)');
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0.01)');

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: values,
                    borderColor: '#D4AF37',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#0A1E3F',
                    pointBorderColor: '#D4AF37',
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0A1E3F',
                        padding: 12,
                        titleColor: '#D4AF37',
                        bodyColor: 'white',
                        borderColor: '#D4AF37',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => '₹' + ctx.parsed.y.toLocaleString('en-IN')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#F0F2F5' },
                        ticks: {
                            callback: v => '₹' + v.toLocaleString('en-IN'),
                            color: '#6C757D',
                            font: { size: 11 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#6C757D', font: { size: 11 } }
                    }
                }
            }
        });

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [data]);

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
                alignItems: 'center',
                marginBottom: 20
            }}>
                <div>
                    <h3 style={{
                        color: '#0A1E3F',
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 18,
                        margin: 0,
                        marginBottom: 4
                    }}>📈 Revenue Trend</h3>
                    <div style={{
                        fontSize: 12,
                        color: '#9CA3AF'
                    }}>Last 30 days earnings</div>
                </div>
                <div style={{
                    padding: '6px 12px',
                    background: '#E8F8F0',
                    color: '#27AE60',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700
                }}>+12.5% ↗</div>
            </div>
            <div style={{ height: 280, position: 'relative' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}

export default RevenueChart;