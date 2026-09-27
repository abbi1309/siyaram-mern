// ============================================
// REVIEW MODAL
// User review likhta hai yahan se
// Sirf Completed bookings ke liye
// ============================================

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Backend API URL
const API = import.meta.env.VITE_API_URL || '';

function ReviewModal({ open, booking, onClose, onSuccess }) {
    // ---------- STATE ----------
    // Kitne stars select kiye (default 5)
    const [rating, setRating] = useState(5);

    // Mouse hover pe kaunsa star highlight ho
    const [hoverRating, setHoverRating] = useState(0);

    // Comment text
    const [comment, setComment] = useState('');

    // Submitting state (loading)
    const [submitting, setSubmitting] = useState(false);

    // Agar modal band hai ya booking nahi hai to kuch render nahi
    if (!open || !booking) return null;

    // ---------- RATING LABELS ----------
    // Rating ke saath text
    const ratingLabels = {
        1: '😞 Poor',
        2: '😐 Fair',
        3: '🙂 Good',
        4: '😊 Very Good',
        5: '🤩 Excellent',
    };

    // ---------- SUBMIT HANDLER ----------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Comment validation
        if (!comment || comment.trim().length < 10) {
            return toast.error(
                'Comment kam se kam 10 characters ka hona chahiye'
            );
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // Backend pe review submit karo
            const res = await axios.post(
                `${API}/api/reviews`,
                {
                    bookingId: booking._id,      // Kis booking ka review
                    rating: rating,                // 1-5
                    comment: comment.trim(),       // Text
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                toast.success('Review submit ho gaya! 🎉');
                // Form reset karo
                setComment('');
                setRating(5);
                // Parent ko batao
                onSuccess?.();
            } else {
                toast.error(res.data.message || 'Submit failed');
            }
        } catch (err) {
            console.error('Review submit error:', err);
            toast.error(
                err.response?.data?.message ||
                    'Review submit nahi hua. Dobara try karein.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- CLOSE HANDLER ----------
    const handleClose = () => {
        if (submitting) return;   // Submitting ke time band na ho
        setComment('');
        setRating(5);
        setHoverRating(0);
        onClose?.();
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
                backdropFilter: 'blur(4px)',
            }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 20,
                    width: '100%',
                    maxWidth: 520,
                    maxHeight: '92vh',
                    overflow: 'auto',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
                    animation: 'modalSlideIn 0.3s ease',
                }}
            >
                {/* ============ HEADER ============ */}
                <div
                    style={{
                        background:
                            'linear-gradient(135deg, #0A1E3F, #1A3A6B)',
                        color: '#fff',
                        padding: '22px 26px',
                        position: 'relative',
                    }}
                >
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            border: 'none',
                            color: '#fff',
                            fontSize: 18,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        ✕
                    </button>

                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 800,
                            marginBottom: 4,
                        }}
                    >
                        ⭐ Share Your Experience
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            opacity: 0.85,
                        }}
                    >
                        {booking.room?.roomType} — Room{' '}
                        {booking.room?.roomNumber}
                    </div>
                </div>

                {/* ============ BOOKING INFO ============ */}
                <div
                    style={{
                        padding: '14px 26px',
                        background: '#F0F9FF',
                        borderBottom: '1px solid #BAE6FD',
                        fontSize: 12,
                        color: '#075985',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                    }}
                >
                    <span>
                        📅{' '}
                        {new Date(booking.checkIn).toLocaleDateString(
                            'en-IN'
                        )}{' '}
                        →{' '}
                        {new Date(booking.checkOut).toLocaleDateString(
                            'en-IN'
                        )}
                    </span>
                    <span>
                        ✅ Verified Stay
                    </span>
                </div>

                {/* ============ FORM ============ */}
                <form onSubmit={handleSubmit} style={{ padding: 26 }}>
                    {/* ---------- RATING ---------- */}
                    <div style={{ marginBottom: 24 }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#0A1E3F',
                                marginBottom: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            ⭐ Your Rating *
                        </label>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                flexWrap: 'wrap',
                            }}
                        >
                            {/* 5 stars */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 6,
                                }}
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() =>
                                            setHoverRating(0)
                                        }
                                        disabled={submitting}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: 36,
                                            cursor: submitting
                                                ? 'not-allowed'
                                                : 'pointer',
                                            color:
                                                star <=
                                                (hoverRating || rating)
                                                    ? '#FFB400'
                                                    : '#E5E7EB',
                                            padding: 0,
                                            transition:
                                                'transform 0.15s, color 0.15s',
                                            transform:
                                                star <=
                                                (hoverRating || rating)
                                                    ? 'scale(1.1)'
                                                    : 'scale(1)',
                                            lineHeight: 1,
                                        }}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            {/* Rating label */}
                            <span
                                style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: '#0A1E3F',
                                }}
                            >
                                {ratingLabels[rating]}
                            </span>
                        </div>
                    </div>

                    {/* ---------- COMMENT ---------- */}
                    <div style={{ marginBottom: 20 }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#0A1E3F',
                                marginBottom: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            💬 Your Experience *
                        </label>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            maxLength={500}
                            placeholder="Tell us about your stay... (minimum 10 characters)"
                            disabled={submitting}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '1.5px solid #E5E7EB',
                                borderRadius: 12,
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                lineHeight: 1.5,
                                minHeight: 120,
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#D4AF37')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#E5E7EB')
                            }
                        />

                        {/* Character counter */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 6,
                                fontSize: 11,
                                color:
                                    comment.length < 10 &&
                                    comment.length > 0
                                        ? '#DC2626'
                                        : '#9CA3AF',
                            }}
                        >
                            <span>
                                {comment.length > 0 &&
                                    comment.length < 10 &&
                                    '⚠️ Kam se kam 10 characters chahiye'}
                            </span>
                            <span>{comment.length}/500</span>
                        </div>
                    </div>

                    {/* ---------- INFO BOX ---------- */}
                    <div
                        style={{
                            background: '#F0FDF4',
                            border: '1px solid #86EFAC',
                            borderRadius: 10,
                            padding: '12px 16px',
                            fontSize: 12,
                            color: '#166534',
                            marginBottom: 22,
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                        }}
                    >
                        <span style={{ fontSize: 16, lineHeight: 1.2 }}>
                            ✅
                        </span>
                        <div>
                            <strong>Verified Review:</strong> Ye review
                            aapki actual booking se linked hai, isliye ye
                            verified dikhega.
                        </div>
                    </div>

                    {/* ---------- BUTTONS ---------- */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 12,
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            style={{
                                flex: 1,
                                padding: 14,
                                background: '#fff',
                                color: '#0A1E3F',
                                border: '1.5px solid #E5E7EB',
                                borderRadius: 12,
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: submitting
                                    ? 'not-allowed'
                                    : 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = '#F9FAFB')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = '#fff')
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting || comment.trim().length < 10
                            }
                            style={{
                                flex: 2,
                                padding: 14,
                                background:
                                    submitting ||
                                    comment.trim().length < 10
                                        ? '#9CA3AF'
                                        : 'linear-gradient(135deg, #D4AF37, #B8912E)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontWeight: 800,
                                fontSize: 14,
                                cursor:
                                    submitting ||
                                    comment.trim().length < 10
                                        ? 'not-allowed'
                                        : 'pointer',
                                boxShadow:
                                    submitting ||
                                    comment.trim().length < 10
                                        ? 'none'
                                        : '0 8px 20px rgba(212,175,55,0.35)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {submitting
                                ? '⏳ Submitting...'
                                : '✅ Submit Review'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Animation */}
            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

export default ReviewModal;