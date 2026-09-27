// ============================================
// COUPON ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
    applyCoupon,
    getActiveCoupons,
    getApplicableCoupons,   // 👈 ye add karo
    getAllCoupons,
    createCoupon,
    updateCoupon,
    toggleCoupon,
    deleteCoupon,
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── PUBLIC ───
// Offers page ke liye active coupons
router.get('/', getActiveCoupons);

// ─── USER ───
// Coupon apply karo
router.post('/apply', protect, applyCoupon);

// ─── ADMIN ───
router.post('/', protect, adminOnly, createCoupon);
router.get('/all', protect, adminOnly, getAllCoupons);
router.put('/:id', protect, adminOnly, updateCoupon);
router.patch('/:id/toggle', protect, adminOnly, toggleCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);
// User — booking page ke liye applicable coupons
router.post('/applicable', protect, getApplicableCoupons);

module.exports = router;