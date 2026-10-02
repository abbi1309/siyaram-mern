// ============================================
// NOTIFICATION CONTROLLER
// Admin notifications ke saare operations
// ============================================

const Notification = require('../models/Notification');

// ============================================
// GET ALL NOTIFICATIONS
// Admin ke liye — latest 50 notifications
// ============================================
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            isRead: false,
        });

        res.json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// MARK SINGLE NOTIFICATION AS READ
// ============================================
const markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            isRead: true,
        });
        res.json({ success: true });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('markAllRead error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================
// CREATE NOTIFICATION (Internal use)
// Booking/message/review se call hoga
// ============================================
const createNotification = async (data) => {
    try {
        return await Notification.create(data);
    } catch (err) {
        console.error('createNotification failed:', err.message);
        return null;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllRead,
    createNotification,
};