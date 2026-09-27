 
// const Review = require('../models/Review');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

const getAllReviews = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment, title } = req.body;

        // 1. Booking ID required
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message:
                    'Sirf verified guests review de sakte hain. Booking ID required.',
            });
        }

        // 2. Booking exist?
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking record nahi mila',
            });
        }

        // 3. Booking user ki hai?
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Ye booking aapki nahi hai',
            });
        }

        // 4. Booking Completed hai?
        if (booking.status !== 'Completed') {
            return res.status(400).json({
                success: false,
                message: `Sirf stay complete hone ke baad review de sakte hain. Aapki booking abhi ${booking.status} status me hai.`,
            });
        }

        // 5. Pehle se review?
        const existing = await Review.findOne({ booking: bookingId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Aap already is stay ka review de chuke hain',
            });
        }

        // 6. Rating validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating 1 se 5 ke beech honi chahiye',
            });
        }

        // 7. Comment validation
        if (!comment || comment.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Comment kam se kam 10 characters ka hona chahiye',
            });
        }

        // ✅ Create
        const review = await Review.create({
            user: req.user._id,
            booking: bookingId,
            room: booking.room,
            name: req.user.name,
            email: req.user.email,
            rating,
            comment: comment.trim(),
            title: title || '',
            isVerified: true,
            isApproved: true,
        });

        res.status(201).json({
            success: true,
            message: 'Review submit ho gaya! Thank you 🎉',
            review,
        });
    } catch (err) {
        console.error('createReview error:', err);

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Aap already is booking ka review de chuke hain',
            });
        }

        res.status(400).json({ success: false, message: err.message });
    }
};

// ⚠️ module.exports me createReview add karo
module.exports = {
    createReview,
    // ... baaki existing exports
};


const getReviewStats = async (req, res) => {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        res.json({
            success: true,
            stats: stats[0] || {
                avgRating: 0, totalReviews: 0,
                fiveStars: 0, fourStars: 0, threeStars: 0,
                twoStars: 0, oneStar: 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllReviews, createReview, getReviewStats };