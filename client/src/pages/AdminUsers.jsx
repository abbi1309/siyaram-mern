 
import { useState, useEffect } from 'react';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { getAllUsers } from '../api/admin';
import toast from 'react-hot-toast';

function AdminUsers() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            if (data.success) setUsers(data.users);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load users');
        } finally { setLoading(false); }
    };

    const filtered = users.filter(u => {
        if (!search) return true;
        const s = search.toLowerCase();
        return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
    });

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
                        }}>👥 Users</h1>
                        <p style={{ color: '#6C757D', fontSize: 14, margin: 0 }}>
                            {users.length} registered users
                        </p>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <input
                            type="text"
                            placeholder="🔍 Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #E5E7EB',
                                borderRadius: 10,
                                fontSize: 13,
                                outline: 'none',
                                marginBottom: 20,
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                        />

                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>Loading...</p>
                        ) : filtered.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>No users found</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#F8F9FA' }}>
                                            {['User', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                                                <th key={h} style={{
                                                    padding: 14,
                                                    textAlign: 'left',
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: '#0A1E3F',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid #F0F2F5' }}>
                                                <td style={{ padding: 14 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{
                                                            width: 36, height: 36,
                                                            background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                                                            color: '#0A1E3F',
                                                            borderRadius: '50%',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, fontSize: 14
                                                        }}>{u.name?.charAt(0).toUpperCase() || 'U'}</div>
                                                        <span style={{ fontWeight: 600, color: '#0A1E3F' }}>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: 14, color: '#6C757D' }}>{u.email}</td>
                                                <td style={{ padding: 14, color: '#6C757D' }}>{u.phone || '-'}</td>
                                                <td style={{ padding: 14 }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        background: u.role === 'admin' ? '#FEF3C7' : '#DBEAFE',
                                                        color: u.role === 'admin' ? '#92400E' : '#1E40AF',
                                                        borderRadius: 999,
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase'
                                                    }}>{u.role || 'user'}</span>
                                                </td>
                                                <td style={{ padding: 14, color: '#6C757D' }}>
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminUsers;