import { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewsCarousel from './ReviewsCarousel';

const API = import.meta.env.VITE_API_URL || '';

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const { data } = await axios.get(`${API}/api/reviews`);
            if (data.success) setReviews(data.reviews || []);
        } catch (err) {
            console.error('Reviews load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            className="section"
            style={{
                background: '#FDFBF5',
                padding: '80px 0',
            }}
        >
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 50 }}>
                    <span className="section-label">⭐ Verified Reviews</span>
                    <h2
                        className="section-title"
                        style={{ marginTop: 10, marginBottom: 10 }}
                    >
                        What Our Guests Say
                    </h2>
                    <p
                        style={{
                            fontSize: 14,
                            color: 'var(--text-muted)',
                            maxWidth: 600,
                            margin: '0 auto',
                        }}
                    >
                        Real reviews from guests who actually stayed with us
                    </p>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {!loading && reviews.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 60,
                            color: 'var(--text-muted)',
                        }}
                    >
                        <div style={{ fontSize: 64, marginBottom: 12 }}>⭐</div>
                        <p>Be the first to share your experience</p>
                        <p
                            style={{
                                fontSize: 12,
                                marginTop: 8,
                                opacity: 0.7,
                            }}
                        >
                            Review from My Bookings page after your stay
                        </p>
                    </div>
                )}

                {!loading && reviews.length > 0 && (
                    <ReviewsCarousel reviews={reviews} />
                )}
            </div>
        </section>
    );
}

export default Reviews;