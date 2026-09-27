const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const {
    createBooking,
    getMyBookings,
    getBookingById,
    downloadInvoice,
    requestCancellation,
    getBookedDates,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// ---- Specific routes pehle ----
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/room/:roomId/booked-dates', protect, getBookedDates);   // 👈 YE ADD KIYA

// ---- Generic /:id routes neeche ----
router.get('/:id', protect, getBookingById);
router.get('/:id/invoice', protect, downloadInvoice);
router.post('/:id/cancel-request', protect, requestCancellation);

module.exports = router;