const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

// Razorpay sirf tab load karo jab live mode ho
let Razorpay = null;
let razorpay = null;

if (process.env.PAYMENT_MODE === 'live') {
    Razorpay = require('razorpay');
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// ============================================
// CREATE ORDER
// ============================================
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, bookingId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        // ---------- DUMMY MODE ----------
        if (process.env.PAYMENT_MODE === 'dummy') {
            return res.json({
                success: true,
                mode: 'dummy',
                orderId: `order_dummy_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency: 'INR',
                keyId: 'rzp_test_dummy',
                qrCodeUrl: null,
            });
        }

        // ---------- LIVE MODE (Razorpay) ----------
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `booking_${bookingId}`,
            notes: { bookingId: String(bookingId) },
        });

        let qrCodeUrl = null;
        try {
            const qrCode = await razorpay.qrCode.create({
                type: 'upi_qr',
                name: `Booking #${bookingId}`,
                usage: 'single_use',
                fixed_amount: true,
                payment_amount: Math.round(amount * 100),
                description: `Siyaram Palace - Booking #${bookingId}`,
                notes: { bookingId: String(bookingId) },
            });
            qrCodeUrl = qrCode.image_url;
        } catch (qrErr) {
            console.warn('QR generation failed:', qrErr.message);
        }

        res.json({
            success: true,
            mode: 'live',
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            qrCodeUrl,
        });
    } catch (err) {
        console.error('create-order error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// VERIFY PAYMENT
// ============================================
router.post('/verify', protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId,
        } = req.body;

        // Booking nikaalo
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // ---------- DUMMY MODE ----------
        if (process.env.PAYMENT_MODE === 'dummy') {
            const fakePaymentId = `pay_dummy_${Date.now()}`;

            booking.paymentStatus = 'paid';
            booking.status = 'Confirmed';                  // 👈 Booking confirm
            booking.paymentId = fakePaymentId;
            booking.orderId = razorpay_order_id || 'dummy_order';
            booking.paymentMode = 'dummy';
            booking.paidAmount = booking.totalAmount;
            booking.paidAt = new Date();

            await booking.save();

            return res.json({
                success: true,
                mode: 'dummy',
                message: 'Payment successful & Booking Confirmed',
                paymentId: fakePaymentId,
                booking,
            });
        }

        // ---------- LIVE MODE ----------
        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }

        booking.paymentStatus = 'paid';
        booking.status = 'Confirmed';                      // 👈 Booking confirm
        booking.paymentId = razorpay_payment_id;
        booking.orderId = razorpay_order_id;
        booking.paymentMode = 'razorpay';
        booking.paidAmount = booking.totalAmount;
        booking.paidAt = new Date();

        await booking.save();

        res.json({
            success: true,
            mode: 'live',
            message: 'Payment verified & Booking Confirmed',
            paymentId: razorpay_payment_id,
            booking,
        });
    } catch (err) {
        console.error('verify error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;