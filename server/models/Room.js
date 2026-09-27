 
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    roomType: { type: String, required: true, default: 'Deluxe Room' },
    floor: { type: Number, required: true },
    pricePerNight: { type: Number, required: true, default: 1500 },
    maxGuests: { type: Number, default: 2 },
    bedType: { type: String, default: 'Double Bed' },
    roomSize: { type: Number, default: 28 },
    view: { type: String, default: 'City View' },
    description: { type: String, default: 'Modern, spacious room with premium amenities.' },
    images: [{ type: String }],
    amenities: {
        ac: { type: Boolean, default: true },
        wifi: { type: Boolean, default: true },
        attachedBathroom: { type: Boolean, default: true },
        tv: { type: Boolean, default: true },
        hotWater: { type: Boolean, default: true },
        roomService: { type: Boolean, default: true },
        dailyCleaning: { type: Boolean, default: true },
        powerBackup: { type: Boolean, default: true },
        breakfast: { type: Boolean, default: false },
        parking: { type: Boolean, default: true }
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning'],
        default: 'Available'
    },
    currentBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);