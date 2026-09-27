const express = require('express');
const router = express.Router();
const {
    createMessage,
    getAllMessages,
    getUnreadCount,
    markAsRead,
    deleteMessage,
} = require('../controllers/messageController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public — user message bhej sakta hai
router.post('/', createMessage);

// Admin only
router.get('/',            protect, adminOnly, getAllMessages);
router.get('/unread-count', protect, adminOnly, getUnreadCount);
router.put('/:id/read',    protect, adminOnly, markAsRead);
router.delete('/:id',      protect, adminOnly, deleteMessage);

module.exports = router;