import { useState } from 'react';

function CancelBookingModal({ open, booking, onClose, onConfirm }) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!open || !booking) return null;

    const quickReasons = [
        'Plans changed',
        'Booked by mistake',
        'Found better option',
        'Travel dates changed',
        'Emergency',
    ];

    const handleSubmit = async () => {
        if (!reason.trim()) {
            return alert('Kripya cancellation ka reason likhein');
        }

        setSubmitting(true);
        try {
            await onConfirm(reason.trim());
            setReason('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 460,
                    overflow: 'hidden',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background:
                            'linear-gradient(135deg, #DC2626, #991B1B)',
                        color: '#fff',
                        padding: '18px 22px',
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                        ❌ Cancel Booking
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                        Kya aap ye booking cancel karna chahte hain?
                    </div>
                </div>

                {/* Booking Info */}
                <div
                    style={{
                        padding: '16px 22px',
                        background: '#FEF2F2',
                        borderBottom: '1px solid #FEE2E2',
                        fontSize: 12,
                        color: '#991B1B',
                        fontWeight: 600,
                    }}
                >
                    <div>
                        <strong>Room:</strong> {booking.room?.roomType} —{' '}
                        {booking.room?.roomNumber}
                    </div>
                    <div style={{ marginTop: 4 }}>
                        <strong>Dates:</strong>{' '}
                        {new Date(booking.checkIn).toLocaleDateString(
                            'en-IN'
                        )}{' '}
                        →{' '}
                        {new Date(booking.checkOut).toLocaleDateString(
                            'en-IN'
                        )}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: 22 }}>
                    {/* Quick reasons */}
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 700,
                                color: 'var(--navy)',
                                marginBottom: 8,
                            }}
                        >
                            Quick reasons
                        </label>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                            }}
                        >
                            {quickReasons.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setReason(r)}
                                    disabled={submitting}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        borderRadius: 20,
                                        border:
                                            reason === r
                                                ? '2px solid #DC2626'
                                                : '1px solid #E5E7EB',
                                        background:
                                            reason === r
                                                ? '#FEE2E2'
                                                : '#F9FAFB',
                                        color:
                                            reason === r
                                                ? '#991B1B'
                                                : 'var(--text-muted)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom reason */}
                    <label
                        style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--navy)',
                            marginBottom: 6,
                        }}
                    >
                        Ya apna reason likhein *
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        maxLength={200}
                        placeholder="Cancellation ki wajah..."
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1.5px solid #E5E7EB',
                            borderRadius: 10,
                            fontSize: 13,
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'none',
                            fontFamily: 'inherit',
                        }}
                    />
                    <div
                        style={{
                            fontSize: 10,
                            color: 'var(--text-muted)',
                            textAlign: 'right',
                            marginTop: 4,
                        }}
                    >
                        {reason.length}/200
                    </div>

                    <div
                        style={{
                            marginTop: 12,
                            padding: '10px 14px',
                            background: '#FEF3C7',
                            border: '1px solid #FCD34D',
                            borderRadius: 8,
                            fontSize: 11,
                            color: '#92400E',
                            fontWeight: 600,
                        }}
                    >
                        ⚠️ Cancellation request admin ko jayegi. Approve hone
                        tak booking active rahegi.
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '0 22px 22px',
                        display: 'flex',
                        gap: 10,
                    }}
                >
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#fff',
                            color: 'var(--navy)',
                            border: '1.5px solid #E5E7EB',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !reason.trim()}
                        style={{
                            flex: 2,
                            padding: '12px',
                            background:
                                submitting || !reason.trim()
                                    ? '#999'
                                    : 'linear-gradient(135deg, #DC2626, #991B1B)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: 13,
                            cursor:
                                submitting || !reason.trim()
                                    ? 'not-allowed'
                                    : 'pointer',
                        }}
                    >
                        {submitting ? '⏳ Sending...' : '✅ Send Cancel Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CancelBookingModal;