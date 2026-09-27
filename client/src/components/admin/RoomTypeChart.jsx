import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function RoomTypeChart({ data }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        if (chartRef.current) chartRef.current.destroy();

        const labels = data.length > 0 ? data.map(d => d._id) : ['No data'];
        const values = data.length > 0 ? data.map(d => d.count) : [1];

        const colors = ['#D4AF37', '#27AE60', '#3498DB', '#8B5CF6', '#F39C12'];

        chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 4,
                    borderColor: 'white',
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            font: { size: 12, family: 'Poppins' },
                            color: '#0A1E3F',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0A1E3F',
                        padding: 12,
                        titleColor: '#D4AF37',
                        bodyColor: 'white',
                        borderColor: '#D4AF37',
                        borderWidth: 1,
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.parsed} bookings`
                        }
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
            <h3 style={{
                color: '#0A1E3F',
                fontFamily: 'Playfair Display, serif',
                fontSize: 18,
                marginTop: 0,
                marginBottom: 4
            }}>🏨 Bookings by Room</h3>
            <div style={{
                fontSize: 12,
                color: '#9CA3AF',
                marginBottom: 20
            }}>Room type distribution</div>
            <div style={{ height: 280, position: 'relative' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}

export default RoomTypeChart;