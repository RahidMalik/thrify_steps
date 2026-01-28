/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands
} = require('../controllers/product.controller');

// Public routes
router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/:id', getProduct);

// Admin routes - accept base64 images directly in request body
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
