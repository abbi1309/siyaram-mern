// ============================================
// MESSAGE MODEL
// Contact form messages
// ============================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        name:    { type: String, required: true, trim: true },
        email:   { type: String, required: true, trim: true },
        phone:   { type: String, default: '', trim: true },
        message: { type: String, required: true, trim: true },

        // Status
        isRead: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);