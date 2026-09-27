 
import { Link } from 'react-router-dom';

function CTABanner() {
    return (
        <section style={{
            background: 'linear-gradient(135deg, var(--navy) 0%, #1a1a2e 100%)',
            padding: '80px 20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 700 }}>
                <h2 style={{ color: 'white', marginBottom: 12 }}>Ready to Experience Divine Comfort?</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 30, fontSize: 16 }}>
                    Book your stay now and enjoy ₹1500/night with all amenities
                </p>
                <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/rooms" className="btn btn-primary btn-lg">🏨 Book Now</Link>
                    <a href="tel:+919315377668" className="btn btn-ghost btn-lg">📞 Call: +91 9315377668</a>
                </div>
            </div>
        </section>
    );
}

export default CTABanner;