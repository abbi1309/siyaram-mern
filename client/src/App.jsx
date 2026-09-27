import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Amenities from './pages/Amenities';
import GalleryPage from './pages/GalleryPage';
import About from './pages/About';
import Offers from './pages/Offers';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminRooms from './pages/AdminRooms';
import StaffDashboard from './pages/StaffDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

import AdminCancelRequests from './pages/AdminCancelRequests';
import AdminUsers from './pages/AdminUsers';
import AdminReviews from './pages/AdminReviews';
import AdminGallery from './pages/AdminGallery';
import AdminSettings from './pages/AdminSettings';
import Settings from './pages/Settings';
import AdminCoupons from './pages/AdminCoupons';
import AdminMessages from './pages/AdminMessages';   // 👈 YE ADD KIYA

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking/:roomId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/rooms" element={<ProtectedRoute adminOnly><AdminRooms /></ProtectedRoute>} />
            <Route path="/admin/cancel-requests" element={<ProtectedRoute adminOnly><AdminCancelRequests /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/gallery" element={<ProtectedRoute adminOnly><AdminGallery /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute adminOnly><AdminMessages /></ProtectedRoute>} />   {/* 👈 YE ADD KIYA */}
            <Route path="/staff" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
            <Route
                path="/admin/coupons"
                element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>}
            />
        </Routes>
    );
}

export default App;