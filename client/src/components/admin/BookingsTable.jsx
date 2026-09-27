import { useState, useEffect } from 'react';
import {
    getAllBookings,
    updateBookingStatus,
    checkInBooking,
    checkOutBooking
} from '../../api/admin';
import toast from 'react-hot-toast';

function BookingsTable() {
    const [bookings, setBookings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => { loadBookings(); }, []);
    useEffect(() => { applyFilters(); }, [search, statusFilter, bookings]);

    const loadBookings = async () => {
        try {
            const data = await getAllBookings();
            if (data.success) setBookings(data.bookings);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const applyFilters = () => {
        let result = [...bookings];
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(b =>
                b.guestName?.toLowerCase().includes(s) ||
                b.guestPhone?.includes(s) ||
                b.bookingId?.toLowerCase().includes(s)
            );
        }
        if (statusFilter) {
            result = result.filter(b => b.status === statusFilter);
        }
        setFiltered(result);
    };

    // ⭐ MAIN HANDLER — Sab status updates yahan se
    const handleStatusUpdate = async (id, newStatus, actionType) => {
        // Confirm messages
        const confirmMessages = {
            'Checked-In': 'Check-In this guest?',
            'Completed': 'Check-Out this guest? Room will be freed.',
            'Confirmed': 'Confirm this booking?',
            'Cancelled': 'Cancel this booking? Room will be freed.'
        };

        if (!confirm(confirmMessages[newStatus] || `Change status to ${newStatus}?`)) return;

        setActionLoading(id);

        try {
            let response;

            if (actionType === 'checkin') {
                response = await checkInBooking(id);
            } else if (actionType === 'checkout') {
                response = await checkOutBooking(id);
            } else {
                response = await updateBookingStatus(id, newStatus);
            }

            if (response.success) {
                const successMessages = {
                    'Checked-In': '✅ Guest Checked-In',
                    'Completed': '✅ Guest Checked-Out',
                    'Confirmed': '✅ Booking Confirmed',
                    'Cancelled': '✅ Booking Cancelled'
                };
                toast.success(successMessages[newStatus] || '✅ Updated');
                loadBookings();
            } else {
                toast.error(response.message || 'Failed');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error updating status');
        } finally {
            setActionLoading(null);
        }
    };

    const statusClass = (s) => {
        const map = {
            'Confirmed': { bg: '#DCFCE7', color: '#166534' },
            'Pending': { bg: '#FEF3C7', color: '#92400E' },
            'Cancelled': { bg: '#FEE2E2', color: '#991B1B' },
            'Checked-In': { bg: '#DBEAFE', color: '#1E40AF' },
            'Completed': { bg: '#D1FAE5', color: '#065F46' }
        };
        return map[s] || { bg: '#F3F4F6', color: '#6B7280' };
    };

    // ⭐ Dynamic action buttons based on status
    const renderActionButtons = (booking) => {
        const { _id, status } = booking;
        const isLoading = actionLoading === _id;

        if (isLoading) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6C757D', fontSize: 11 }}>
                    <div style={{
                        width: 14, height: 14,
                        border: '2px solid #E5E7EB',
                        borderTop: '2px solid #D4AF37',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    Updating...
                </div>
            );
        }

        // Cancelled or Completed - no actions
        if (status === 'Cancelled' || status === 'Completed') {
            return (
                <span style={{
                    fontSize: 11,
                    color: '#9CA3AF',
                    fontStyle: 'italic'
                }}>
                    No actions
                </span>
            );
        }

        // Pending - Confirm or Cancel
        if (status === 'Pending') {
            return (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <ActionButton
                        label="✓ Confirm"
                        color="#27AE60"
                        onClick={() => handleStatusUpdate(_id, 'Confirmed', 'confirm')}
                    />
                    <ActionButton
                        label="✕ Cancel"
                        color="#DC2626"
                        onClick={() => handleStatusUpdate(_id, 'Cancelled', 'cancel')}
                    />
                </div>
            );
        }

        // Confirmed - Check-In or Cancel
        if (status === 'Confirmed') {
            return (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <ActionButton
                        label="🚪 Check-In"
                        color="#3498DB"
                        onClick={() => handleStatusUpdate(_id, 'Checked-In', 'checkin')}
                    />
                    <ActionButton
                        label="✕ Cancel"
                        color="#DC2626"
                        onClick={() => handleStatusUpdate(_id, 'Cancelled', 'cancel')}
                    />
                </div>
            );
        }

        // Checked-In - Check-Out
        if (status === 'Checked-In') {
            return (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <ActionButton
                        label="🏁 Check-Out"
                        color="#8B5CF6"
                        onClick={() => handleStatusUpdate(_id, 'Completed', 'checkout')}
                    />
                </div>
            );
        }

        return null;
    };

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
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 12
            }}>
                <div>
                    <h3 style={{
                        color: '#0A1E3F',
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 20,
                        margin: 0,
                        marginBottom: 4
                    }}>📋 All Bookings</h3>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {filtered.length} of {bookings.length} bookings
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 20,
                flexWrap: 'wrap'
            }}>
                <input
                    type="text"
                    placeholder="🔍 Search by name, phone, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: 200,
                        padding: '10px 16px',
                        border: '2px solid #E5E7EB',
                        borderRadius: 10,
                        fontSize: 13,
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        border: '2px solid #E5E7EB',
                        borderRadius: 10,
                        fontSize: 13,
                        fontFamily: 'inherit',
                        fontWeight: 600,
                        color: '#0A1E3F',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-In">Checked-In</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div style={{
                overflowX: 'auto',
                borderRadius: 12,
                border: '1px solid #E5E7EB'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13
                }}>
                    <thead>
                        <tr style={{ background: '#F8F9FA' }}>
                            {['ID', 'Guest', 'Phone', 'Room', 'Check-In', 'Amount', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{
                                    padding: '14px 12px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#0A1E3F',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    whiteSpace: 'nowrap'
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{
                                    padding: 40,
                                    textAlign: 'center',
                                    color: '#9CA3AF'
                                }}>Loading...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{
                                    padding: 40,
                                    textAlign: 'center',
                                    color: '#9CA3AF'
                                }}>No bookings found</td>
                            </tr>
                        ) : (
                            filtered.map(b => {
                                const sc = statusClass(b.status);
                                return (
                                    <tr
                                        key={b._id}
                                        style={{
                                            borderBottom: '1px solid #F0F2F5',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#FFF8E1'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: 12, fontWeight: 700, color: '#0A1E3F' }}>
                                            {b.bookingId || b._id.slice(-6)}
                                        </td>
                                        <td style={{ padding: 12, color: '#0A1E3F', fontWeight: 600 }}>
                                            {b.guestName}
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <a href={`tel:${b.guestPhone}`} style={{
                                                color: '#3498DB',
                                                textDecoration: 'none'
                                            }}>{b.guestPhone}</a>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{
                                                background: '#F0F2F5',
                                                padding: '3px 10px',
                                                borderRadius: 999,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: '#0A1E3F'
                                            }}>#{b.room?.roomNumber || 'N/A'}</span>
                                        </td>
                                        <td style={{ padding: 12, color: '#6C757D' }}>
                                            {new Date(b.checkIn).toLocaleDateString('en-IN')}
                                        </td>
                                        <td style={{ padding: 12, fontWeight: 700, color: '#27AE60' }}>
                                            ₹{b.amount}
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: sc.bg,
                                                color: sc.color,
                                                borderRadius: 999,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px',
                                                whiteSpace: 'nowrap'
                                            }}>{b.status}</span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            {renderActionButtons(b)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Flow Guide */}
            <div style={{
                marginTop: 20,
                padding: 16,
                background: '#F8F9FA',
                borderRadius: 12,
                fontSize: 12,
                color: '#6C757D'
            }}>
                <strong style={{ color: '#0A1E3F' }}>💡 Status Flow:</strong>{' '}
                <span style={{ color: '#F39C12', fontWeight: 600 }}>Pending</span> →{' '}
                <span style={{ color: '#27AE60', fontWeight: 600 }}>Confirmed</span> →{' '}
                <span style={{ color: '#3498DB', fontWeight: 600 }}>Checked-In</span> →{' '}
                <span style={{ color: '#8B5CF6', fontWeight: 600 }}>Completed</span>
            </div>

            {/* Spin animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ⭐ Reusable Action Button
function ActionButton({ label, color, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '6px 12px',
                background: color,
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: `0 2px 6px ${color}40`
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${color}60`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 6px ${color}40`;
            }}
        >
            {label}
        </button>
    );
}

export default BookingsTable;