/**
 * Category Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
