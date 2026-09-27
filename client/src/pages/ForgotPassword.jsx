// ============================================
// FORGOT PASSWORD PAGE
// 4 Steps: Email → Method (Email/SMS) → OTP → New Password
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

function ForgotPassword() {
    const navigate = useNavigate();

    // Steps: 'email' | 'method' | 'otp' | 'password' | 'success'
    const [step, setStep] = useState('email');
    const [loading, setLoading] = useState(false);

    // Form data
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [method, setMethod] = useState('');   // 'email' | 'sms'
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Masked email/phone for display
    const maskEmail = (e) => {
        if (!e) return '';
        const [name, domain] = e.split('@');
        return `${name.slice(0, 2)}***@${domain}`;
    };

    // ============================================
    // STEP 1: Send OTP (email identify karo)
    // ============================================
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Email daalein');

        setLoading(true);
        try {
            const res = await axios.post(`${API}/api/auth/forgot-password`, {
                email,
            });

            if (res.data.success) {
                // User mil gaya — method choose karne do
                setPhone(res.data.phone || '');
                toast.success('Email verified! Choose delivery method');
                setStep('method');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Email verify nahi hui'
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // STEP 2: Method Chosen — OTP bhejo
    // ============================================
    const handleMethodSelect = async (selectedMethod) => {
        setMethod(selectedMethod);

        if (selectedMethod === 'sms') {
            // SMS abhi implement nahi hai
            toast.error(
                '📱 SMS service coming soon! Abhi Email use karein.'
            );
            return;
        }

        setLoading(true);
        try {
            // Backend already OTP bhej chuka hai email pe
            toast.success(`OTP bheji gayi ${maskEmail(email)} pe`);
            setStep('otp');
        } catch (err) {
            toast.error('OTP send failed');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // STEP 3: OTP Verify
    // ============================================
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            return toast.error('6 digit OTP daalein');
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API}/api/auth/verify-otp`, {
                email,
                otp,
            });

            if (res.data.success) {
                toast.success('OTP verified ✅');
                setStep('password');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Galat OTP');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // STEP 4: New Password
    // ============================================
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            return toast.error('Password kam se kam 6 character');
        }
        if (newPassword !== confirmPassword) {
            return toast.error('Dono passwords match nahi kar rahe');
        }

        setLoading(true);
        try {
            // Pehle OTP verify karke reset token lo
            const verifyRes = await axios.post(
                `${API}/api/auth/verify-otp`,
                { email, otp }
            );

            if (!verifyRes.data.success) {
                throw new Error('OTP expired, please start over');
            }

            // Reset password
            const res = await axios.post(
                `${API}/api/auth/reset-password`,
                {
                    email,
                    resetToken: verifyRes.data.resetToken,
                    newPassword,
                }
            );

            if (res.data.success) {
                toast.success('Password reset ho gaya! 🎉');
                setStep('success');
                setTimeout(() => navigate('/login'), 2500);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Password reset failed'
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <>
            <Navbar />
            <div
                className="container"
                style={{
                    padding: '60px 24px',
                    minHeight: '70vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        background: 'white',
                        padding: 40,
                        borderRadius: 20,
                        maxWidth: 460,
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(10,30,63,0.1)',
                        borderTop: '5px solid var(--gold)',
                    }}
                >
                    {/* Progress dots */}
                    {step !== 'success' && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 8,
                                marginBottom: 24,
                            }}
                        >
                            {['email', 'method', 'otp', 'password'].map(
                                (s, i) => {
                                    const stepIdx = [
                                        'email',
                                        'method',
                                        'otp',
                                        'password',
                                    ].indexOf(step);
                                    const isDone = i < stepIdx;
                                    const isActive = s === step;
                                    return (
                                        <div
                                            key={s}
                                            style={{
                                                width: isActive ? 32 : 10,
                                                height: 10,
                                                borderRadius: 5,
                                                background: isDone
                                                    ? '#22C55E'
                                                    : isActive
                                                    ? '#D4AF37'
                                                    : '#E5E7EB',
                                                transition: 'all 0.3s',
                                            }}
                                        />
                                    );
                                }
                            )}
                        </div>
                    )}

                    {/* ═══════ STEP 1: EMAIL ═══════ */}
                    {step === 'email' && (
                        <>
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginBottom: 28,
                                }}
                            >
                                <div style={{ fontSize: 48 }}>🔐</div>
                                <h2
                                    style={{
                                        fontFamily:
                                            'Playfair Display, serif',
                                        fontSize: 26,
                                        color: 'var(--navy)',
                                        marginTop: 10,
                                        marginBottom: 6,
                                    }}
                                >
                                    Forgot Password?
                                </h2>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    Apna registered email daalein
                                </p>
                            </div>

                            <form onSubmit={handleSendOtp}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block btn-lg"
                                    disabled={loading}
                                    style={{ marginTop: 10 }}
                                >
                                    {loading
                                        ? 'Verifying...'
                                        : '👉 Continue'}
                                </button>
                            </form>

                            <p
                                style={{
                                    textAlign: 'center',
                                    marginTop: 20,
                                    fontSize: 13,
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Yaad aa gaya?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: 'var(--gold-dark)',
                                        fontWeight: 700,
                                    }}
                                >
                                    Login karein
                                </Link>
                            </p>
                        </>
                    )}

                    {/* ═══════ STEP 2: METHOD SELECT ═══════ */}
                    {step === 'method' && (
                        <>
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginBottom: 28,
                                }}
                            >
                                <div style={{ fontSize: 48 }}>📬</div>
                                <h2
                                    style={{
                                        fontFamily:
                                            'Playfair Display, serif',
                                        fontSize: 24,
                                        color: 'var(--navy)',
                                        marginTop: 10,
                                        marginBottom: 6,
                                    }}
                                >
                                    OTP Kahan Bhejein?
                                </h2>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    Choose delivery method
                                </p>
                            </div>

                            {/* Email Option */}
                            <button
                                onClick={() => handleMethodSelect('email')}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: 18,
                                    background:
                                        'linear-gradient(135deg, #FFF9E6, #FFF4CC)',
                                    border: '2px solid #D4AF37',
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    marginBottom: 12,
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 32,
                                        flexShrink: 0,
                                    }}
                                >
                                    📧
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            color: 'var(--navy)',
                                            fontSize: 15,
                                            marginBottom: 4,
                                        }}
                                    >
                                        Email pe bhejein
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#92400E',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {maskEmail(email)}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: '#166534',
                                        background: '#DCFCE7',
                                        padding: '3px 10px',
                                        borderRadius: 10,
                                        flexShrink: 0,
                                    }}
                                >
                                    ✓ Ready
                                </div>
                            </button>

                            {/* SMS Option */}
                            <button
                                onClick={() => handleMethodSelect('sms')}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: 18,
                                    background: '#F9FAFB',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    marginBottom: 20,
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    opacity: 0.7,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 32,
                                        flexShrink: 0,
                                    }}
                                >
                                    📱
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            color: 'var(--navy)',
                                            fontSize: 15,
                                            marginBottom: 4,
                                        }}
                                    >
                                        SMS pe bhejein
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: 'var(--text-muted)',
                                        }}
                                    >
                                        {phone
                                            ? `••••••${phone.slice(-4)}`
                                            : 'No phone registered'}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: '#92400E',
                                        background: '#FEF3C7',
                                        padding: '3px 10px',
                                        borderRadius: 10,
                                        flexShrink: 0,
                                    }}
                                >
                                    Soon
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setStep('email');
                                    setMethod('');
                                }}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    padding: 8,
                                    fontWeight: 600,
                                }}
                            >
                                ← Change email
                            </button>
                        </>
                    )}

                    {/* ═══════ STEP 3: OTP ENTER ═══════ */}
                    {step === 'otp' && (
                        <>
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginBottom: 28,
                                }}
                            >
                                <div style={{ fontSize: 48 }}>📩</div>
                                <h2
                                    style={{
                                        fontFamily:
                                            'Playfair Display, serif',
                                        fontSize: 24,
                                        color: 'var(--navy)',
                                        marginTop: 10,
                                        marginBottom: 6,
                                    }}
                                >
                                    OTP Verification
                                </h2>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    <strong>📧 Email</strong> pe 6-digit OTP
                                    bheji gayi hai
                                </p>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--navy)',
                                        fontWeight: 700,
                                        marginTop: 6,
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {maskEmail(email)}
                                </p>
                                <p
                                    style={{
                                        fontSize: 11,
                                        color: '#DC2626',
                                        marginTop: 6,
                                    }}
                                >
                                    Spam folder bhi check karein
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Enter 6-digit OTP
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ''
                                                )
                                            )
                                        }
                                        disabled={loading}
                                        required
                                        autoFocus
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 24,
                                            letterSpacing: 8,
                                            fontWeight: 800,
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block btn-lg"
                                    disabled={loading}
                                    style={{ marginTop: 10 }}
                                >
                                    {loading
                                        ? 'Verifying...'
                                        : '✅ Verify OTP'}
                                </button>
                            </form>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: 20,
                                    fontSize: 12,
                                }}
                            >
                                <button
                                    onClick={() => {
                                        setStep('method');
                                        setOtp('');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                    }}
                                >
                                    ← Change method
                                </button>

                                <button
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--gold-dark)',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                    }}
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </>
                    )}

                    {/* ═══════ STEP 4: NEW PASSWORD ═══════ */}
                    {step === 'password' && (
                        <>
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginBottom: 28,
                                }}
                            >
                                <div style={{ fontSize: 48 }}>🔑</div>
                                <h2
                                    style={{
                                        fontFamily:
                                            'Playfair Display, serif',
                                        fontSize: 24,
                                        color: 'var(--navy)',
                                        marginTop: 10,
                                        marginBottom: 6,
                                    }}
                                >
                                    New Password
                                </h2>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    Naya password set karein
                                </p>
                            </div>

                            <form onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label className="form-label">
                                        New Password
                                    </label>
                                    <div
                                        style={{ position: 'relative' }}
                                    >
                                        <input
                                            type={
                                                showPass
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            className="form-control"
                                            placeholder="Min 6 characters"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(
                                                    e.target.value
                                                )
                                            }
                                            disabled={loading}
                                            required
                                            minLength={6}
                                            style={{
                                                paddingRight: 50,
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPass(!showPass)
                                            }
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform:
                                                    'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: 16,
                                            }}
                                        >
                                            {showPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>
                                    <input
                                        type={
                                            showPass ? 'text' : 'password'
                                        }
                                        className="form-control"
                                        placeholder="Dobara daalein"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                        required
                                        minLength={6}
                                    />
                                    {confirmPassword &&
                                        newPassword !==
                                            confirmPassword && (
                                            <div
                                                style={{
                                                    color: '#DC2626',
                                                    fontSize: 11,
                                                    marginTop: 4,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                ✕ Passwords match nahi
                                                kar rahe
                                            </div>
                                        )}
                                    {confirmPassword &&
                                        newPassword ===
                                            confirmPassword &&
                                        confirmPassword.length >= 6 && (
                                            <div
                                                style={{
                                                    color: '#22C55E',
                                                    fontSize: 11,
                                                    marginTop: 4,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                ✓ Passwords match
                                            </div>
                                        )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block btn-lg"
                                    disabled={loading}
                                    style={{ marginTop: 10 }}
                                >
                                    {loading
                                        ? 'Resetting...'
                                        : '🔐 Reset Password'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ═══════ STEP 5: SUCCESS ═══════ */}
                    {step === 'success' && (
                        <div
                            style={{ textAlign: 'center', padding: '20px 0' }}
                        >
                            <div style={{ fontSize: 64 }}>✅</div>
                            <h2
                                style={{
                                    fontFamily:
                                        'Playfair Display, serif',
                                    fontSize: 24,
                                    color: 'var(--navy)',
                                    marginTop: 16,
                                    marginBottom: 8,
                                }}
                            >
                                Password Reset Ho Gaya!
                            </h2>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: 'var(--text-muted)',
                                    marginBottom: 20,
                                }}
                            >
                                Login page pe redirect kar rahe hain...
                            </p>
                            <Link
                                to="/login"
                                className="btn btn-primary"
                            >
                                🔓 Login Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ForgotPassword;