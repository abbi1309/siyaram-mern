const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    forgotPassword,
    verifyOtp,
    resetPassword,
    updatePassword,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ==================== AUTH ====================
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// ==================== FORGOT PASSWORD FLOW ====================
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// ==================== PROFILE & PASSWORD (Admin/User) ====================
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);

module.exports = router;