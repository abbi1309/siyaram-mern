import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../components/admin/Sidebar';

const API = import.meta.env.VITE_API_URL || '';

export default function AdminGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Hotel');
    const [files, setFiles] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const categories = ['Hotel', 'Rooms', 'Restaurant', 'Exterior', 'Other'];

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const { data } = await axios.get(`${API}/api/gallery`);
            if (data.success) setImages(data.images);
        } catch (err) {
            toast.error('Gallery load failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            return toast.error('Pehle image select karo');
        }

        setUploading(true);
        const token = localStorage.getItem('token');

        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append('images', f));
        formData.append('title', title);
        formData.append('category', category);

        try {
            await axios.post(`${API}/api/gallery/bulk`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(`${files.length} image(s) upload ho gayi!`);
            setFiles([]);
            setTitle('');
            e.target.reset();
            loadImages();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ye image delete karni hai?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/api/gallery/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Image deleted');
            setImages(images.filter((img) => img._id !== id));
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="admin-page">
            {/* Sidebar — desktop pe fixed, mobile pe toggle */}
            <Sidebar
                active="gallery"
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Mobile hamburger button */}
            <button
                onClick={() => setSidebarOpen(true)}
                style={{
                    position: 'fixed',
                    top: 16,
                    left: 16,
                    zIndex: 2000,
                    width: 44,
                    height: 44,
                    background: '#0A1E3F',
                    color: '#D4AF37',
                    border: '1px solid #D4AF37',
                    borderRadius: 10,
                    fontSize: 22,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
                className="mobile-menu-btn"
                title="Menu"
            >
                ☰
            </button>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                    }}
                />
            )}

            {/* ⭐ Content — admin-main class se margin-left 260px */}
            <div className="admin-main">
                <h1
                    style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 32,
                        marginBottom: 8,
                        color: 'var(--navy)',
                    }}
                >
                    Gallery Management
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
                    Yahan se images upload karo — frontend pe automatic dikhega
                </p>

                {/* Upload Form */}
                <div
                    style={{
                        background: '#fff',
                        padding: 28,
                        borderRadius: 16,
                        marginBottom: 32,
                        boxShadow: '0 4px 20px rgba(10,30,63,0.06)',
                    }}
                >
                    <h3 style={{ marginBottom: 20 }}>Upload New Images</h3>

                    <form onSubmit={handleUpload}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 16,
                                marginBottom: 16,
                            }}
                        >
                            <div>
                                <label style={labelStyle}>Title (Optional)</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Hotel Lobby"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={inputStyle}
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>
                                Select Images (max 10 at once)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setFiles(e.target.files)}
                                style={{
                                    ...inputStyle,
                                    padding: 12,
                                    cursor: 'pointer',
                                }}
                            />
                            {files.length > 0 && (
                                <div
                                    style={{
                                        marginTop: 8,
                                        fontSize: 13,
                                        color: '#22C55E',
                                        fontWeight: 600,
                                    }}
                                >
                                    ✓ {files.length} image(s) selected
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            style={{
                                padding: '12px 32px',
                                background: uploading
                                    ? '#999'
                                    : 'linear-gradient(135deg, #D4AF37, #B8912E)',
                                color: '#0A1E3F',
                                border: 'none',
                                borderRadius: 10,
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: uploading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {uploading ? '⏳ Uploading...' : '📤 Upload Images'}
                        </button>
                    </form>
                </div>

                {/* Gallery Grid */}
                <div
                    style={{
                        background: '#fff',
                        padding: 28,
                        borderRadius: 16,
                        boxShadow: '0 4px 20px rgba(10,30,63,0.06)',
                    }}
                >
                    <h3 style={{ marginBottom: 20 }}>
                        Uploaded Images ({images.length})
                    </h3>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <div className="spinner"></div>
                        </div>
                    )}

                    {!loading && images.length === 0 && (
                        <p
                            style={{
                                textAlign: 'center',
                                padding: 40,
                                color: 'var(--text-muted)',
                            }}
                        >
                            Koi image nahi hai. Upar se upload karo.
                        </p>
                    )}

                    {!loading && images.length > 0 && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {images.map((img) => (
                                <div
                                    key={img._id}
                                    style={{
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        background: '#F8F9FA',
                                    }}
                                >
                                    <img
                                        src={`${API}${img.imageUrl}`}
                                        alt={img.title}
                                        style={{
                                            width: '100%',
                                            height: 160,
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />

                                    <div style={{ padding: 12 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: 'var(--navy)',
                                                marginBottom: 4,
                                            }}
                                        >
                                            {img.title || 'Untitled'}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--text-muted)',
                                                marginBottom: 8,
                                            }}
                                        >
                                            {img.category}
                                        </div>

                                        <button
                                            onClick={() => handleDelete(img._id)}
                                            style={{
                                                width: '100%',
                                                padding: '6px 12px',
                                                background: '#FEE2E2',
                                                color: '#DC2626',
                                                border: 'none',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--navy)',
    marginBottom: 6,
};

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
};