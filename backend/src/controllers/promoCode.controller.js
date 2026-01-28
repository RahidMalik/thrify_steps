/**
 * Promo Code Controller
 * Handles promo code CRUD operations and validation
 */

const PromoCode = require('../models/PromoCode.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { isValidObjectId } = require('../utils/validators');

/**
 * @route   POST /api/promo-codes/validate
 * @desc    Validate promo code
 * @access  Public
 */
const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code) {
    return sendError(res, 400, 'Promo code is required');
  }

  const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

  if (!promoCode) {
    return sendError(res, 404, 'Invalid promo code');
  }

  if (!promoCode.isValid()) {
    return sendError(res, 400, 'Promo code is expired or invalid');
  }

  const subtotalAmount = parseFloat(subtotal) || 0;
  const discountAmount = promoCode.calculateDiscount(subtotalAmount);

  sendSuccess(res, 200, 'Promo code is valid', {
    promoCode: {
      id: promoCode._id,
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minPurchaseAmount: promoCode.minPurchaseAmount,
      maxDiscountAmount: promoCode.maxDiscountAmount
    },
    discount: discountAmount,
    subtotal: subtotalAmount,
    finalAmount: subtotalAmount - discountAmount
  });
});

/**
 * @route   GET /api/promo-codes
 * @desc    Get all promo codes (Admin)
 * @access  Private/Admin
 */
const getAllPromoCodes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isActive } = req.query;

  const query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const promoCodes = await PromoCode.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('applicableCategories', 'name')
    .populate('applicableProducts', 'title');

  const total = await PromoCode.countDocuments(query);

  sendSuccess(res, 200, 'Promo codes retrieved successfully', {
    promoCodes,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalCodes: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @route   GET /api/promo-codes/:id
 * @desc    Get single promo code
 * @access  Private/Admin
 */
const getPromoCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid promo code ID');
  }

  const promoCode = await PromoCode.findById(id)
    .populate('applicableCategories', 'name')
    .populate('applicableProducts', 'title');

  if (!promoCode) {
    return sendError(res, 404, 'Promo code not found');
  }

  sendSuccess(res, 200, 'Promo code retrieved successfully', {
    promoCode
  });
});

/**
 * @route   POST /api/promo-codes
 * @desc    Create new promo code
 * @access  Private/Admin
 */
const createPromoCode = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    validFrom,
    validUntil,
    usageLimit,
    applicableCategories,
    applicableProducts
  } = req.body;

  // Validate required fields
  if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
    return sendError(res, 400, 'Please provide all required fields');
  }

  // Validate discount type
  if (!['percentage', 'fixed'].includes(discountType)) {
    return sendError(res, 400, 'Invalid discount type');
  }

  // Validate discount value
  if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
    return sendError(res, 400, 'Percentage discount must be between 0 and 100');
  }

  // Validate dates
  const fromDate = new Date(validFrom);
  const untilDate = new Date(validUntil);

  if (untilDate <= fromDate) {
    return sendError(res, 400, 'Valid until date must be after valid from date');
  }

  // Check if code already exists
  const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
  if (existingCode) {
    return sendError(res, 400, 'Promo code already exists');
  }

  // Handle arrays
  const categoriesArray = Array.isArray(applicableCategories) 
    ? applicableCategories 
    : (applicableCategories ? [applicableCategories] : []);
  
  const productsArray = Array.isArray(applicableProducts)
    ? applicableProducts
    : (applicableProducts ? [applicableProducts] : []);

  const promoCode = await PromoCode.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue: parseFloat(discountValue),
    minPurchaseAmount: parseFloat(minPurchaseAmount) || 0,
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
    validFrom: fromDate,
    validUntil: untilDate,
    usageLimit: usageLimit ? parseInt(usageLimit) : null,
    applicableCategories: categoriesArray,
    applicableProducts: productsArray
  });

  await promoCode.populate('applicableCategories', 'name');
  await promoCode.populate('applicableProducts', 'title');

  sendSuccess(res, 201, 'Promo code created successfully', {
    promoCode
  });
});

/**
 * @route   PUT /api/promo-codes/:id
 * @desc    Update promo code
 * @access  Private/Admin
 */
const updatePromoCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid promo code ID');
  }

  // Convert code to uppercase if provided
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
    
    // Check if new code already exists (excluding current code)
    const existingCode = await PromoCode.findOne({ 
      code: updateData.code,
      _id: { $ne: id }
    });
    if (existingCode) {
      return sendError(res, 400, 'Promo code already exists');
    }
  }

  // Handle date conversions
  if (updateData.validFrom) {
    updateData.validFrom = new Date(updateData.validFrom);
  }
  if (updateData.validUntil) {
    updateData.validUntil = new Date(updateData.validUntil);
  }

  // Handle numeric conversions
  if (updateData.discountValue) {
    updateData.discountValue = parseFloat(updateData.discountValue);
  }
  if (updateData.minPurchaseAmount !== undefined) {
    updateData.minPurchaseAmount = parseFloat(updateData.minPurchaseAmount);
  }
  if (updateData.maxDiscountAmount !== undefined) {
    updateData.maxDiscountAmount = updateData.maxDiscountAmount ? parseFloat(updateData.maxDiscountAmount) : null;
  }
  if (updateData.usageLimit !== undefined) {
    updateData.usageLimit = updateData.usageLimit ? parseInt(updateData.usageLimit) : null;
  }

  // Handle arrays
  if (updateData.applicableCategories) {
    updateData.applicableCategories = Array.isArray(updateData.applicableCategories)
      ? updateData.applicableCategories
      : [updateData.applicableCategories];
  }
  if (updateData.applicableProducts) {
    updateData.applicableProducts = Array.isArray(updateData.applicableProducts)
      ? updateData.applicableProducts
      : [updateData.applicableProducts];
  }

  const promoCode = await PromoCode.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  })
    .populate('applicableCategories', 'name')
    .populate('applicableProducts', 'title');

  if (!promoCode) {
    return sendError(res, 404, 'Promo code not found');
  }

  sendSuccess(res, 200, 'Promo code updated successfully', {
    promoCode
  });
});

/**
 * @route   DELETE /api/promo-codes/:id
 * @desc    Delete promo code (soft delete)
 * @access  Private/Admin
 */
const deletePromoCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid promo code ID');
  }

  const promoCode = await PromoCode.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!promoCode) {
    return sendError(res, 404, 'Promo code not found');
  }

  sendSuccess(res, 200, 'Promo code deleted successfully');
});

module.exports = {
  validatePromoCode,
  getAllPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode
};
