import { useState, useEffect } from 'react';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { getAllReviewsAdmin, deleteReviewAdmin } from '../api/admin';
import toast from 'react-hot-toast';

function AdminReviews() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | 5 | 4 | 3 | 2 | 1

    useEffect(() => { loadReviews(); }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await getAllReviewsAdmin();
            if (data.success) setReviews(data.reviews || []);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete review by "${name}"? Ye permanent hai.`)) return;
        try {
            const data = await deleteReviewAdmin(id);
            if (data.success) {
                toast.success('✅ Review deleted');
                setReviews(reviews.filter(r => r._id !== id));
            } else {
                toast.error(data.message || 'Delete failed');
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Delete failed');
        }
    };

    const filtered = filter === 'all'
        ? reviews
        : reviews.filter(r => r.rating === parseInt(filter));

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const ratingCounts = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div style={{
                marginLeft: window.innerWidth > 900 ? 260 : 0,
                transition: 'margin 0.3s ease',
                minHeight: '100vh'
            }}>
                <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main style={{ padding: 24 }}>
                    <div style={{ marginBottom: 25 }}>
                        <h1 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 28,
                            color: '#0A1E3F',
                            margin: 0,
                            marginBottom: 6
                        }}>⭐ Reviews</h1>
                        <p style={{ color: '#6C757D', fontSize: 14, margin: 0 }}>
                            {reviews.length} reviews • Average {avgRating} ⭐
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 20,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap'
                    }}>
                        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
                            All ({reviews.length})
                        </FilterBtn>
                        {[5, 4, 3, 2, 1].map(star => (
                            <FilterBtn
                                key={star}
                                active={filter === String(star)}
                                onClick={() => setFilter(String(star))}
                            >
                                {star}⭐ ({ratingCounts[star]})
                            </FilterBtn>
                        ))}
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>Loading...</p>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: 16,
                            padding: 60,
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: 60 }}>📝</div>
                            <h3 style={{ color: '#0A1E3F', marginTop: 15 }}>No reviews</h3>
                            <p style={{ color: '#6C757D' }}>
                                {filter === 'all' ? 'Reviews will appear here' : `No ${filter}-star reviews`}
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: 16
                        }}>
                            {filtered.map(r => (
                                <div key={r._id} style={{
                                    background: 'white',
                                    borderRadius: 16,
                                    padding: 20,
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    borderLeft: `4px solid ${getRatingColor(r.rating)}`,
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#0A1E3F' }}>{r.name}</div>
                                            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{r.email}</div>
                                        </div>
                                        <div style={{ color: '#FFB400', fontSize: 14 }}>
                                            {'⭐'.repeat(r.rating)}
                                        </div>
                                    </div>

                                    <p style={{
                                        color: '#4B5563',
                                        fontStyle: 'italic',
                                        margin: '10px 0',
                                        fontSize: 13,
                                        lineHeight: 1.6
                                    }}>"{r.comment}"</p>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 15,
                                        paddingTop: 12,
                                        borderTop: '1px solid #F0F2F5'
                                    }}>
                                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                                            {new Date(r.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(r._id, r.name)}
                                            style={{
                                                padding: '6px 14px',
                                                background: '#FEE2E2',
                                                color: '#DC2626',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function FilterBtn({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '8px 16px',
                background: active ? '#0A1E3F' : '#F0F2F5',
                color: active ? 'white' : '#6C757D',
                border: 'none',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
            }}
        >
            {children}
        </button>
    );
}

function getRatingColor(rating) {
    if (rating === 5) return '#27AE60';
    if (rating === 4) return '#3498DB';
    if (rating === 3) return '#F39C12';
    if (rating === 2) return '#E67E22';
    return '#DC2626';
}

export default AdminReviews;