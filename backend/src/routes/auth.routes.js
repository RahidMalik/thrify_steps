/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  register,
  login,
  getMe,
  updateProfile,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Cart routes
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.put('/cart/:itemId', protect, updateCartItem);
router.delete('/cart/:itemId', protect, removeFromCart);

module.exports = router;
