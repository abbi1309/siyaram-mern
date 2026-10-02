const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllRead,
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getNotifications);
router.put('/read-all', protect, adminOnly, markAllRead);
router.put('/:id/read', protect, adminOnly, markAsRead);

module.exports = router;