const express = require('express');
const router = express.Router();
const {
    getAnalytics,
    getAllBookings,
    updateBookingStatus,
    checkIn,
    checkOut,
    getCancelRequests,
    approveCancel,
    rejectCancel,
    updateRoomStatus,
    getAllUsers,
    getAllReviews,    // ⭐ naya
    deleteReview      // ⭐ naya
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

// ==================== ANALYTICS ====================
router.get('/analytics', getAnalytics);

// ==================== BOOKINGS ====================
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/bookings/:id/check-in', checkIn);
router.post('/bookings/:id/check-out', checkOut);

// ==================== CANCEL REQUESTS ====================
router.get('/cancel-requests', getCancelRequests);
router.post('/bookings/:id/cancel-approve', approveCancel);
router.post('/bookings/:id/cancel-reject', rejectCancel);

// ==================== ROOMS ====================
router.patch('/rooms/:id', updateRoomStatus);

// ==================== USERS ====================
router.get('/users', getAllUsers);

// ==================== REVIEWS ====================
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;