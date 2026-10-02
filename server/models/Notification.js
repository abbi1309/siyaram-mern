// ============================================
// NOTIFICATION MODEL
// Admin panel ke bell icon notifications
// Booking, message, review, cancel — sabke liye
// ============================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        // Notification ka type
        type: {
            type: String,
            enum: ['booking', 'message', 'review', 'cancel', 'other'],
            default: 'other',
        },

        // Title — jaise "New Booking"
        title: {
            type: String,
            required: true,
        },

        // Message — details
        message: {
            type: String,
            required: true,
        },

        // Click karne pe kahan jaana hai
        link: {
            type: String,
            default: '',
        },

        // Padha ya nahi
        isRead: {
            type: Boolean,
            default: false,
        },

        // Extra data (bookingId, messageId, etc.)
        metadata: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);