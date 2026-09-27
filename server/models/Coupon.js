// ============================================
// COUPON MODEL
// Admin offers/coupons manage karta hai
// ============================================

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        // ─── BASIC INFO ───
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        title: { type: String, required: true },       // e.g., "Weekend Special"
        description: { type: String, default: '' },

        // ─── DISCOUNT ───
        discountType: {
            type: String,
            enum: ['percent', 'flat'],
            required: true,
        },
        discountValue: { type: Number, required: true },

        // ─── DISPLAY (Offers page ke liye) ───
        badge: { type: String, default: '' },          // e.g., "20% OFF", "FREE", "3+ Nights"
        badgeColor: {
            type: String,
            enum: ['gold', 'green', 'blue', 'red', 'purple'],
            default: 'gold',
        },
        highlightText: { type: String, default: '' },  // e.g., "LIMITED TIME OFFER"

        // ─── CONDITIONS ───
        minAmount: { type: Number, default: 0 },
        maxDiscount: { type: Number, default: null },
        minNights: { type: Number, default: 0 },
        applicableRoomTypes: { type: [String], default: [] },

        // ─── VALIDITY (Timeline) ───
        validFrom: { type: Date, default: Date.now },
        validUntil: { type: Date, required: true },

        // ─── USAGE ───
        usageLimit: { type: Number, default: null },    // null = unlimited
        usedCount: { type: Number, default: 0 },
        perUserLimit: { type: Number, default: 1 },
        usedBy: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                usedAt: { type: Date, default: Date.now },
            },
        ],

        // ─── STATUS ───
        isActive: { type: Boolean, default: true },     // Admin manually toggle kar sakta
        isFeatured: { type: Boolean, default: false },  // Offers page pe highlight

        // ─── DISPLAY ORDER ───
        displayOrder: { type: Number, default: 0 },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// ============================================
// VIRTUAL FIELD — Automatically expired?
// ============================================
couponSchema.virtual('isExpired').get(function () {
    return new Date() > this.validUntil;
});

// Auto-check karne ke liye method
couponSchema.methods.isValidNow = function () {
    const now = new Date();
    if (!this.isActive) return false;
    if (now < this.validFrom) return false;
    if (now > this.validUntil) return false;
    if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
    return true;
};

module.exports = mongoose.model('Coupon', couponSchema);