// ============================================
// MESSAGE CONTROLLER
// ============================================

const Message = require('../models/Message');

// ============================================
// CREATE MESSAGE (Public)
// ============================================
const createMessage = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and message are required',
            });
        }

        const newMessage = await Message.create({
            name,
            email,
            phone: phone || '',
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully ✅',
            data: newMessage,
        });
    } catch (error) {
        console.error('createMessage error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// GET ALL MESSAGES (Admin only)
// ============================================
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({ isRead: false });

        res.json({
            success: true,
            count: messages.length,
            unreadCount,
            messages,
        });
    } catch (error) {
        console.error('getAllMessages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// GET UNREAD COUNT (Admin only) — for badge
// ============================================
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ isRead: false });
        res.json({ success: true, count });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// MARK AS READ (Admin only)
// ============================================
const markAsRead = async (req, res) => {
    try {
        const msg = await Message.findByIdAndUpdate(
            req.params.id,
            { isRead: true, status: 'read' },
            { new: true }
        );

        if (!msg) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.json({ success: true, message: 'Marked as read ✅', data: msg });
    } catch (error) {
        console.error('markAsRead error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// DELETE MESSAGE (Admin only)
// ============================================
const deleteMessage = async (req, res) => {
    try {
        const msg = await Message.findByIdAndDelete(req.params.id);

        if (!msg) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.json({ success: true, message: 'Message deleted ✅' });
    } catch (error) {
        console.error('deleteMessage error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createMessage,
    getAllMessages,
    getUnreadCount,
    markAsRead,
    deleteMessage,
};