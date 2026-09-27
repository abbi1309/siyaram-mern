 
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, isLoggedIn, loading } = useAuth();

    if (loading) return <div className="loader" style={{ marginTop: 200 }}></div>;

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

    return children;
}

export default ProtectedRoute;