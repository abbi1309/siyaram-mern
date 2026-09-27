import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import StatsGrid from './StatsGrid';
import RevenueChart from './RevenueChart';
import RoomTypeChart from './RoomTypeChart';
import StatusChart from './StatusChart';
import CancelRequests from './CancelRequests';
import RoomsGrid from './RoomsGrid';
import BookingsTable from './BookingsTable';
import { getAnalytics } from '../../api/admin';

function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => { loadAnalytics(); }, []);

    const loadAnalytics = async () => {
        try {
            const data = await getAnalytics();
            if (data.success) setAnalytics(data);
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div style={{
                marginLeft: window.innerWidth > 900 ? 260 : 0,
                transition: 'margin 0.3s ease',
                minHeight: '100vh'
            }}>
                <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main style={{ padding: 24 }}>
                    {/* Welcome Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0A1E3F 0%, #1A2F52 100%)',
                        borderRadius: 20,
                        padding: '30px 40px',
                        marginBottom: 25,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            right: -30,
                            top: -30,
                            fontSize: 180,
                            opacity: 0.05
                        }}>♔</div>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h1 style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: 32,
                                margin: 0,
                                marginBottom: 8,
                                color: 'white'
                            }}>Welcome back, Admin! 👋</h1>
                            <p style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: 14,
                                margin: 0
                            }}>Here's what's happening at Siyaram Palace today</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <StatsGrid summary={analytics?.summary} analytics={analytics} />

                    {/* Charts Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: 20,
                        marginBottom: 25
                    }}>
                        <RevenueChart data={analytics?.charts?.revenueTrend || []} />
                        <RoomTypeChart data={analytics?.charts?.bookingsByRoomType || []} />
                    </div>

                    {/* Status Chart */}
                    <div style={{ marginBottom: 25 }}>
                        <StatusChart data={analytics?.charts?.bookingsByStatus || []} />
                    </div>

                    {/* Cancel Requests */}
                    <CancelRequests />

                    {/* Rooms Grid */}
                    <RoomsGrid />

                    {/* Bookings Table */}
                    <BookingsTable />
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;