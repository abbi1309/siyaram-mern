import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

function AdminMessages() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all'); // all | unread

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API}/api/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) setMessages(data.messages);
        } catch (err) {
            console.error(err);
            toast.error('Messages load failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = async (msg) => {
        setSelected(msg);

        // Auto mark as read
        if (!msg.isRead) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(
                    `${API}/api/messages/${msg._id}/read`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Local update
                setMessages((prev) =>
                    prev.map((m) =>
                        m._id === msg._id ? { ...m, isRead: true, status: 'read' } : m
                    )
                );
            } catch (err) {
                console.error('Mark as read failed:', err);
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/api/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Message deleted');
            setMessages((prev) => prev.filter((m) => m._id !== id));
            if (selected?._id === id) setSelected(null);
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const filtered =
        filter === 'unread' ? messages.filter((m) => !m.isRead) : messages;

    const unreadCount = messages.filter((m) => !m.isRead).length;

    const formatDate = (d) =>
        new Date(d).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
                        }}>
                            📬 Contact Messages
                            {unreadCount > 0 && (
                                <span style={{
                                    marginLeft: 12,
                                    padding: '4px 12px',
                                    background: '#DC2626',
                                    color: 'white',
                                    borderRadius: 999,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    verticalAlign: 'middle'
                                }}>
                                    {unreadCount} new
                                </span>
                            )}
                        </h1>
                        <p style={{ color: '#6C757D', fontSize: 14, margin: 0 }}>
                            Website visitors ke messages
                        </p>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                padding: '8px 18px',
                                borderRadius: 10,
                                border: 'none',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                background: filter === 'all' ? '#0A1E3F' : 'white',
                                color: filter === 'all' ? 'white' : '#0A1E3F',
                            }}
                        >
                            All ({messages.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            style={{
                                padding: '8px 18px',
                                borderRadius: 10,
                                border: 'none',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                background: filter === 'unread' ? '#0A1E3F' : 'white',
                                color: filter === 'unread' ? 'white' : '#0A1E3F',
                            }}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {/* Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1.5fr',
                        gap: 20,
                        alignItems: 'start'
                    }}>

                        {/* Messages List */}
                        <div style={{
                            background: 'white',
                            borderRadius: 14,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                            maxHeight: 'calc(100vh - 280px)',
                            overflowY: 'auto'
                        }}>
                            {loading ? (
                                <div style={{ padding: 40, textAlign: 'center', color: '#6C757D' }}>
                                    ⏳ Loading...
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: 40, textAlign: 'center', color: '#6C757D' }}>
                                    📭 {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
                                </div>
                            ) : (
                                filtered.map((m) => (
                                    <div
                                        key={m._id}
                                        onClick={() => handleOpen(m)}
                                        style={{
                                            padding: 16,
                                            borderBottom: '1px solid #F0F2F5',
                                            cursor: 'pointer',
                                            background: selected?._id === m._id ? '#F8F9FA' : 'white',
                                            borderLeft: !m.isRead ? '4px solid #D4AF37' : '4px solid transparent',
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 4,
                                        }}>
                                            <div style={{
                                                fontWeight: !m.isRead ? 700 : 600,
                                                color: '#0A1E3F',
                                                fontSize: 14,
                                            }}>
                                                {m.name}
                                            </div>
                                            {!m.isRead && (
                                                <div style={{
                                                    width: 8,
                                                    height: 8,
                                                    background: '#DC2626',
                                                    borderRadius: '50%',
                                                    marginTop: 6,
                                                }} />
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: 12,
                                            color: '#6C757D',
                                            marginBottom: 4,
                                        }}>
                                            {m.email}
                                        </div>
                                        <div style={{
                                            fontSize: 12,
                                            color: '#6C757D',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {m.message}
                                        </div>
                                        <div style={{
                                            fontSize: 11,
                                            color: '#9CA3AF',
                                            marginTop: 6,
                                        }}>
                                            {formatDate(m.createdAt)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Detail Panel */}
                        <div style={{
                            background: 'white',
                            borderRadius: 14,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            padding: 30,
                            minHeight: 400,
                        }}>
                            {!selected ? (
                                <div style={{
                                    textAlign: 'center',
                                    color: '#6C757D',
                                    paddingTop: 100,
                                }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                                    <div>Koi message select karo</div>
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 25,
                                    }}>
                                        <div>
                                            <h2 style={{
                                                margin: 0,
                                                color: '#0A1E3F',
                                                fontFamily: 'Playfair Display, serif',
                                                fontSize: 22,
                                                marginBottom: 6,
                                            }}>
                                                {selected.name}
                                            </h2>
                                            <div style={{ fontSize: 13, color: '#6C757D' }}>
                                                {formatDate(selected.createdAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(selected._id)}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#FEE2E2',
                                                color: '#DC2626',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: 12,
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gap: 14, marginBottom: 25 }}>
                                        <InfoRow label="📧 Email" value={selected.email} link={`mailto:${selected.email}`} />
                                        <InfoRow label="📞 Phone" value={selected.phone || '—'} link={selected.phone ? `tel:${selected.phone}` : null} />
                                    </div>

                                    <div style={{
                                        padding: 20,
                                        background: '#F8F9FA',
                                        borderRadius: 10,
                                        borderLeft: '3px solid #D4AF37',
                                        color: '#0A1E3F',
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-wrap',
                                        fontSize: 14,
                                    }}>
                                        {selected.message}
                                    </div>

                                    <a
                                        href={`mailto:${selected.email}?subject=Re: Your message to Siyaram Palace`}
                                        style={{
                                            display: 'inline-block',
                                            marginTop: 24,
                                            padding: '10px 24px',
                                            background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                                            color: '#0A1E3F',
                                            borderRadius: 10,
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            fontSize: 13,
                                        }}
                                    >
                                        ✉️ Reply via Email
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function InfoRow({ label, value, link }) {
    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1E3F', minWidth: 80 }}>
                {label}
            </span>
            {link ? (
                <a href={link} style={{ fontSize: 13, color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
                    {value}
                </a>
            ) : (
                <span style={{ fontSize: 13, color: '#333' }}>{value}</span>
            )}
        </div>
    );
}

export default AdminMessages;