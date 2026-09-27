 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                toast.error('You are not an admin');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'linear-gradient(135deg, var(--navy), #1a1a2e)'
        }}>
            <div style={{
                background: 'white', maxWidth: 420, width: '90%',
                padding: '40px 35px', borderRadius: 24,
                borderTop: '6px solid var(--gold)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
            }}>
                <div style={{ textAlign: 'center', fontSize: 60, marginBottom: 15 }}>🛡️</div>
                <h1 style={{ textAlign: 'center', color: 'var(--navy)', marginBottom: 10 }}>Admin Login</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 25 }}>
                    Siyaram Palace Management
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@siyarampace.in" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
                    </div>
                    {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 15 }}>{error}</div>}
                    <button type="submit" className="btn btn-primary btn-block btn-lg">🔐 Login</button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px dashed var(--border)' }}>
                    <a href="/" style={{ color: 'var(--text-muted)', fontSize: 13 }}>← Back to Home</a>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;