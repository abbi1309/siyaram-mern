// ============================================
// SETTING ROUTES
// Hotel settings ke routes
// ============================================

const express = require('express');
const router = express.Router();

const {
    getSettings,
    updateSettings,
} = require('../controllers/settingController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route — koi bhi settings padh sakta hai
router.get('/', getSettings);

// Admin only — settings update kar sakta hai
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;