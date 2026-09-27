// ============================================
// ADMIN COUPONS MANAGEMENT
// Create, Edit, Toggle, Delete offers
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/admin/Sidebar';

const API = import.meta.env.VITE_API_URL || '';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        code: '',
        title: '',
        description: '',
        discountType: 'percent',
        discountValue: '',
        badge: '',
        badgeColor: 'gold',
        highlightText: 'LIMITED TIME OFFER',
        minAmount: '',
        maxDiscount: '',
        minNights: '',
        validUntil: '',
        usageLimit: '',
        perUserLimit: 1,
        isActive: true,
        isFeatured: false,
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API}/api/coupons/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) setCoupons(data.coupons);
        } catch (err) {
            toast.error('Coupons load failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            code: '',
            title: '',
            description: '',
            discountType: 'percent',
            discountValue: '',
            badge: '',
            badgeColor: 'gold',
            highlightText: 'LIMITED TIME OFFER',
            minAmount: '',
            maxDiscount: '',
            minNights: '',
            validUntil: '',
            usageLimit: '',
            perUserLimit: 1,
            isActive: true,
            isFeatured: false,
        });
        setEditing(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            if (editing) {
                await axios.put(`${API}/api/coupons/${editing}`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Coupon updated ✅');
            } else {
                await axios.post(`${API}/api/coupons`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Coupon created ✅');
            }
            setShowForm(false);
            resetForm();
            loadCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.patch(
                `${API}/api/coupons/${id}/toggle`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(data.message);
            loadCoupons();
        } catch (err) {
            toast.error('Toggle failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ye coupon delete karna hai?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/api/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Deleted');
            loadCoupons();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleEdit = (coupon) => {
        setForm({
            code: coupon.code,
            title: coupon.title,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            badge: coupon.badge || '',
            badgeColor: coupon.badgeColor || 'gold',
            highlightText: coupon.highlightText || '',
            minAmount: coupon.minAmount || '',
            maxDiscount: coupon.maxDiscount || '',
            minNights: coupon.minNights || '',
            validUntil: coupon.validUntil?.split('T')[0] || '',
            usageLimit: coupon.usageLimit || '',
            perUserLimit: coupon.perUserLimit || 1,
            isActive: coupon.isActive,
            isFeatured: coupon.isFeatured,
        });
        setEditing(coupon._id);
        setShowForm(true);
    };

    return (
        <div className="admin-page">
            <Sidebar active="coupons" />

            <div className="admin-main">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 24,
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: 32,
                                color: 'var(--navy)',
                                marginBottom: 4,
                            }}
                        >
                            🎁 Offers & Coupons
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            Create, activate, and manage offers
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        style={{
                            padding: '12px 24px',
                            background:
                                'linear-gradient(135deg, #D4AF37, #B8912E)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                        }}
                    >
                        + Create New Offer
                    </button>
                </div>

                {/* FORM */}
                {showForm && (
                    <div
                        style={{
                            background: '#fff',
                            padding: 28,
                            borderRadius: 16,
                            marginBottom: 28,
                            boxShadow: '0 4px 20px rgba(10,30,63,0.08)',
                            borderTop: '4px solid #D4AF37',
                        }}
                    >
                        <h3 style={{ marginBottom: 20, color: 'var(--navy)' }}>
                            {editing ? '✏️ Edit Offer' : '✨ Create New Offer'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>Code *</label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                code: e.target.value.toUpperCase(),
                                            })
                                        }
                                        disabled={!!editing}
                                        placeholder="WEEKEND20"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Title *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Weekend Special"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Book any Deluxe Room on weekends"
                                    rows={2}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: 16,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>Type *</label>
                                    <select
                                        value={form.discountType}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                discountType: e.target.value,
                                            })
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="percent">
                                            Percentage (%)
                                        </option>
                                        <option value="flat">
                                            Flat Amount (₹)
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Value *</label>
                                    <input
                                        type="number"
                                        value={form.discountValue}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                discountValue: e.target.value,
                                            })
                                        }
                                        placeholder="20"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Badge Text</label>
                                    <input
                                        type="text"
                                        value={form.badge}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                badge: e.target.value,
                                            })
                                        }
                                        placeholder="20% OFF"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>Badge Color</label>
                                    <select
                                        value={form.badgeColor}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                badgeColor: e.target.value,
                                            })
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="gold">🟡 Gold</option>
                                        <option value="green">🟢 Green</option>
                                        <option value="blue">🔵 Blue</option>
                                        <option value="red">🔴 Red</option>
                                        <option value="purple">🟣 Purple</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Highlight Text
                                    </label>
                                    <input
                                        type="text"
                                        value={form.highlightText}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                highlightText: e.target.value,
                                            })
                                        }
                                        placeholder="LIMITED TIME OFFER"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: 16,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>Min Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={form.minAmount}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                minAmount: e.target.value,
                                            })
                                        }
                                        placeholder="1500"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Max Discount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.maxDiscount}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                maxDiscount: e.target.value,
                                            })
                                        }
                                        placeholder="500"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Min Nights</label>
                                    <input
                                        type="number"
                                        value={form.minNights}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                minNights: e.target.value,
                                            })
                                        }
                                        placeholder="0"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>
                                        Valid Until *
                                    </label>
                                    <input
                                        type="date"
                                        value={form.validUntil}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                validUntil: e.target.value,
                                            })
                                        }
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={form.usageLimit}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                usageLimit: e.target.value,
                                            })
                                        }
                                        placeholder="1000 (empty = unlimited)"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 20,
                                    marginBottom: 20,
                                }}
                            >
                                <label style={checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                isActive: e.target.checked,
                                            })
                                        }
                                    />
                                    Active
                                </label>
                                <label style={checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                isFeatured: e.target.checked,
                                            })
                                        }
                                    />
                                    Featured
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        background: '#fff',
                                        color: 'var(--navy)',
                                        border: '1.5px solid #E5E7EB',
                                        borderRadius: 10,
                                        fontWeight: 700,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 32px',
                                        background:
                                            'linear-gradient(135deg, #D4AF37, #B8912E)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 10,
                                        fontWeight: 800,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {editing ? '💾 Update' : '✨ Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* LIST */}
                {loading && <div className="spinner"></div>}

                {!loading && coupons.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 60,
                            background: '#fff',
                            borderRadius: 16,
                        }}
                    >
                        <div style={{ fontSize: 64, marginBottom: 12 }}>🎁</div>
                        <h3>No coupons yet</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Create your first offer above
                        </p>
                    </div>
                )}

                {!loading && coupons.length > 0 && (
                    <div style={{ display: 'grid', gap: 14 }}>
                        {coupons.map((coupon) => (
                            <CouponRow
                                key={coupon._id}
                                coupon={coupon}
                                onEdit={handleEdit}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CouponRow({ coupon, onEdit, onToggle, onDelete }) {
    const statusColors = {
        active: { bg: '#DCFCE7', color: '#166534' },
        inactive: { bg: '#F3F4F6', color: '#6B7280' },
        expired: { bg: '#FEE2E2', color: '#991B1B' },
        upcoming: { bg: '#FEF3C7', color: '#92400E' },
        used_up: { bg: '#E5E7EB', color: '#374151' },
    };

    const style = statusColors[coupon.status] || statusColors.active;

    return (
        <div
            style={{
                background: '#fff',
                padding: 20,
                borderRadius: 14,
                boxShadow: '0 2px 12px rgba(10,30,63,0.05)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 16,
                alignItems: 'center',
                opacity: coupon.status === 'expired' ? 0.7 : 1,
            }}
        >
            <div>
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        marginBottom: 6,
                        flexWrap: 'wrap',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'monospace',
                            fontSize: 16,
                            fontWeight: 800,
                            color: 'var(--navy)',
                            letterSpacing: '1px',
                        }}
                    >
                        {coupon.code}
                    </span>
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: style.bg,
                            color: style.color,
                            textTransform: 'uppercase',
                        }}
                    >
                        {coupon.status}
                    </span>
                    {coupon.isFeatured && (
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 12,
                                background: '#FEF3C7',
                                color: '#92400E',
                            }}
                        >
                            ⭐ FEATURED
                        </span>
                    )}
                </div>
                <div
                    style={{
                        fontWeight: 700,
                        color: 'var(--navy)',
                        fontSize: 14,
                        marginBottom: 4,
                    }}
                >
                    {coupon.title}
                </div>
                <div
                    style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        gap: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    <span>
                        💰{' '}
                        {coupon.discountType === 'percent'
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}{' '}
                        off
                    </span>
                    <span>
                        📅 Valid till:{' '}
                        {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                    </span>
                    <span>
                        👥 Used: {coupon.usedCount}
                        {coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={() => onToggle(coupon._id)}
                    style={{
                        padding: '8px 14px',
                        background: coupon.isActive ? '#FEF3C7' : '#DCFCE7',
                        color: coupon.isActive ? '#92400E' : '#166534',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    {coupon.isActive ? '⏸️ Disable' : '▶️ Enable'}
                </button>
                <button
                    onClick={() => onEdit(coupon)}
                    style={{
                        padding: '8px 14px',
                        background: '#E0E7FF',
                        color: '#3730A3',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={() => onDelete(coupon._id)}
                    style={{
                        padding: '8px 14px',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--navy)',
    marginBottom: 6,
};

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    fontFamily: 'inherit',
};

const checkboxLabel = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--navy)',
    cursor: 'pointer',
};