/**
 * Category Controller
 * Handles category CRUD operations
 */

const Category = require('../models/Category.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { isValidObjectId } = require('../utils/validators');

/**
 * @route   GET /api/categories
 * @desc    Get all active categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  sendSuccess(res, 200, 'Categories retrieved successfully', {
    categories
  });
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid category ID');
  }

  const category = await Category.findById(id);

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  sendSuccess(res, 200, 'Category retrieved successfully', {
    category
  });
});

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return sendError(res, 400, 'Category name is required');
  }

  const category = await Category.create({ name });

  sendSuccess(res, 201, 'Category created successfully', {
    category
  });
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, isActive } = req.body;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid category ID');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

  const category = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  sendSuccess(res, 200, 'Category updated successfully', {
    category
  });
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (soft delete)
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid category ID');
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  sendSuccess(res, 200, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
