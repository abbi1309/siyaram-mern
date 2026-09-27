// ============================================
// OFFERS PAGE — DYNAMIC
// Backend API se active coupons fetch karta hai
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = import.meta.env.VITE_API_URL || '';

// Badge colors
const badgeColors = {
    gold: 'linear-gradient(135deg, #D4AF37, #B8912E)',
    green: 'linear-gradient(135deg, #27AE60, #1e8449)',
    blue: 'linear-gradient(135deg, #3498DB, #1E40AF)',
    red: 'linear-gradient(135deg, #DC2626, #991B1B)',
    purple: 'linear-gradient(135deg, #8B5CF6, #7E22CE)',
};

function Offers() {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    // ============================================
    // FETCH — Backend se active coupons
    // ============================================
    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            // Cache-buster add kiya — har baar fresh data
            const { data } = await axios.get(
                `${API}/api/coupons?t=${Date.now()}`,
                {
                    headers: {
                        'Cache-Control': 'no-cache',
                        Pragma: 'no-cache',
                    },
                }
            );
            if (data.success) setCoupons(data.coupons);
        } catch (err) {
            console.error('Coupons load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // COPY CODE
    // ============================================
    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`📋 "${code}" copied!`);
    };

    // ============================================
    // BOOK WITH COUPON — sessionStorage me save
    // ============================================
    const handleBookWithCoupon = (couponCode) => {
        sessionStorage.setItem('autoApplyCoupon', couponCode);
        navigate('/rooms');
    };

    return (
        <>
            <Navbar />

            {/* Hero */}
            <div
                style={{
                    background:
                        'linear-gradient(135deg, var(--navy) 0%, #1a1a2e 100%)',
                    padding: '80px 20px',
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                <h1
                    style={{
                        color: 'white',
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 48,
                        marginBottom: 15,
                    }}
                >
                    Special Offers
                </h1>
                <p
                    style={{
                        color: 'rgba(255,255,255,0.8)',
                        maxWidth: 600,
                        margin: '0 auto',
                        fontSize: 16,
                    }}
                >
                    Exclusive deals for our guests
                </p>
            </div>

            <div className="container" style={{ padding: '60px 24px' }}>
                {/* Loading */}
                {loading && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 80,
                        }}
                    >
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && coupons.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 80,
                            color: 'var(--text-muted)',
                        }}
                    >
                        <div style={{ fontSize: 64, marginBottom: 12 }}>🎁</div>
                        <h3>No active offers right now</h3>
                        <p style={{ fontSize: 13, marginTop: 8 }}>
                            Check back soon for new deals!
                        </p>
                    </div>
                )}

                {/* Coupons grid */}
                {!loading && coupons.length > 0 && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: 24,
                        }}
                    >
                        {coupons.map((coupon) => (
                            <CouponCard
                                key={coupon._id}
                                coupon={coupon}
                                onCopy={copyCode}
                                onBook={handleBookWithCoupon}
                                badgeColors={badgeColors}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}

// ============================================
// COUPON CARD
// ============================================
function CouponCard({ coupon, onCopy, onBook, badgeColors }) {
    const bg =
        badgeColors[coupon.badgeColor] ||
        badgeColors.gold;

    const validUntilStr = new Date(coupon.validUntil).toLocaleDateString(
        'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric' }
    );

    return (
        <div
            style={{
                background: 'white',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(10,30,63,0.06)',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow =
                    '0 20px 50px rgba(10,30,63,0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                    '0 4px 20px rgba(10,30,63,0.06)';
            }}
        >
            {/* Featured badge */}
            {coupon.isFeatured && (
                <div
                    style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        background: '#FEF3C7',
                        color: '#92400E',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 20,
                        zIndex: 2,
                    }}
                >
                    ⭐ FEATURED
                </div>
            )}

            {/* Header — badge */}
            <div
                style={{
                    padding: 24,
                    background: bg,
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        fontSize: 36,
                        fontWeight: 800,
                        fontFamily: 'Playfair Display, serif',
                        marginBottom: 8,
                        letterSpacing: '1px',
                    }}
                >
                    {coupon.badge || coupon.title}
                </div>
                {coupon.highlightText && (
                    <div
                        style={{
                            fontSize: 12,
                            opacity: 0.9,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        {coupon.highlightText}
                    </div>
                )}
            </div>

            {/* Body */}
            <div
                style={{
                    padding: 24,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <h3
                    style={{
                        fontFamily: 'Playfair Display, serif',
                        color: 'var(--navy)',
                        fontSize: 20,
                        marginBottom: 10,
                    }}
                >
                    {coupon.title}
                </h3>
                <p
                    style={{
                        color: 'var(--text-muted)',
                        fontSize: 14,
                        lineHeight: 1.6,
                        marginBottom: 20,
                    }}
                >
                    {coupon.description}
                </p>

                {/* Coupon code box */}
                <div
                    style={{
                        background: '#FFF8E1',
                        padding: '12px 16px',
                        borderRadius: 10,
                        marginBottom: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                    onClick={() => onCopy(coupon.code)}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                letterSpacing: '1px',
                            }}
                        >
                            Coupon Code
                        </div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: 'var(--navy)',
                                fontFamily: 'monospace',
                                letterSpacing: '2px',
                            }}
                        >
                            {coupon.code}
                        </div>
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            textAlign: 'right',
                        }}
                    >
                        Valid
                        <br />
                        till {validUntilStr}
                    </div>
                </div>

                {/* Book Now */}
                <button
                    onClick={() => onBook(coupon.code)}
                    style={{
                        marginTop: 'auto',
                        width: '100%',
                        padding: 12,
                        background:
                            'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                        color: 'var(--navy)',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                    }}
                >
                    Book Now →
                </button>
            </div>
        </div>
    );
}

export default Offers;