 
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--navy)', color: 'white', padding: 20
        }}>
            <h1 style={{ fontSize: 120, color: 'var(--gold)', marginBottom: 20 }}>404</h1>
            <h2 style={{ color: 'white', marginBottom: 30 }}>Page Not Found</h2>
            <Link to="/" className="btn btn-primary btn-lg">← Go Home</Link>
        </div>
    );
}

export default NotFound;