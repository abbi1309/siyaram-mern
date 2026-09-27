const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        category: {
            type: String,
            enum: ['Hotel', 'Rooms', 'Restaurant', 'Exterior', 'Other'],
            default: 'Hotel',
        },
        imageUrl: { type: String, required: true },
        order: { type: Number, default: 0 },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);