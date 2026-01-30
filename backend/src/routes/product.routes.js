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
const upload = require('../config/cloudinaryConfig');

// Public routes
router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/:id', getProduct);

// Admin routes - Add product management
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
