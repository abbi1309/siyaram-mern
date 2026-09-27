const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },

    // Guest details
    guestName: { type: String, required: true },
    guestPhone: { type: String, required: true },
    guestEmail: { type: String, default: '' },

    // Dates
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true },
    guests: { type: Number, default: 1 },

    // Booking status
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled'],
        default: 'Pending',
    },

    // Pricing
    amount: { type: Number, required: true },
    subtotal: { type: Number, default: 0 },
    gstRate: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // 👇 Coupon (NAYA)
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },

    // Payment
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentMethod: { type: String, default: '' },
    paymentId: { type: String, default: null },
    orderId: { type: String, default: null },
    paymentMode: {
        type: String,
        enum: ['dummy', 'razorpay', null],
        default: null,
    },
    paidAmount: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },

    // Invoice
    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceDate: { type: Date, default: null },

    // Cancellation
    cancelRequest: {
        requested: { type: Boolean, default: false },
        reason: { type: String, default: '' },
        requestedAt: { type: Date, default: null },
        status: {
            type: String,
            enum: ['none', 'pending', 'approved', 'rejected'],
            default: 'none',
        },
    },
    cancelledBy: { type: String, default: '' },

    // Check-out
    checkedOutAt: { type: Date, default: null },

    // Extra
    specialRequests: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now },
});

// Auto bookingId generate
bookingSchema.pre('save', function (next) {
    if (!this.bookingId) {
        this.bookingId = 'SYR' + Date.now().toString().slice(-8);
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);