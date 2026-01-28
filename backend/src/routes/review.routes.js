/**
 * Review Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
} = require('../controllers/review.controller');

// Public routes
router.get('/:productId', getProductReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
