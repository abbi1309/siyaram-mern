 
import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../api/chat';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Namaste 🙏 Main Siyaram Assistant hoon! Aapki kya madad kar sakta hoon?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg || loading) return;
        setMessages(p => [...p, { role: 'user', text: msg }]);
        setInput('');
        setLoading(true);
        try {
            const data = await sendMessage(msg);
            setMessages(p => [...p, { role: 'bot', text: data.reply }]);
        } catch (e) {
            setMessages(p => [...p, { role: 'bot', text: 'Network issue! 🙏' }]);
        } finally { setLoading(false); }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: 25, right: 25,
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                    color: 'var(--navy)', border: 'none', fontSize: 26,
                    cursor: 'pointer', boxShadow: '0 8px 25px rgba(212,175,55,0.5)',
                    zIndex: 9998, transition: '0.3s'
                }}
            >💬</button>

            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 100, right: 25,
                    width: 360, maxWidth: '90vw', height: 520,
                    background: 'white', borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    zIndex: 9999, display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                        color: 'white', padding: '15px 18px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 40, height: 40, background: 'var(--gold)', color: 'var(--navy)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: 'bold'
                            }}>🕉️</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>Siyaram Assistant</div>
                                <div style={{ fontSize: 11, opacity: 0.8 }}>● Online</div>
                            </div>
                        </div>
                        <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', fontSize: 24 }}>×</span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 15, background: 'var(--off-white)' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                padding: '12px 15px', borderRadius: 15,
                                marginBottom: 12, maxWidth: '85%',
                                fontSize: 13, lineHeight: 1.5,
                                background: m.role === 'user' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'white',
                                color: m.role === 'user' ? 'var(--navy)' : 'var(--text-dark)',
                                marginLeft: m.role === 'user' ? 'auto' : 0,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>{m.text}</div>
                        ))}
                        {loading && <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 12 }}>Typing...</div>}
                        <div ref={endRef} />
                    </div>

                    <div style={{ display: 'flex', padding: 12, gap: 8, borderTop: '1px solid var(--border)' }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Apna sawaal likhein..."
                            style={{ flex: 1, padding: '10px 15px', border: '2px solid var(--border)', borderRadius: 999, outline: 'none' }}
                        />
                        <button onClick={handleSend} className="btn btn-primary" style={{ padding: '10px 18px', borderRadius: 999 }}>➤</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chatbot;