// ============================================
// MY BOOKINGS PAGE
// User ki saari bookings dikhti hain
// Features: Filter tabs, Invoice, Cancel, Review
// ============================================

// React hooks — state aur side-effects ke liye
import { useState, useEffect } from 'react';

// React Router — page navigation ke liye
import { Link, useNavigate } from 'react-router-dom';

// Common components
import Navbar from '../components/Navbar';                 // Top navigation bar
import Footer from '../components/Footer';                 // Bottom footer
import CancelBookingModal from '../components/CancelBookingModal';  // Cancel reason modal
import ReviewModal from '../components/ReviewModal';       // ⭐ NEW: Review likhne ka modal

// Backend API functions
import {
    getMyBookings,          // User ki bookings fetch karne ke liye
    requestCancellation,    // Booking cancel request bhejne ke liye
    downloadInvoice,        // PDF invoice download (currently manual fetch use ho raha)
} from '../api/bookings';

// Auth context — user login check ke liye
import { useAuth } from '../context/AuthContext';

// Toast notifications — success/error messages ke liye
import toast from 'react-hot-toast';


// ============================================
// MAIN COMPONENT
// ============================================
function MyBookings() {
    // ---------- AUTH ----------
    // User logged in hai ya nahi, aur uska data
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();

    // ---------- STATE ----------
    // Bookings list
    const [bookings, setBookings] = useState([]);

    // Loading indicator
    const [loading, setLoading] = useState(true);

    // Active tab: 'all' | 'upcoming' | 'completed' | 'cancelled'
    const [tab, setTab] = useState('all');

    // ---------- CANCEL MODAL STATE ----------
    // Cancel modal khula hai ya nahi
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Kis booking ko cancel karna hai (selected booking)
    const [selectedBooking, setSelectedBooking] = useState(null);

    // ---------- REVIEW MODAL STATE ----------
    // Review modal khula hai ya nahi
    const [showReviewModal, setShowReviewModal] = useState(false);

    // ⚠️ selectedBooking state dono modals me use ho rahi hai
    // (cancel + review) — kyunki ek time pe ek hi modal khulta hai


    // ============================================
    // EFFECT — Page load pe bookings fetch karo
    // ============================================
    useEffect(() => {
        // Agar user logged in nahi hai to login page pe bhejo
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        // Warna bookings load karo
        loadBookings();
    }, [isLoggedIn]);   // Jab bhi login state change ho, ye effect chale


    // ============================================
    // LOAD BOOKINGS — Backend se saari bookings laao
    // ============================================
    const loadBookings = async () => {
        try {
            const data = await getMyBookings();
            // Agar success, to state me set karo
            if (data.success) setBookings(data.bookings);
        } catch (e) {
            console.error('Bookings load failed:', e);
        } finally {
            // Loading false karo (success ya failure dono me)
            setLoading(false);
        }
    };


    // ============================================
    // DOWNLOAD INVOICE — PDF generate + download
    // ============================================
    const handleDownloadInvoice = async (bookingId) => {
        try {
            // Token localStorage se lo
            const token = localStorage.getItem('token');

            // Backend API call (direct fetch — axios nahi)
            const response = await fetch(
                `http://localhost:5000/api/bookings/${bookingId}/invoice`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,   // Auth header
                    },
                }
            );

            // Agar response ok nahi hai to error throw karo
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Blob me convert karo (PDF binary data)
            const blob = await response.blob();

            // Temporary URL banao
            const url = window.URL.createObjectURL(blob);

            // Download link banao (invisible)
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${bookingId}.pdf`);

            // DOM me add karo, click karo, fir remove karo
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Memory free karo
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Invoice download failed:', err);
            alert('Invoice download failed: ' + err.message);
        }
    };


    // ============================================
    // FILTER — Active tab ke hisaab se bookings filter
    // ============================================
    const filtered = bookings.filter((b) => {
        // 'All' tab → saari bookings
        if (tab === 'all') return true;

        // 'Upcoming' tab → Confirmed, Pending, Checked-In
        if (tab === 'upcoming')
            return ['Confirmed', 'Pending', 'Checked-In'].includes(b.status);

        // 'Completed' tab → sirf Completed
        if (tab === 'completed') return b.status === 'Completed';

        // 'Cancelled' tab → sirf Cancelled
        if (tab === 'cancelled') return b.status === 'Cancelled';

        return true;
    });


    // ============================================
    // STATUS BADGE CLASS — Status ke hisaab se color
    // ============================================
    const statusClass = (s) => {
        const map = {
            Confirmed: 'badge-success',       // Green
            Pending: 'badge-warning',         // Yellow
            Cancelled: 'badge-danger',        // Red
            'Checked-In': 'badge-info',       // Blue
            Completed: 'badge-success',       // Green
        };
        return map[s] || 'badge-info';        // Default: info
    };


    // ============================================
    // RENDER
    // ============================================
    return (
        <>
            {/* Top Navbar */}
            <Navbar />

            {/* Main Container */}
            <div
                className="container"
                style={{ padding: '40px 24px', minHeight: '60vh' }}
            >
                {/* Page Heading */}
                <h1 style={{ marginBottom: 25 }}>My Bookings</h1>

                {/* ============ FILTER TABS ============ */}
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        marginBottom: 25,
                        flexWrap: 'wrap',
                    }}
                >
                    {['all', 'upcoming', 'completed', 'cancelled'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`btn ${
                                tab === t ? 'btn-primary' : 'btn-outline'
                            } btn-sm`}
                        >
                            {/* First letter capital + baaki small */}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ============ LOADING / EMPTY / LIST ============ */}
                {loading ? (
                    // ---------- LOADING ----------
                    <div className="loader"></div>
                ) : filtered.length === 0 ? (
                    // ---------- EMPTY STATE ----------
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 60 }}>🏨</div>
                        <h3>No bookings yet</h3>
                        <Link
                            to="/rooms"
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                        >
                            Browse Rooms
                        </Link>
                    </div>
                ) : (
                    // ---------- BOOKINGS LIST ----------
                    <div style={{ display: 'grid', gap: 15 }}>
                        {filtered.map((b) => {
                            // Cancel request pending hai?
                            const isPending =
                                b.cancelRequest?.status === 'pending';

                            // Cancel kar sakte hain? (Cancelled/Completed nahi, aur pending bhi nahi)
                            const canCancel =
                                !['Cancelled', 'Completed'].includes(
                                    b.status
                                ) && !isPending;

                            return (
                                // ---------- SINGLE BOOKING CARD ----------
                                <div
                                    key={b._id}
                                    style={{
                                        background: 'white',
                                        padding: 20,
                                        borderRadius: 16,
                                        borderLeft: '5px solid var(--gold)',
                                        boxShadow:
                                            '0 2px 8px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    {/* Booking header — room + status */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: 15,
                                        }}
                                    >
                                        {/* Left side — room + dates + price */}
                                        <div>
                                            <h3
                                                style={{
                                                    color: 'var(--navy)',
                                                    marginBottom: 5,
                                                }}
                                            >
                                                {b.room?.roomType} — Room{' '}
                                                {b.room?.roomNumber}
                                            </h3>

                                            {/* Dates */}
                                            <p
                                                style={{
                                                    fontSize: 13,
                                                    color: 'var(--text-muted)',
                                                    marginBottom: 3,
                                                }}
                                            >
                                                📅{' '}
                                                {new Date(
                                                    b.checkIn
                                                ).toLocaleDateString(
                                                    'en-IN'
                                                )}{' '}
                                                →{' '}
                                                {new Date(
                                                    b.checkOut
                                                ).toLocaleDateString(
                                                    'en-IN'
                                                )}
                                            </p>

                                            {/* Nights + Guests */}
                                            <p
                                                style={{
                                                    fontSize: 13,
                                                    color: 'var(--text-muted)',
                                                    marginBottom: 3,
                                                }}
                                            >
                                                {b.nights} night
                                                {b.nights > 1 ? 's' : ''} •{' '}
                                                {b.guests} guest
                                                {b.guests > 1 ? 's' : ''}
                                            </p>

                                            {/* Amount */}
                                            <p
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: 'var(--gold-dark)',
                                                    marginTop: 8,
                                                }}
                                            >
                                                ₹{b.amount}
                                            </p>
                                        </div>

                                        {/* Right side — status badge + ID */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                gap: 8,
                                            }}
                                        >
                                            <span
                                                className={`badge ${statusClass(
                                                    b.status
                                                )}`}
                                            >
                                                {b.status}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--text-muted)',
                                                }}
                                            >
                                                ID: {b.bookingId}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cancel request pending ka message */}
                                    {isPending && (
                                        <div
                                            style={{
                                                background: '#FEF3C7',
                                                padding: '10px 14px',
                                                borderRadius: 8,
                                                marginTop: 12,
                                                fontSize: 12,
                                                color: '#92400E',
                                            }}
                                        >
                                            ⏳ Cancellation request pending
                                        </div>
                                    )}

                                    {/* ============ ACTION BUTTONS ============ */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 10,
                                            marginTop: 15,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {/* ---------- INVOICE BUTTON ---------- */}
                                        <button
                                            onClick={() =>
                                                handleDownloadInvoice(b._id)
                                            }
                                            className="btn btn-outline btn-sm"
                                        >
                                            📄 Invoice
                                        </button>

                                        {/* ---------- CANCEL BUTTON ---------- */}
                                        {canCancel && (
                                            <button
                                                onClick={() => {
                                                    // Selected booking set karo
                                                    setSelectedBooking(b);
                                                    // Cancel modal kholo
                                                    setShowCancelModal(true);
                                                }}
                                                className="btn btn-sm"
                                                style={{
                                                    padding: '8px 20px',
                                                    background: '#DC2626',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontSize: 13,
                                                }}
                                            >
                                                ❌ Cancel
                                            </button>
                                        )}

                                        {/* ⭐ ---------- REVIEW BUTTON ---------- */}
                                        {/* Sirf Completed bookings ke liye */}
                                        {b.status === 'Completed' && (
                                            <>
                                                {b.hasReview ? (
                                                    // Review already submitted — disabled
                                                    <button
                                                        disabled
                                                        style={{
                                                            padding:
                                                                '8px 20px',
                                                            background:
                                                                '#DCFCE7',
                                                            color: '#166534',
                                                            border:
                                                                '1px solid #22C55E',
                                                            borderRadius: 8,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            cursor: 'not-allowed',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: 6,
                                                        }}
                                                    >
                                                        ✅ Review Submitted
                                                    </button>
                                                ) : (
                                                    // Review nahi diya — button clickable
                                                    <button
                                                        onClick={() => {
                                                            // Selected booking set karo
                                                            setSelectedBooking(
                                                                b
                                                            );
                                                            // Review modal kholo
                                                            setShowReviewModal(
                                                                true
                                                            );
                                                        }}
                                                        style={{
                                                            padding:
                                                                '8px 20px',
                                                            background:
                                                                'linear-gradient(135deg, #D4AF37, #B8912E)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: 8,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: 6,
                                                            boxShadow:
                                                                '0 4px 12px rgba(212,175,55,0.3)',
                                                        }}
                                                    >
                                                        ⭐ Write Review
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Footer */}
            <Footer />

            {/* ============================================
                CANCEL BOOKING MODAL
                Jab user cancel button dabata hai
            ============================================ */}
            <CancelBookingModal
                open={showCancelModal}
                booking={selectedBooking}
                onClose={() => {
                    // Modal band karo + selection clear karo
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                }}
                onConfirm={async (reason) => {
                    // Cancel request backend pe bhejo
                    try {
                        await requestCancellation(
                            selectedBooking._id,
                            reason
                        );
                        toast.success('Cancellation request bhej di gayi ✅');

                        // Modal band + refresh
                        setShowCancelModal(false);
                        setSelectedBooking(null);
                        loadBookings();
                    } catch (err) {
                        toast.error(
                            err.response?.data?.message ||
                                'Cancel request failed'
                        );
                    }
                }}
            />

            {/* ============================================
                ⭐ REVIEW MODAL
                Jab user "Write Review" button dabata hai
                Sirf Completed bookings ke liye
            ============================================ */}
            <ReviewModal
                // Modal khula hai ya nahi
                open={showReviewModal}
                // Kis booking ka review likhna hai
                booking={selectedBooking}
                // Modal close karne pe
                onClose={() => {
                    setShowReviewModal(false);
                    setSelectedBooking(null);
                }}
                // Review successfully submit hone pe
                onSuccess={() => {
                    setShowReviewModal(false);
                    setSelectedBooking(null);
                    // Bookings reload karo taaki "Review Submitted" dikhe
                    loadBookings();
                    toast.success('Review submit ho gaya! Thank you 🎉');
                }}
            />
        </>
    );
}

export default MyBookings;