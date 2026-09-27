 
import { useState } from 'react';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import CancelRequests from '../components/admin/CancelRequests';

function AdminCancelRequests() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    <div style={{ marginBottom: 25 }}>
                        <h1 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 28,
                            color: '#0A1E3F',
                            margin: 0,
                            marginBottom: 6
                        }}>⚠️ Cancel Requests</h1>
                        <p style={{ color: '#6C757D', fontSize: 14, margin: 0 }}>
                            Manage all pending cancellation requests
                        </p>
                    </div>
                    <CancelRequests />
                </main>
            </div>
        </div>
    );
}

export default AdminCancelRequests;