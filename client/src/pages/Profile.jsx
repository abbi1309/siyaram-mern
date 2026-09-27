 
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

function Profile() {
    const { user } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }, [user]);

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 24px', minHeight: '60vh' }}>
                <h1 style={{ marginBottom: 30 }}>My Profile</h1>
                <div style={{ maxWidth: 600, background: 'white', padding: 30, borderRadius: 16 }}>
                    <div style={{ textAlign: 'center', marginBottom: 30 }}>
                        <div style={{ width: 100, height: 100, background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--navy)', fontWeight: 'bold' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="form-control" value={form.name} readOnly />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={form.email} readOnly />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-control" value={form.phone} readOnly />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <input className="form-control" value={user?.role || 'user'} readOnly />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Profile;