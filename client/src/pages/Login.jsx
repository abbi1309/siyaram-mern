import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        
        if (result.success) {
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else if (result.user.role === 'staff') {
                navigate('/staff');
            } else {
                navigate('/');
            }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(10,30,63,0.95), rgba(6,20,40,0.95)), url("/images/rammandir.jpg") center/cover',
            padding: 20
        }}>
            <div style={{
                background: 'white',
                maxWidth: 420,
                width: '100%',
                padding: '40px 35px',
                borderRadius: 24,
                borderTop: '6px solid var(--gold)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 25 }}>
                    <div style={{ fontSize: 50 }}>🕉️</div>
                    <h1 style={{
                        color: 'var(--navy)',
                        marginTop: 10,
                        marginBottom: 5,
                        fontFamily: 'Playfair Display, serif'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        Login to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="on">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                                autoComplete="current-password"
                                required
                                style={{ paddingRight: 45 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 18,
                                    color: 'var(--text-muted)'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 20 }}>
                        <Link
                            to="/forgot-password"
                            style={{
                                fontSize: 13,
                                color: 'var(--gold-dark)',
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
                        Sign Up
                    </Link>
                </p>

                <div style={{
                    textAlign: 'center',
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: '1px dashed var(--border)'
                }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;