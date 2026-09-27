// ============================================
// SETTING MODEL
// Hotel ki global settings
// ============================================

const mongoose = require('mongoose');

// Feature sub-schema — Why Choose Us features ke liye
const featureSchema = new mongoose.Schema(
    {
        icon:        { type: String, default: '✨' },
        title:       { type: String, default: '' },
        description: { type: String, default: '' },
    },
    { _id: false }
);

const settingSchema = new mongoose.Schema(
    {
        // Fixed key — sirf 1 document hoga
        key: {
            type: String,
            default: 'main',
            unique: true,
        },

        // Hotel info
        hotelName: { type: String, default: 'Siyaram Palace' },
        location: { type: String, default: 'Near Ram Mandir, Ayodhya' },
        phone: { type: String, default: '+91-9315377668' },
        email: { type: String, default: 'info@siyarampace.in' },
        priceRange: { type: String, default: '₹1500 - ₹2500 per night' },

        // Social links (optional)
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        whatsapp: { type: String, default: '' },

        // ============ WHY CHOOSE US SECTION ============
        whyChooseUs: {
            badge:    { type: String, default: 'WHY CHOOSE US' },
            title:    { type: String, default: 'Experience Divine Hospitality' },
            subtitle: { type: String, default: 'Siyaram Palace offers the perfect blend of traditional Indian hospitality and modern comfort for your spiritual journey.' },
            features: {
                type: [featureSchema],
                default: [
                    {
                        icon: '📍',
                        title: 'Prime Location',
                        description: '5 minutes walking distance from Ram Mandir',
                    },
                    {
                        icon: '💰',
                        title: 'Best Price',
                        description: 'All rooms starting at just ₹1500/night',
                    },
                    {
                        icon: '🧹',
                        title: 'Clean & Hygienic',
                        description: 'Daily housekeeping and sanitization',
                    },
                    {
                        icon: '🚐',
                        title: 'Free Shuttle',
                        description: 'Complimentary shuttle to Ram Mandir',
                    },
                ],
            },
        },

        // ============ FOOTER SECTION ============
        footer: {
            description: {
                type: String,
                default: 'Experience divine hospitality near Ram Mandir. Modern amenities with traditional values.',
            },
            copyright: {
                type: String,
                default: '© 2026 Siyaram Palace. All Rights Reserved.',
            },
        },

        // ============ CONTACT SECTION 👈 NAYA ============
        contact: {
            addressLine1:   { type: String, default: 'Near Ram Mandir' },
            addressLine2:   { type: String, default: 'Ayodhya, Uttar Pradesh - 224123' },
            phone1:         { type: String, default: '+91 9315377668' },
            phone2:         { type: String, default: '+91 8400675764' },
            email1:         { type: String, default: 'info@siyarampace.in' },
            email2:         { type: String, default: 'booking@siyarampace.in' },
            receptionHours: { type: String, default: 'Open 24/7' },
            checkInOut:     { type: String, default: 'Check-in: 12 PM | Check-out: 11 AM' },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);