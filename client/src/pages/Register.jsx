 
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        const result = await register(form.name, form.email, form.phone, form.password);
        setLoading(false);
        if (result.success) navigate('/');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(10,30,63,0.95), rgba(6,20,40,0.95)), url("/images/rammandir.jpg") center/cover',
            padding: 20
        }}>
            <div style={{
                background: 'white', maxWidth: 420, width: '100%',
                padding: '40px 35px', borderRadius: 24,
                borderTop: '6px solid var(--gold)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 25 }}>
                    <div style={{ fontSize: 50 }}>🕉️</div>
                    <h1 style={{ color: 'var(--navy)', marginTop: 10, marginBottom: 5 }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Join Siyaram Palace family</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="tel" name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" name="confirm" className="form-control" value={form.confirm} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;