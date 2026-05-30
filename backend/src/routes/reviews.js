const express = require('express');
const router = express.Router();
const { getReviews, createReview, moderateReview, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', protect, createReview);
router.get('/all', protect, adminOnly, getAllReviews);
router.put('/:id/moderate', protect, adminOnly, moderateReview);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
