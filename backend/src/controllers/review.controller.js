/**
 * Review Controller
 * Handles product reviews and ratings
 */

const mongoose = require('mongoose');
const Review = require('../models/Review.model');
const Product = require('../models/Product.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { isValidObjectId } = require('../utils/validators');

/**
 * @route   POST /api/reviews
 * @desc    Create new review
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!productId || !rating || !comment) {
    return sendError(res, 400, 'Product ID, rating, and comment are required');
  }

  if (!isValidObjectId(productId)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ user: userId, product: productId });
  if (existingReview) {
    return sendError(res, 400, 'You have already reviewed this product');
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return sendError(res, 400, 'Rating must be between 1 and 5');
  }

  // Create review
  const review = await Review.create({
    user: userId,
    product: productId,
    rating: parseInt(rating),
    comment
  });

  await review.populate('user', 'name');
  await review.populate('product', 'title');

  sendSuccess(res, 201, 'Review created successfully', {
    review
  });
});

/**
 * @route   GET /api/reviews/:productId
 * @desc    Get all reviews for a product
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(productId)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email');

  const total = await Review.countDocuments({ product: productId });

  // Calculate average rating
  const avgRating = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  sendSuccess(res, 200, 'Reviews retrieved successfully', {
    reviews,
    averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0,
    totalReviews: total,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid review ID');
  }

  const review = await Review.findById(id);
  if (!review) {
    return sendError(res, 404, 'Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== userId) {
    return sendError(res, 403, 'Not authorized to update this review');
  }

  const updateData = {};
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5');
    }
    updateData.rating = parseInt(rating);
  }
  if (comment) updateData.comment = comment;

  const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('user', 'name').populate('product', 'title');

  sendSuccess(res, 200, 'Review updated successfully', {
    review: updatedReview
  });
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid review ID');
  }

  const review = await Review.findById(id);
  if (!review) {
    return sendError(res, 404, 'Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== userId && req.user.role !== 'admin') {
    return sendError(res, 403, 'Not authorized to delete this review');
  };

  await Review.findByIdAndDelete(id);

  sendSuccess(res, 200, 'Review deleted successfully');
});

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
};
