 
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Review = require('../models/Review');

const getAnalytics = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalRooms = await Room.countDocuments({ isActive: true });
        const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });

        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        const confirmedCount = await Booking.countDocuments({ status: 'Confirmed' });
        const pendingCount = await Booking.countDocuments({ status: 'Pending' });
        const cancelledCount = await Booking.countDocuments({ status: 'Cancelled' });
        const completedCount = await Booking.countDocuments({ status: 'Completed' });
        const checkedInCount = await Booking.countDocuments({ status: 'Checked-In' });

        // Revenue trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueTrend = await Booking.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Bookings by room type
        const bookingsByRoomType = await Booking.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'room',
                    foreignField: '_id',
                    as: 'roomData'
                }
            },
            { $unwind: { path: '$roomData', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$roomData.roomType', 'Unknown'] },
                    count: { $sum: 1 }
                }
            }
        ]);

        // ⭐ Bookings by status - FIXED
        const bookingsByStatus = await Booking.aggregate([
            {
                $group: {
                    _id: { $ifNull: ['$status', 'Pending'] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // ⭐ Fallback - If aggregation returns empty, build manually
        let finalBookingsByStatus = bookingsByStatus;
        if (finalBookingsByStatus.length === 0 && totalBookings > 0) {
            finalBookingsByStatus = [
                { _id: 'Pending', count: pendingCount },
                { _id: 'Confirmed', count: confirmedCount },
                { _id: 'Checked-In', count: checkedInCount },
                { _id: 'Completed', count: completedCount },
                { _id: 'Cancelled', count: cancelledCount }
            ].filter(s => s.count > 0);
        }

        // Sentiment analysis
        const sentiment = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    positive: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } },
                    neutral: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    negative: { $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] } }
                }
            }
        ]);

        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // 🔍 DEBUG LOGS
        console.log('📊 Analytics Debug:');
        console.log('  Total Bookings:', totalBookings);
        console.log('  Bookings by Status:', JSON.stringify(finalBookingsByStatus));
        console.log('  Confirmed:', confirmedCount, '| Pending:', pendingCount);

        res.json({
            success: true,
            summary: {
                totalBookings,
                totalRevenue,
                totalUsers,
                totalRooms,
                occupiedRooms,
                occupancyRate,
                confirmed: confirmedCount,
                pending: pendingCount,
                cancelled: cancelledCount,
                completed: completedCount,
                checkedIn: checkedInCount
            },
            charts: {
                revenueTrend,
                bookingsByRoomType,
                bookingsByStatus: finalBookingsByStatus,  // ⭐ Use fallback
                sentiment: sentiment[0] || { positive: 0, neutral: 0, negative: 0 }
            }
        });
    } catch (error) {
        console.error('❌ Analytics error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};



const getAllBookings = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        if (status && status !== 'all') query.status = status;
        if (search) {
            query.$or = [
                { guestName: new RegExp(search, 'i') },
                { guestPhone: new RegExp(search, 'i') },
                { bookingId: new RegExp(search, 'i') }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('room', 'roomNumber roomType')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('room');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (status === 'Cancelled' || status === 'Completed') {
            await Room.findByIdAndUpdate(booking.room._id, {
                status: 'Available',
                currentBookingId: null
            });
        }

        res.json({ success: true, message: 'Status updated', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const checkIn = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'Checked-In' },
            { new: true }
        );

        if (!booking) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, message: 'Guest checked in', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Not found' });

        booking.status = 'Completed';
        await booking.save();

        await Room.findByIdAndUpdate(booking.room, {
            status: 'Available',
            currentBookingId: null
        });

        res.json({ success: true, message: 'Guest checked out. Room is available.', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCancelRequests = async (req, res) => {
    try {
        const requests = await Booking.find({ 'cancelRequest.status': 'pending' })
            .populate('room', 'roomNumber roomType')
            .populate('user', 'name email')
            .sort({ 'cancelRequest.requestedAt': -1 });

        res.json({ success: true, count: requests.length, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const approveCancel = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Not found' });

        booking.status = 'Cancelled';
        booking.cancelledBy = 'admin';
        booking.cancelRequest.status = 'approved';
        await booking.save();

        await Room.findByIdAndUpdate(booking.room, {
            status: 'Available',
            currentBookingId: null
        });

        res.json({ success: true, message: 'Booking cancelled', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const rejectCancel = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Not found' });

        booking.cancelRequest.status = 'rejected';
        booking.cancelRequest.requested = false;
        await booking.save();

        res.json({ success: true, message: 'Cancel request rejected', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRoomStatus = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ==================== GET NOTIFICATIONS ====================
const getNotifications = async (req, res) => {
    try {
        const notifications = [];

        // 1. Pending bookings
        const pendingBookings = await Booking.find({ status: 'Pending' })
            .populate('user', 'name email')
            .populate('room', 'roomNumber roomType')
            .sort({ createdAt: -1 })
            .limit(5);

        pendingBookings.forEach(b => {
            notifications.push({
                _id: `booking-${b._id}`,
                type: 'booking',
                title: 'New booking received',
                message: `${b.user?.name || 'Guest'} ne Room ${b.room?.roomNumber || '?'} book kiya`,
                time: b.createdAt,
                link: '/admin/bookings'
            });
        });

        // 2. Cancel requests (Cancelled status wale jinki request hai)
        const cancelRequests = await Booking.find({ 
            status: 'Cancelled',
            cancelRequested: true 
        })
            .populate('user', 'name email')
            .populate('room', 'roomNumber')
            .sort({ updatedAt: -1 })
            .limit(5);

        cancelRequests.forEach(b => {
            notifications.push({
                _id: `cancel-${b._id}`,
                type: 'cancel',
                title: 'Cancel request pending',
                message: `${b.user?.name || 'Guest'} ne cancel request bheji`,
                time: b.updatedAt,
                link: '/admin/cancel-requests'
            });
        });

        // 3. Recent confirmed bookings (payment received)
        const confirmedBookings = await Booking.find({ status: 'Confirmed' })
            .populate('user', 'name')
            .populate('room', 'roomNumber')
            .sort({ updatedAt: -1 })
            .limit(5);

        confirmedBookings.forEach(b => {
            notifications.push({
                _id: `confirm-${b._id}`,
                type: 'payment',
                title: 'Payment received',
                message: `₹${b.amount} received from ${b.user?.name || 'Guest'}`,
                time: b.updatedAt,
                link: '/admin/bookings'
            });
        });

        // Sabko time ke hisaab se sort karo (latest pehle)
        notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json({
            success: true,
            count: notifications.length,
            notifications: notifications.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ==================== GET ALL REVIEWS ====================
const getAllReviews = async (req, res) => {
    try {
        const Review = require('../models/Review');
        const reviews = await Review.find({}).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== DELETE REVIEW ====================
const deleteReview = async (req, res) => {
    try {
        const Review = require('../models/Review');
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    getAnalytics,
    getAllBookings,
    updateBookingStatus,
    checkIn,
    checkOut,
    getCancelRequests,
    approveCancel,
    rejectCancel,
    updateRoomStatus,
    getAllUsers,
    getAllReviews,    // ⭐ naya
    deleteReview      // ⭐ naya
};

