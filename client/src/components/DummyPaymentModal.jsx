import { useState } from 'react';

export default function DummyPaymentModal({ open, data, onClose }) {
    const [method, setMethod] = useState('upi');
    const [processing, setProcessing] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [bank, setBank] = useState('');

    if (!open || !data) return null;

    const { amount, bookingId, onConfirm, onCancel } = data;

    // Fake QR
    const qrData = encodeURIComponent(
        `upi://pay?pa=dummy@siyarampalace&pn=Siyaram%20Palace&am=${amount}&cu=INR&tn=Booking%20${bookingId}`
    );
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

    const banks = [
        'HDFC Bank',
        'ICICI Bank',
        'State Bank of India',
        'Axis Bank',
        'Kotak Mahindra Bank',
        'Punjab National Bank',
        'Bank of Baroda',
        'Yes Bank',
    ];

    const apps = [
        { name: 'Google Pay', emoji: '🟢' },
        { name: 'PhonePe', emoji: '🟣' },
        { name: 'Paytm', emoji: '🔵' },
        { name: 'BHIM', emoji: '🟠' },
    ];

    const handlePay = async () => {
        // Basic validation
        if (method === 'upi' && (!upiId || !upiId.includes('@'))) {
            return alert('Valid UPI ID daalo (jaise: name@upi)');
        }
        if (method === 'card') {
            if (cardNumber.replace(/\s/g, '').length < 16)
                return alert('Card number 16 digit hona chahiye');
            if (!expiry) return alert('Expiry daalo');
            if (cvv.length < 3) return alert('CVV 3 digit hona chahiye');
        }
        if (method === 'netbanking' && !bank) {
            return alert('Bank select karo');
        }

        setProcessing(true);

        // 1.5 sec processing animation
        await new Promise((r) => setTimeout(r, 1500));

        try {
            await onConfirm();
        } catch (err) {
            console.error(err);
            alert('Payment failed');
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
        onClose();
    };

    const handleAppClick = (appName) => {
        setUpiId(`${appName.toLowerCase().replace(/\s/g, '')}@upi`);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
            }}
            onClick={(e) => e.target === e.currentTarget && handleCancel()}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 440,
                    maxHeight: '92vh',
                    overflow: 'auto',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                    fontFamily: 'inherit',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0A1E3F, #1A3A6B)',
                        color: '#fff',
                        padding: '18px 22px',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>
                            Siyaram Palace
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>
                            ₹{amount}
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: 'none',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 18,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Dummy badge */}
                <div
                    style={{
                        background: '#FFF7E6',
                        color: '#B78103',
                        padding: '8px 22px',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textAlign: 'center',
                    }}
                >
                    🧪 TEST MODE — KUCH BHI PAISA NAHI KATEGA
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        borderBottom: '1px solid #eee',
                    }}
                >
                    {[
                        { id: 'upi', label: 'UPI', icon: '📱' },
                        { id: 'card', label: 'Card', icon: '💳' },
                        { id: 'netbanking', label: 'Bank', icon: '🏦' },
                        { id: 'qr', label: 'QR', icon: '🔳' },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setMethod(t.id)}
                            disabled={processing}
                            style={{
                                padding: '12px 6px',
                                background:
                                    method === t.id ? '#FFF9E6' : '#fff',
                                border: 'none',
                                borderBottom:
                                    method === t.id
                                        ? '3px solid #D4AF37'
                                        : '3px solid transparent',
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 700,
                                color:
                                    method === t.id ? '#0A1E3F' : '#666',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div style={{ padding: 22, minHeight: 260 }}>
                    {/* UPI */}
                    {method === 'upi' && (
                        <div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: '#888',
                                    marginBottom: 12,
                                }}
                            >
                                UPI app choose karo ya UPI ID daalo
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(4, 1fr)',
                                    gap: 8,
                                    marginBottom: 16,
                                }}
                            >
                                {apps.map((a) => (
                                    <button
                                        key={a.name}
                                        onClick={() => handleAppClick(a.name)}
                                        disabled={processing}
                                        style={{
                                            padding: '10px 4px',
                                            background: '#f8f8f8',
                                            border: '1px solid #eee',
                                            borderRadius: 10,
                                            cursor: 'pointer',
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        <div style={{ fontSize: 20 }}>
                                            {a.emoji}
                                        </div>
                                        {a.name}
                                    </button>
                                ))}
                            </div>

                            <label
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#333',
                                    display: 'block',
                                    marginBottom: 6,
                                }}
                            >
                                UPI ID
                            </label>
                            <input
                                type="text"
                                placeholder="yourname@upi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                disabled={processing}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '1.5px solid #ddd',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    )}

                    {/* CARD */}
                    {method === 'card' && (
                        <div>
                            <label
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#333',
                                    display: 'block',
                                    marginBottom: 6,
                                }}
                            >
                                Card Number
                            </label>
                            <input
                                type="text"
                                placeholder="4111 1111 1111 1111"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) =>
                                    setCardNumber(
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .replace(
                                                /(.{4})/g,
                                                '$1 '
                                            )
                                            .trim()
                                    )
                                }
                                disabled={processing}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '1.5px solid #ddd',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    marginBottom: 12,
                                }}
                            />

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 10,
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#333',
                                            display: 'block',
                                            marginBottom: 6,
                                        }}
                                    >
                                        Expiry
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={expiry}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(
                                                /\D/g,
                                                ''
                                            );
                                            if (v.length >= 3)
                                                v =
                                                    v.slice(0, 2) +
                                                    '/' +
                                                    v.slice(2, 4);
                                            setExpiry(v);
                                        }}
                                        disabled={processing}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            border: '1.5px solid #ddd',
                                            borderRadius: 10,
                                            fontSize: 14,
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#333',
                                            display: 'block',
                                            marginBottom: 6,
                                        }}
                                    >
                                        CVV
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="123"
                                        maxLength={4}
                                        value={cvv}
                                        onChange={(e) =>
                                            setCvv(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ''
                                                )
                                            )
                                        }
                                        disabled={processing}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            border: '1.5px solid #ddd',
                                            borderRadius: 10,
                                            fontSize: 14,
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            </div>

                            <p
                                style={{
                                    fontSize: 11,
                                    color: '#888',
                                    marginTop: 12,
                                }}
                            >
                                🧪 Test card: 4111 1111 1111 1111
                            </p>
                        </div>
                    )}

                    {/* NETBANKING */}
                    {method === 'netbanking' && (
                        <div>
                            <label
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#333',
                                    display: 'block',
                                    marginBottom: 6,
                                }}
                            >
                                Select Bank
                            </label>
                            <select
                                value={bank}
                                onChange={(e) => setBank(e.target.value)}
                                disabled={processing}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '1.5px solid #ddd',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    outline: 'none',
                                    background: '#fff',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <option value="">-- Choose your bank --</option>
                                {banks.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>

                            <p
                                style={{
                                    fontSize: 11,
                                    color: '#888',
                                    marginTop: 12,
                                }}
                            >
                                Bank login page open hoga (dummy me skip).
                            </p>
                        </div>
                    )}

                    {/* QR */}
                    {method === 'qr' && (
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={qrUrl}
                                alt="QR"
                                width={200}
                                height={200}
                                style={{ borderRadius: 12 }}
                            />
                            <p
                                style={{
                                    fontSize: 12,
                                    color: '#666',
                                    marginTop: 12,
                                }}
                            >
                                UPI app se scan karo (dummy me kuch nahi
                                hoga)
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer / Pay button */}
                <div
                    style={{
                        padding: '0 22px 22px',
                        display: 'flex',
                        gap: 10,
                    }}
                >
                    <button
                        onClick={handleCancel}
                        disabled={processing}
                        style={{
                            flex: 1,
                            padding: '13px',
                            background: '#fff',
                            color: '#333',
                            border: '1.5px solid #ddd',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: 14,
                        }}
                    >
                        Cancel
                    </button>
                    {method !== 'qr' && (
                        <button
                            onClick={handlePay}
                            disabled={processing}
                            style={{
                                flex: 2,
                                padding: '13px',
                                background: processing
                                    ? '#999'
                                    : 'linear-gradient(135deg, #D4AF37, #B8912E)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                cursor: processing
                                    ? 'not-allowed'
                                    : 'pointer',
                                fontWeight: 800,
                                fontSize: 14,
                            }}
                        >
                            {processing
                                ? '⏳ Processing...'
                                : `Pay ₹${amount}`}
                        </button>
                    )}
                </div>

                <p
                    style={{
                        fontSize: 10,
                        color: '#aaa',
                        textAlign: 'center',
                        paddingBottom: 14,
                    }}
                >
                    🔒 Powered by Siyaram Palace Payments
                </p>
            </div>
        </div>
    );
}