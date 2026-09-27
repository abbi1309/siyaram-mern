 
const express = require('express');
const router = express.Router();
const { getAllReviews, createReview, getReviewStats } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllReviews);
router.get('/stats', getReviewStats);
router.post('/', protect, createReview);

module.exports = router;