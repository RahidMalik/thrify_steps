/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/order.controller');

// Protected routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
