import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [settings, setSettings] = useState(null);
    const [sending, setSending] = useState(false);

    // Settings load karo (Get In Touch cards ke liye)
    useEffect(() => {
        axios
            .get(`${API}/api/settings`)
            .then(({ data }) => {
                if (data.success) setSettings(data.settings);
            })
            .catch((err) => console.error('Settings load failed:', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const { data } = await axios.post(`${API}/api/messages`, form);

            if (data.success) {
                toast.success('✅ Message sent! We will contact you soon.');
                setForm({ name: '', email: '', phone: '', message: '' });
            } else {
                toast.error(data.message || 'Failed to send message');
            }
        } catch (err) {
            console.error('Send message error:', err);
            toast.error(
                err.response?.data?.message ||
                'Failed to send. Please try again.'
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Navbar />
            <div style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, #1a1a2e 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h1 style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontSize: 48, marginBottom: 15 }}>
                    Contact Us
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
                    Get in touch with us
                </p>
            </div>

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 40
                }}>
                    {/* Contact Info — DYNAMIC */}
                    <div>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            color: 'var(--navy)',
                            fontSize: 28,
                            marginBottom: 25
                        }}>Get In Touch</h2>

                        <ContactCard
                            icon="📍"
                            title="Visit Us"
                            lines={[
                                settings?.contact?.addressLine1 || 'Near Ram Mandir',
                                settings?.contact?.addressLine2 || 'Ayodhya, Uttar Pradesh - 224123',
                            ]}
                        />
                        <ContactCard
                            icon="📞"
                            title="Call Us"
                            lines={[
                                settings?.contact?.phone1 || '+91 9315377668',
                                settings?.contact?.phone2 || '+91 8400675764',
                            ]}
                        />
                        <ContactCard
                            icon="✉️"
                            title="Email Us"
                            lines={[
                                settings?.contact?.email1 || 'info@siyarampace.in',
                                settings?.contact?.email2 || 'booking@siyarampace.in',
                            ]}
                        />
                        <ContactCard
                            icon="⏰"
                            title="Reception Hours"
                            lines={[
                                settings?.contact?.receptionHours || 'Open 24/7',
                                settings?.contact?.checkInOut || 'Check-in: 12 PM | Check-out: 11 AM',
                            ]}
                        />
                    </div>

                    {/* Contact Form */}
                    <div style={{
                        background: 'white',
                        padding: 32,
                        borderRadius: 20,
                        boxShadow: '0 20px 50px rgba(10,30,63,0.08)',
                        border: '1px solid var(--border)'
                    }}>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            color: 'var(--navy)',
                            fontSize: 24,
                            marginBottom: 20
                        }}>Send a Message</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Your Name</label>
                                <input
                                    className="form-control"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg"
                                disabled={sending}
                            >
                                {sending ? '⏳ Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

function ContactCard({ icon, title, lines }) {
    return (
        <div style={{
            background: 'white',
            padding: 20,
            borderRadius: 14,
            marginBottom: 15,
            border: '1px solid var(--border)',
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start'
        }}>
            <div style={{
                fontSize: 24,
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg, #FFF8E1, #FFE5B4)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>{icon}</div>
            <div>
                <div style={{
                    fontWeight: 700,
                    color: 'var(--navy)',
                    fontSize: 15,
                    marginBottom: 5
                }}>{title}</div>
                {lines.map((line, i) => (
                    <div key={i} style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        marginBottom: 2
                    }}>{line}</div>
                ))}
            </div>
        </div>
    );
}

export default Contact;