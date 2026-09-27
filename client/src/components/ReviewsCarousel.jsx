// ============================================
// REVIEWS CAROUSEL
// Flipkart/Amazon jaisa review slider
// Auto-slide, arrows, dots
// ============================================

import { useState, useEffect, useRef } from 'react';

// ============================================
// MAIN CAROUSEL COMPONENT
// ============================================
function ReviewsCarousel({ reviews = [] }) {
    // Current slide index
    const [currentIndex, setCurrentIndex] = useState(0);

    // Ek baar me kitne cards dikhein (responsive)
    const [cardsPerView, setCardsPerView] = useState(3);

    // Mouse hover pe slider pause
    const [isPaused, setIsPaused] = useState(false);

    // Auto-slide timer reference
    const timerRef = useRef(null);

    // ============================================
    // RESPONSIVE — Window size ke hisaab se cards
    // ============================================
    useEffect(() => {
        const updateCardsPerView = () => {
            const width = window.innerWidth;
            if (width < 640) setCardsPerView(1);        // Mobile: 1 card
            else if (width < 1024) setCardsPerView(2);  // Tablet: 2 cards
            else setCardsPerView(3);                     // Desktop: 3 cards
        };

        updateCardsPerView();
        window.addEventListener('resize', updateCardsPerView);
        return () => window.removeEventListener('resize', updateCardsPerView);
    }, []);

    // Max index (last possible position)
    const maxIndex = Math.max(0, reviews.length - cardsPerView);

    // ============================================
    // AUTO-SLIDE — Har 3.5 sec me aage badho
    // ============================================
    useEffect(() => {
        // Agar paused ya kam reviews, to slide nahi
        if (isPaused || reviews.length <= cardsPerView) return;

        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 3500);

        return () => clearInterval(timerRef.current);
    }, [isPaused, maxIndex, reviews.length, cardsPerView]);

    // ============================================
    // GO TO — Specific slide pe jao (loop)
    // ============================================
    const goTo = (index) => {
        if (index < 0) index = maxIndex;
        if (index > maxIndex) index = 0;
        setCurrentIndex(index);
    };

    // ============================================
    // EMPTY STATE
    // ============================================
    if (reviews.length === 0) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#999',
                }}
            >
                <div style={{ fontSize: 48 }}>⭐</div>
                <p>No reviews yet</p>
            </div>
        );
    }

    // Translation value (kitna left shift karna hai)
    const translateX = -(currentIndex * (100 / cardsPerView));

    return (
        <div
            style={{
                position: 'relative',
                padding: '0 50px',
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* ============ LEFT ARROW ============ */}
            {reviews.length > cardsPerView && (
                <button
                    onClick={() => goTo(currentIndex - 1)}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        fontSize: 24,
                        color: '#0A1E3F',
                        transition: 'all 0.2s',
                        paddingBottom: 4,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D4AF37';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform =
                            'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#0A1E3F';
                        e.currentTarget.style.transform =
                            'translateY(-50%) scale(1)';
                    }}
                    aria-label="Previous"
                >
                    ‹
                </button>
            )}

            {/* ============ SLIDER ============ */}
            <div
                style={{
                    overflow: 'hidden',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        transform: `translateX(${translateX}%)`,
                        transition:
                            'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    {reviews.map((review, i) => (
                        <div
                            key={review._id || i}
                            style={{
                                minWidth: `${100 / cardsPerView}%`,
                                padding: '0 10px',
                                boxSizing: 'border-box',
                            }}
                        >
                            <ReviewCard review={review} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ============ RIGHT ARROW ============ */}
            {reviews.length > cardsPerView && (
                <button
                    onClick={() => goTo(currentIndex + 1)}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        fontSize: 24,
                        color: '#0A1E3F',
                        transition: 'all 0.2s',
                        paddingBottom: 4,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D4AF37';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform =
                            'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#0A1E3F';
                        e.currentTarget.style.transform =
                            'translateY(-50%) scale(1)';
                    }}
                    aria-label="Next"
                >
                    ›
                </button>
            )}

            {/* ============ DOTS INDICATOR ============ */}
            {reviews.length > cardsPerView && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 24,
                    }}
                >
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            style={{
                                width: currentIndex === i ? 28 : 10,
                                height: 10,
                                borderRadius: 5,
                                border: 'none',
                                background:
                                    currentIndex === i
                                        ? 'linear-gradient(135deg, #D4AF37, #B8912E)'
                                        : '#E5E7EB',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                padding: 0,
                            }}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// REVIEW CARD — Ek single review dikhata hai
// ============================================
function ReviewCard({ review }) {
    // 5 stars me se kitne filled hain
    const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

    // Avatar ka pehla letter
    const initial = (review.name || 'U').charAt(0).toUpperCase();

    // Avatar color palette
    const colors = [
        '#D4AF37',
        '#0A1E3F',
        '#3B82F6',
        '#22C55E',
        '#A855F7',
        '#EF4444',
    ];

    // Consistent color choose karo naam ke length se
    const colorIndex = (review.name || '').length % colors.length;
    const avatarBg = colors[colorIndex];

    return (
        <div
            style={{
                background: '#fff',
                padding: 24,
                borderRadius: 16,
                border: '1px solid #F0F2F5',
                boxShadow: '0 4px 16px rgba(10,30,63,0.06)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s',
                minHeight: 280,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                    '0 12px 32px rgba(10,30,63,0.12)';
                e.currentTarget.style.borderColor = '#D4AF37';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(10,30,63,0.06)';
                e.currentTarget.style.borderColor = '#F0F2F5';
            }}
        >
            {/* Decorative quote mark */}
            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 16,
                    fontSize: 48,
                    color: '#F5F7FA',
                    fontFamily: 'Georgia, serif',
                    lineHeight: 1,
                    pointerEvents: 'none',
                }}
            >
                "
            </div>

            {/* ============ RATING STARS ============ */}
            <div
                style={{
                    display: 'flex',
                    gap: 2,
                    marginBottom: 12,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {stars.map((filled, i) => (
                    <span
                        key={i}
                        style={{
                            fontSize: 18,
                            color: filled ? '#FFB400' : '#E5E7EB',
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>

            {/* ============ COMMENT ============ */}
            <p
                style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#4B5563',
                    margin: 0,
                    marginBottom: 20,
                    flex: 1,
                    position: 'relative',
                    zIndex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                "{review.comment}"
            </p>

            {/* ============ USER INFO ============ */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: 16,
                    borderTop: '1px solid #F0F2F5',
                }}
            >
                {/* Avatar */}
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: avatarBg,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16,
                        flexShrink: 0,
                    }}
                >
                    {initial}
                </div>

                {/* Name + Date + Verified Badge */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'wrap',
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 700,
                                color: '#0A1E3F',
                                fontSize: 13,
                            }}
                        >
                            {review.name || 'Anonymous'}
                        </span>

                        {/* ✅ Verified Badge */}
                        {review.isVerified && (
                            <span
                                style={{
                                    fontSize: 10,
                                    background: '#DCFCE7',
                                    color: '#166534',
                                    padding: '2px 8px',
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    border: '1px solid #22C55E',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                ✓ Verified
                            </span>
                        )}
                    </div>

                    <div
                        style={{
                            fontSize: 11,
                            color: '#9CA3AF',
                            marginTop: 2,
                        }}
                    >
                        {new Date(review.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            }
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// EXPORT
// ============================================
export default ReviewsCarousel;