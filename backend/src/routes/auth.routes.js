/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../config/cloudinaryConfig');
const {
  register,
  login,
  getMe,
  updateProfile,
  removeAvatar,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth route
router.post('/google-login', googleLogin);

// Protected routes
router.get('/me', protect, getMe);

// Profile update route with file upload
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.delete('/profile/avatar', protect, removeAvatar);

// Cart routes
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.put('/cart/:itemId', protect, updateCartItem);
router.delete('/cart/:itemId', protect, removeFromCart);

module.exports = router;
