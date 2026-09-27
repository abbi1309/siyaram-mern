import { useState, useEffect } from 'react';
import { getCancelRequests, approveCancel, rejectCancel } from '../../api/admin';
import toast from 'react-hot-toast';

function CancelRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadRequests(); }, []);

    const loadRequests = async () => {
        try {
            const data = await getCancelRequests();
            if (data.success) setRequests(data.requests);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve cancellation?\n\nBooking will be cancelled.')) return;
        try {
            await approveCancel(id);
            toast.success('✅ Booking cancelled');
            loadRequests();
        } catch (e) { toast.error('Error'); }
    };

    const handleReject = async (id) => {
        if (!confirm('Reject cancellation?')) return;
        try {
            await rejectCancel(id);
            toast.success('✅ Request rejected');
            loadRequests();
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            borderLeft: '5px solid #F39C12',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: 25
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
                    }}>
                        ⚠️ Pending Cancel Requests
                    </h3>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                        Review and take action
                    </div>
                </div>
                {requests.length > 0 && (
                    <div style={{
                        padding: '6px 14px',
                        background: '#FEF3C7',
                        color: '#92400E',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700
                    }}>{requests.length} pending</div>
                )}
            </div>

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#9CA3AF'
                }}>Loading...</div>
            ) : requests.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    background: '#E8F8F0',
                    borderRadius: 12
                }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                    <div style={{ color: '#27AE60', fontWeight: 700 }}>
                        No pending requests
                    </div>
                    <div style={{ fontSize: 12, color: '#6C757D', marginTop: 4 }}>
                        All caught up!
                    </div>
                </div>
            ) : (
                requests.map(b => (
                    <div
                        key={b._id}
                        style={{
                            background: '#FFF8E1',
                            padding: 18,
                            borderRadius: 12,
                            marginBottom: 12,
                            borderLeft: '4px solid #F39C12',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 15
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 250 }}>
                            <div style={{
                                fontWeight: 700,
                                color: '#0A1E3F',
                                fontSize: 15,
                                marginBottom: 6
                            }}>
                                Room {b.room?.roomNumber || 'N/A'} — {b.guestName}
                            </div>
                            <div style={{
                                fontSize: 12,
                                color: '#6C757D',
                                marginBottom: 8
                            }}>
                                📞 {b.guestPhone} • 📅 {new Date(b.checkIn).toLocaleDateString('en-IN')}
                            </div>
                            <div style={{
                                background: 'white',
                                padding: '8px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                color: '#92400E',
                                borderLeft: '3px solid #F39C12'
                            }}>
                                <strong>Reason:</strong> {b.cancelRequest?.reason || 'N/A'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => handleApprove(b._id)}
                                style={{
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                ✅ Approve
                            </button>
                            <button
                                onClick={() => handleReject(b._id)}
                                style={{
                                    padding: '10px 20px',
                                    background: 'white',
                                    color: '#6C757D',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                ❌ Reject
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default CancelRequests;