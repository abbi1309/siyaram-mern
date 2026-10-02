// ============================================
// NOTIFICATION BELL COMPONENT
// Admin header me bell icon — unread count + dropdown
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // ============================================
    // LOAD NOTIFICATIONS
    // Har 30 second me refresh hoga
    // ============================================
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            // Silent fail — admin panel pe error na dikhe
        }
    };

    // ============================================
    // MARK ALL AS READ
    // ============================================
    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API}/api/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 22,
                    padding: 8,
                }}
                aria-label="Notifications"
            >
                🔔
                {/* Red Badge with Unread Count */}
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            background: '#DC2626',
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: '50%',
                            minWidth: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 4px',
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop — click karne pe close */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999,
                        }}
                    />

                    {/* Panel */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: 360,
                            maxHeight: 480,
                            overflowY: 'auto',
                            background: 'white',
                            borderRadius: 12,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            marginTop: 8,
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <strong style={{ color: '#0A1E3F', fontSize: 14 }}>
                                Notifications
                            </strong>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#D4AF37',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        {notifications.length === 0 ? (
                            <div
                                style={{
                                    padding: 40,
                                    textAlign: 'center',
                                    color: '#9CA3AF',
                                    fontSize: 13,
                                }}
                            >
                                No notifications
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <a
                                    key={n._id}
                                    href={n.link || '#'}
                                    style={{
                                        display: 'block',
                                        padding: '14px 20px',
                                        borderBottom: '1px solid #f3f4f6',
                                        textDecoration: 'none',
                                        background: n.isRead
                                            ? 'white'
                                            : '#FEF9E7',
                                        borderLeft: n.isRead
                                            ? 'none'
                                            : '3px solid #D4AF37',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            color: '#0A1E3F',
                                            fontSize: 13,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {n.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#6C757D',
                                            marginBottom: 4,
                                        }}
                                    >
                                        {n.message}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: '#9CA3AF',
                                        }}
                                    >
                                        {new Date(n.createdAt).toLocaleString(
                                            'en-IN'
                                        )}
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationBell;