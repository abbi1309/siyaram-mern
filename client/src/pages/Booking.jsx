import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DummyPaymentModal from '../components/DummyPaymentModal';
import BookingCalendar from '../components/BookingCalendar';
import { getRoomById } from '../api/rooms';
import { createBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import { startPayment } from '../utils/payment';
import toast from 'react-hot-toast';

// Backend URL
const API = import.meta.env.VITE_API_URL || '';

function Booking() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();

    const [room, setRoom] = useState(null);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [phone, setPhone] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [loading, setLoading] = useState(false);

    const [bookedDates, setBookedDates] = useState([]);

    // 👇 Dummy payment modal ke liye 2 nayi states
    const [showDummyModal, setShowDummyModal] = useState(false);
    const [dummyPaymentData, setDummyPaymentData] = useState(null);

    // 👇👇👇 COUPON STATE
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    // 👇👇👇 ZEPTO-STYLE COUPON LIST STATE
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showAllCoupons, setShowAllCoupons] = useState(false);
    const [couponsLoading, setCouponsLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            toast.error('Please login first');
            navigate('/login');
            return;
        }

        loadRoom();

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        setCheckIn(tomorrow.toISOString().split('T')[0]);
        setCheckOut(dayAfter.toISOString().split('T')[0]);
        setPhone(user?.phone || '');
    }, [roomId, isLoggedIn]);

    // 👇 Booked dates fetch karo
    useEffect(() => {
        if (!roomId || !isLoggedIn) return;

        const fetchBookedDates = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(
                    `/api/bookings/room/${roomId}/booked-dates`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (res.data.success) {
                    console.log('📅 Booked dates from API:', res.data.bookedDates);
                    setBookedDates(res.data.bookedDates);
                }
            } catch (err) {
                console.error('Failed to load booked dates:', err);
            }
        };

        fetchBookedDates();
    }, [roomId, isLoggedIn]);

    // ============================================
    // 👇 FETCH APPLICABLE COUPONS (Zepto-style)
    // Booking amount ke hisaab se list
    // ============================================
    useEffect(() => {
        if (!room || !checkIn || !checkOut) return;

        const fetchApplicable = async () => {
            setCouponsLoading(true);
            try {
                const token = localStorage.getItem('token');
                // 👇 DYNAMIC: room ka price use karo, hardcoded nahi
                const priceLocal = room.pricePerNight || 1500;
                const nightsLocal = Math.max(
                    1,
                    Math.ceil(
                        (new Date(checkOut) - new Date(checkIn)) /
                            (1000 * 60 * 60 * 24)
                    )
                );
                const amount = priceLocal * nightsLocal;

                const res = await axios.post(
                    `${API}/api/coupons/applicable`,
                    {
                        amount,
                        nights: nightsLocal,
                        roomType: room.roomType,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.success) {
                    setAvailableCoupons(res.data.coupons);
                }
            } catch (err) {
                console.error('Coupons load failed:', err);
            } finally {
                setCouponsLoading(false);
            }
        };

        fetchApplicable();
    }, [room, checkIn, checkOut]);

    const loadRoom = async () => {
        try {
            const data = await getRoomById(roomId);
            if (data.success) setRoom(data.room);
        } catch (err) {
            console.error('Room load failed:', err);
            toast.error('Room load nahi hua');
        }
    };

    if (!room) {
        return <div className="loader" style={{ marginTop: 200 }}></div>;
    }

    const nights = Math.max(
        1,
        Math.ceil(
            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
        )
    );

    const subtotal = nights * room.pricePerNight;

    // 👇 DYNAMIC: room ka price use karo (admin change kar sakta hai)
    const pricePerNight = room.pricePerNight || 1500;
    const totalAmount = pricePerNight * nights;

    // 👇 FINAL AMOUNT (discount ke baad)
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // 👇 Helper — check karo range me koi booked date hai ya nahi
    const hasOverlapInRange = () => {
        if (!checkIn || !checkOut) return false;

        const start = new Date(checkIn);
        const end = new Date(checkOut);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        return bookedDates.some((d) => {
            const dt = new Date(d);
            dt.setHours(0, 0, 0, 0);
            return dt >= start && dt < end;
        });
    };

    // 👇 Manual coupon apply
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            return toast.error('Coupon code daalein');
        }

        setCouponLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API}/api/coupons/apply`,
                {
                    code: couponCode.trim().toUpperCase(),
                    amount: totalAmount,
                    nights: nights,
                    roomType: room.roomType,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data.success) {
                setAppliedCoupon(res.data.coupon);
                setDiscountAmount(res.data.discountAmount);
                toast.success(res.data.message);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Coupon apply failed'
            );
            setAppliedCoupon(null);
            setDiscountAmount(0);
        } finally {
            setCouponLoading(false);
        }
    };

    // 👇 One-click apply from list
    const handleQuickApply = async (code) => {
        setCouponCode(code);
        setCouponLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API}/api/coupons/apply`,
                {
                    code,
                    amount: totalAmount,
                    nights: nights,
                    roomType: room.roomType,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setAppliedCoupon(res.data.coupon);
                setDiscountAmount(res.data.discountAmount);
                toast.success(res.data.message);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Apply failed'
            );
        } finally {
            setCouponLoading(false);
        }
    };

    // 👇 Remove coupon
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        toast.success('Coupon removed');
    };

    const handleBooking = async () => {
        // 👇 Pehle overlap check
        if (hasOverlapInRange()) {
            return toast.error(
                '❌ Ye room in dates ke liye already booked hai. Dusri dates choose karein.'
            );
        }

        if (!phone || phone.length !== 10) {
            return toast.error('Enter 10 digit phone number');
        }

        setLoading(true);
        try {
            const data = await createBooking({
                roomId,
                checkIn,
                checkOut,
                guests: Number(guests),
                specialRequests,
                guestPhone: phone,
                totalAmount: finalAmount,
                couponCode: appliedCoupon?.code || null,
                discountAmount: discountAmount,
            });

            if (!data.success) {
                throw new Error(data.message || 'Booking failed');
            }

            const booking = data.booking || data.data || data;

            await startPayment({
                amount: finalAmount,
                bookingId: booking._id,
                user,

                onDummyPayment: (info) => {
                    setDummyPaymentData(info);
                    setShowDummyModal(true);
                    setLoading(false);
                },

                onSuccess: () => {
                    setShowDummyModal(false);
                    setDummyPaymentData(null);
                    toast.success('Payment successful! 🎉');

                    const msg =
                        `Nayi Booking! %0A` +
                        `*Guest:* ${user.name}%0A` +
                        `*Room:* ${room.roomNumber}%0A` +
                        `*Nights:* ${nights}%0A` +
                        `*Total:* Rs ${finalAmount}` +
                        (appliedCoupon
                            ? `%0A*Coupon:* ${appliedCoupon.code} (-Rs ${discountAmount})`
                            : '');
                    window.open(
                        `https://wa.me/919315377668?text=${msg}`,
                        '_blank'
                    );

                    navigate('/my-bookings');
                },

                onFailure: (err) => {
                    setShowDummyModal(false);
                    setDummyPaymentData(null);
                    toast.error(err.message || 'Payment failed');
                },
            });
        } catch (e) {
            console.error(e);
            toast.error(
                e.response?.data?.message || e.message || 'Booking failed'
            );
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 24px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: 10 }}>
                    Complete Your Booking
                </h1>
                <p
                    style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        marginBottom: 40,
                    }}
                >
                    Please review your details and proceed
                </p>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: 30,
                    }}
                >
                    <div>
                        {/* 👇 CALENDAR */}
                        <BookingCalendar
                            bookedDates={bookedDates}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            onSelect={(newCheckIn, newCheckOut) => {
                                setCheckIn(newCheckIn);
                                setCheckOut(newCheckOut);
                            }}
                        />

                        <div
                            style={{
                                background: 'white',
                                padding: 24,
                                borderRadius: 16,
                                marginBottom: 20,
                            }}
                        >
                            <h3 style={{ marginBottom: 20 }}>Booking Details</h3>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 15,
                                }}
                            >
                                <div className="form-group">
                                    <label className="form-label">
                                        Check-In
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={checkIn}
                                        readOnly
                                        style={{
                                            background: '#F9FAFB',
                                            cursor: 'not-allowed',
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Check-Out
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={checkOut}
                                        readOnly
                                        style={{
                                            background: '#F9FAFB',
                                            cursor: 'not-allowed',
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Guests</label>
                                    <select
                                        className="form-control"
                                        value={guests}
                                        onChange={(e) =>
                                            setGuests(e.target.value)
                                        }
                                    >
                                        <option value="1">1 Guest</option>
                                        <option value="2">2 Guests</option>
                                        <option value="3">3 Guests</option>
                                        <option value="4">4 Guests</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Special Requests (Optional)
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={specialRequests}
                                    onChange={(e) =>
                                        setSpecialRequests(e.target.value)
                                    }
                                    placeholder="Any special requests..."
                                />
                            </div>
                        </div>

                        <div
                            style={{
                                background: 'white',
                                padding: 24,
                                borderRadius: 16,
                            }}
                        >
                            <h3 style={{ marginBottom: 15 }}>
                                Guest Information
                            </h3>
                            <p style={{ marginBottom: 5 }}>
                                <strong>Name:</strong> {user.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {user.email}
                            </p>
                        </div>
                    </div>

                    <aside
                        style={{
                            background: 'white',
                            padding: 24,
                            borderRadius: 16,
                            height: 'fit-content',
                            position: 'sticky',
                            top: 100,
                            borderTop: '4px solid var(--gold)',
                        }}
                    >
                        <h3 style={{ marginBottom: 15 }}>Price Summary</h3>

                        <div
                            style={{
                                display: 'flex',
                                gap: 15,
                                marginBottom: 20,
                                paddingBottom: 20,
                                borderBottom: '1px solid var(--border)',
                            }}
                        >
                            <div
                                style={{
                                    width: 60,
                                    height: 60,
                                    background:
                                        'linear-gradient(135deg, var(--navy), var(--navy-light))',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 24,
                                }}
                            >
                                🏨
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: 'var(--navy)',
                                    }}
                                >
                                    {room.roomType}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    Room {room.roomNumber}
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: 13, marginBottom: 15 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                }}
                            >
                                {/* 👇 DYNAMIC PRICE */}
                                <span>
                                    ₹{pricePerNight} × {nights} night
                                    {nights > 1 ? 's' : ''}
                                </span>
                                <span>₹{totalAmount}</span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 15,
                                    paddingBottom: 15,
                                    borderBottom: '1px solid var(--border)',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: '#22C55E',
                                        fontWeight: 600,
                                    }}
                                >
                                    ✓ All taxes included
                                </span>
                                <span></span>
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════
                            COUPON SECTION — Zepto/Blinkit Style
                        ═══════════════════════════════════════════ */}
                        <div
                            style={{
                                marginBottom: 16,
                                paddingBottom: 16,
                                borderBottom: '1px dashed #E5E7EB',
                            }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: 'var(--navy)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    🎁 Available Offers
                                    {availableCoupons.length > 0 && (
                                        <span
                                            style={{
                                                fontSize: 10,
                                                background: '#DCFCE7',
                                                color: '#166534',
                                                padding: '2px 8px',
                                                borderRadius: 10,
                                                fontWeight: 800,
                                            }}
                                        >
                                            {availableCoupons.filter(
                                                (c) => c.applicable
                                            ).length}{' '}
                                            applicable
                                        </span>
                                    )}
                                </div>
                                {availableCoupons.length > 3 && (
                                    <button
                                        onClick={() =>
                                            setShowAllCoupons(!showAllCoupons)
                                        }
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--gold-dark)',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            padding: 0,
                                        }}
                                    >
                                        {showAllCoupons
                                            ? 'Show less'
                                            : 'View all →'}
                                    </button>
                                )}
                            </div>

                            {/* Loading */}
                            {couponsLoading && (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: 16,
                                        color: 'var(--text-muted)',
                                        fontSize: 12,
                                    }}
                                >
                                    Loading offers...
                                </div>
                            )}

                            {/* Empty */}
                            {!couponsLoading &&
                                availableCoupons.length === 0 && (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: 16,
                                            color: 'var(--text-muted)',
                                            fontSize: 12,
                                            background: '#F9FAFB',
                                            borderRadius: 10,
                                        }}
                                    >
                                        No offers available right now
                                    </div>
                                )}

                            {/* Coupon List */}
                            {!couponsLoading &&
                                availableCoupons.length > 0 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                        }}
                                    >
                                        {(showAllCoupons
                                            ? availableCoupons
                                            : availableCoupons.slice(0, 3)
                                        ).map((coupon) => {
                                            const isApplied =
                                                appliedCoupon?._id ===
                                                coupon._id;

                                            return (
                                                <div
                                                    key={coupon._id}
                                                    style={{
                                                        background: isApplied
                                                            ? '#DCFCE7'
                                                            : '#fff',
                                                        border: isApplied
                                                            ? '1.5px solid #22C55E'
                                                            : coupon.applicable
                                                            ? '1.5px dashed #E5E7EB'
                                                            : '1.5px dashed #F3F4F6',
                                                        borderRadius: 10,
                                                        padding: '10px 12px',
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems: 'center',
                                                        gap: 10,
                                                        opacity:
                                                            coupon.applicable
                                                                ? 1
                                                                : 0.55,
                                                    }}
                                                >
                                                    {/* Left — code + desc */}
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: 8,
                                                                marginBottom: 3,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontFamily:
                                                                        'monospace',
                                                                    fontSize: 12,
                                                                    fontWeight: 800,
                                                                    color: isApplied
                                                                        ? '#166534'
                                                                        : 'var(--navy)',
                                                                    letterSpacing:
                                                                        '0.5px',
                                                                }}
                                                            >
                                                                {coupon.code}
                                                            </span>
                                                            {coupon.discountPreview >
                                                                0 && (
                                                                <span
                                                                    style={{
                                                                        fontSize: 10,
                                                                        background:
                                                                            isApplied
                                                                                ? '#22C55E'
                                                                                : '#FEF3C7',
                                                                        color: isApplied
                                                                            ? '#fff'
                                                                            : '#92400E',
                                                                        padding:
                                                                            '2px 6px',
                                                                        borderRadius: 6,
                                                                        fontWeight: 800,
                                                                    }}
                                                                >
                                                                    Save ₹
                                                                    {
                                                                        coupon.discountPreview
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--text-muted)',
                                                                lineHeight: 1.3,
                                                                overflow:
                                                                    'hidden',
                                                                textOverflow:
                                                                    'ellipsis',
                                                                whiteSpace:
                                                                    'nowrap',
                                                            }}
                                                        >
                                                            {coupon.applicable
                                                                ? coupon.description
                                                                : `❌ ${coupon.reason}`}
                                                        </div>
                                                    </div>

                                                    {/* Right — action */}
                                                    {isApplied ? (
                                                        <button
                                                            onClick={
                                                                handleRemoveCoupon
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 12px',
                                                                background:
                                                                    '#fff',
                                                                color: '#DC2626',
                                                                border:
                                                                    '1px solid #DC2626',
                                                                borderRadius: 8,
                                                                fontSize: 10,
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                whiteSpace:
                                                                    'nowrap',
                                                            }}
                                                        >
                                                            ✕ REMOVE
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    !coupon.applicable
                                                                ) {
                                                                    return toast.error(
                                                                        coupon.reason
                                                                    );
                                                                }
                                                                handleQuickApply(
                                                                    coupon.code
                                                                );
                                                            }}
                                                            disabled={
                                                                couponLoading
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 12px',
                                                                background:
                                                                    coupon.applicable
                                                                        ? 'linear-gradient(135deg, #D4AF37, #B8912E)'
                                                                        : '#F3F4F6',
                                                                color: coupon.applicable
                                                                    ? '#fff'
                                                                    : '#9CA3AF',
                                                                border: 'none',
                                                                borderRadius: 8,
                                                                fontSize: 10,
                                                                fontWeight: 800,
                                                                cursor: coupon.applicable
                                                                    ? 'pointer'
                                                                    : 'not-allowed',
                                                                whiteSpace:
                                                                    'nowrap',
                                                            }}
                                                        >
                                                            {coupon.applicable
                                                                ? 'APPLY'
                                                                : 'LOCKED'}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                            {/* Manual code — collapsible */}
                            <details
                                style={{
                                    marginTop: 12,
                                    fontSize: 11,
                                    color: 'var(--text-muted)',
                                }}
                            >
                                <summary
                                    style={{
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        outline: 'none',
                                    }}
                                >
                                    Have a different code?
                                </summary>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        marginTop: 8,
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        value={couponCode}
                                        onChange={(e) =>
                                            setCouponCode(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        disabled={couponLoading}
                                        style={{
                                            flex: 1,
                                            padding: '8px 10px',
                                            border: '1.5px solid #E5E7EB',
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            outline: 'none',
                                            textTransform: 'uppercase',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={
                                            couponLoading ||
                                            !couponCode.trim()
                                        }
                                        style={{
                                            padding: '8px 14px',
                                            background:
                                                couponLoading ||
                                                !couponCode.trim()
                                                    ? '#9CA3AF'
                                                    : 'linear-gradient(135deg, #D4AF37, #B8912E)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 11,
                                            fontWeight: 800,
                                            cursor:
                                                couponLoading ||
                                                !couponCode.trim()
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </details>
                        </div>

                        {/* ═══════════ TOTAL WITH DISCOUNT ═══════════ */}
                        {discountAmount > 0 && (
                            <>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                        marginBottom: 6,
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                        marginBottom: 8,
                                        color: '#22C55E',
                                        fontWeight: 700,
                                    }}
                                >
                                    <span>
                                        Discount ({appliedCoupon?.code})
                                    </span>
                                    <span>− ₹{discountAmount}</span>
                                </div>
                                <div
                                    style={{
                                        height: 1,
                                        background: '#E5E7EB',
                                        marginBottom: 12,
                                    }}
                                />
                            </>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 18,
                                fontWeight: 800,
                                color: 'var(--navy)',
                            }}
                        >
                            <span>Total</span>
                            <span>₹{finalAmount}</span>
                        </div>

                        {/* 👇 Overlap warning button ke upar */}
                        {hasOverlapInRange() && (
                            <div
                                style={{
                                    background: '#FEE2E2',
                                    border: '1px solid #DC2626',
                                    borderRadius: 10,
                                    padding: '10px 14px',
                                    marginTop: 12,
                                    marginBottom: 12,
                                    fontSize: 12,
                                    color: '#991B1B',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                }}
                            >
                                ⚠️ Selected dates me kuch dates already booked
                                hain
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-block btn-lg"
                            onClick={handleBooking}
                            disabled={
                                loading ||
                                showDummyModal ||
                                hasOverlapInRange()
                            }
                            style={{ marginTop: 16 }}
                        >
                            {loading
                                ? 'Processing...'
                                : hasOverlapInRange()
                                ? '❌ Dates Booked'
                                : `💳 Proceed to Payment ₹${finalAmount}`}
                        </button>
                        <p
                            style={{
                                fontSize: 11,
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                marginTop: 15,
                            }}
                        >
                            🔒 Secure & encrypted
                        </p>
                    </aside>
                </div>
            </div>

            {/* 👇 Dummy Payment Modal */}
            <DummyPaymentModal
                open={showDummyModal}
                data={dummyPaymentData}
                onClose={() => {
                    setShowDummyModal(false);
                    setDummyPaymentData(null);
                }}
            />

            <Footer />
        </>
    );
}

export default Booking;