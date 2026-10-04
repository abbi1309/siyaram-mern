import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingCalendar from '../components/BookingCalendar';
import { getRoomById } from '../api/rooms';
import { useAuth } from '../context/AuthContext';
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

    // 👇 Settings (admin WhatsApp number ke liye)
    const [settings, setSettings] = useState(null);

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
        loadSettings();

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
                    `${API}/api/bookings/room/${roomId}/booked-dates`,
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
    // ============================================
    useEffect(() => {
        if (!room || !checkIn || !checkOut) return;

        const fetchApplicable = async () => {
            setCouponsLoading(true);
            try {
                const token = localStorage.getItem('token');
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

    // 👇 Settings load karo (admin WhatsApp number ke liye)
    const loadSettings = async () => {
        try {
            const res = await axios.get(`${API}/api/settings`);
            if (res.data.success) {
                setSettings(res.data.settings);
            }
        } catch (err) {
            console.error('Settings load failed:', err);
        }
    };

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

    // 👇 DYNAMIC: room ka price use karo
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

    // ============================================
    // 👇 WHATSAPP BOOKING HANDLER
    // Popup block fix: WhatsApp pehle khule, phir DB save
    // ============================================
    const handleWhatsAppBooking = async () => {
        // 👇 Overlap check
        if (hasOverlapInRange()) {
            return toast.error(
                '❌ Ye room in dates ke liye already booked hai. Dusri dates choose karein.'
            );
        }

        if (!phone || phone.length !== 10) {
            return toast.error('Enter 10 digit phone number');
        }

        if (!checkIn || !checkOut) {
            return toast.error('Please select dates');
        }

        setLoading(true);

        try {
            // ============================================
            // STEP 1: ADMIN NUMBER NIKALO
            // ============================================
            const rawNumber =
                settings?.contact?.phone1 ||
                settings?.phone ||
                '9315377668';
            const adminNumber = rawNumber.replace(/[^0-9]/g, '');

            const formatDate = (dateStr) => {
                if (!dateStr) return 'N/A';
                const d = new Date(dateStr);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };

            // ============================================
            // STEP 2: WHATSAPP WINDOW PEHLE KHOLO
            // (Ye user click ke turant baad hona chahiye — popup block nahi hoga)
            // ============================================
            const whatsappWindow = window.open('', '_blank');

            if (!whatsappWindow) {
                toast.error('Please allow popups for this site');
                setLoading(false);
                return;
            }

            // Loading message dikhao jab tak backend save ho raha hai
            whatsappWindow.document.write(
                '<html><body style="font-family: Arial; padding: 40px; text-align: center;">' +
                '<h2 style="color: #0A1E3F;">⏳ Booking save ho rahi hai...</h2>' +
                '<p style="color: #666;">Please wait, WhatsApp shortly khul raha hai.</p>' +
                '</body></html>'
            );

            // ============================================
            // STEP 3: BACKEND ME BOOKING SAVE KARO
            // ============================================
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API}/api/bookings`,
                {
                    roomId: room._id,
                    checkIn,
                    checkOut,
                    guests: Number(guests),
                    specialRequests: specialRequests || '',
                    guestPhone: phone,
                    couponCode: appliedCoupon?.code || null,
                    discountAmount: discountAmount || 0,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.data.success) {
                whatsappWindow.close();
                throw new Error(res.data.message || 'Booking save failed');
            }

            console.log('✅ Booking saved to DB:', res.data.booking);

            // ============================================
            // STEP 4: WHATSAPP MESSAGE BANAO
            // ============================================
            const invoiceNumber = res.data.booking.invoiceNumber || 'N/A';

            const message =
                `🏨 *New Booking Request*\n` +
                `━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `🆔 *Booking ID:* ${invoiceNumber}\n\n` +
                `👤 *Name:* ${user?.name || 'N/A'}\n` +
                `📧 *Email:* ${user?.email || 'N/A'}\n` +
                `📞 *Phone:* ${phone}\n\n` +
                `🛏️ *Room:* ${room.roomType} (Room ${room.roomNumber})\n` +
                `📍 *Floor:* ${room.floor === 0 ? 'Ground Floor' : 'First Floor'}\n\n` +
                `📅 *Check-In:* ${formatDate(checkIn)}\n` +
                `📅 *Check-Out:* ${formatDate(checkOut)}\n` +
                `🌙 *Nights:* ${nights}\n` +
                `👥 *Guests:* ${guests}\n\n` +
                `💰 *Price/Night:* ₹${pricePerNight}\n` +
                (discountAmount > 0
                    ? `🎁 *Discount:* -₹${discountAmount} (${appliedCoupon?.code})\n`
                    : '') +
                `💵 *Total Amount:* ₹${finalAmount}\n\n` +
                `💬 *Special Requests:*\n${
                    specialRequests ? specialRequests : 'None'
                }\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━\n` +
                `Please confirm my booking. 🙏`;

            const encodedMessage = encodeURIComponent(message);

            // ============================================
            // STEP 5: PEHLE SE KHULI WINDOW KO WHATSAPP PE REDIRECT KARO
            // ============================================
            whatsappWindow.location.href = `https://wa.me/${adminNumber}?text=${encodedMessage}`;

            toast.success('✅ Booking bhej di gayi! WhatsApp pe confirm karein.');

            // ============================================
            // STEP 6: MY BOOKINGS PAGE PE REDIRECT
            // ============================================
            setTimeout(() => {
                navigate('/my-bookings');
            }, 2500);
        } catch (err) {
            console.error('Booking error:', err);
            toast.error(
                err.response?.data?.message ||
                err.message ||
                'Booking save nahi hui. Dobara try karein.'
            );
        } finally {
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
                    Please review your details and confirm on WhatsApp
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

                        {/* ═══ COUPON SECTION ═══ */}
                        <div
                            style={{
                                marginBottom: 16,
                                paddingBottom: 16,
                                borderBottom: '1px dashed #E5E7EB',
                            }}
                        >
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

                        {/* ═══ TOTAL WITH DISCOUNT ═══ */}
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

                        {/* 👇 Overlap warning */}
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

                        {/* 👇 WHATSAPP BOOKING BUTTON */}
                        <button
                            className="btn btn-primary btn-block btn-lg"
                            onClick={handleWhatsAppBooking}
                            disabled={loading || hasOverlapInRange()}
                            style={{
                                marginTop: 16,
                                background:
                                    'linear-gradient(135deg, #25D366, #128C7E)',
                                color: 'white',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                fontWeight: 700,
                            }}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="white"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            {hasOverlapInRange()
                                ? '❌ Dates Booked'
                                : 'Confirm Booking on WhatsApp'}
                        </button>
                        <p
                            style={{
                                fontSize: 11,
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                marginTop: 15,
                            }}
                        >
                            🔒 You will be redirected to WhatsApp to confirm
                            your booking
                        </p>
                    </aside>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default Booking;