 
import { useEffect } from 'react';

function Lightbox({ src, caption, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 99999,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                padding: 40
            }}
        >
            <span style={{
                position: 'absolute', top: 20, right: 30,
                fontSize: 40, color: 'white', cursor: 'pointer',
                fontWeight: 'bold'
            }}>×</span>
            <img
                src={src}
                alt={caption}
                style={{ maxWidth: '90%', maxHeight: '80%', borderRadius: 16, boxShadow: '0 20px 60px rgba(212,175,55,0.3)' }}
                onClick={(e) => e.stopPropagation()}
            />
            <p style={{ color: 'var(--gold)', fontSize: 18, marginTop: 20, fontWeight: 600 }}>{caption}</p>
        </div>
    );
}

export default Lightbox;