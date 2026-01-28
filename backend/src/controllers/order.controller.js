/**
 * Order Controller
 * Handles order creation and management
 */

const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const PromoCode = require('../models/PromoCode.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { isValidObjectId } = require('../utils/validators');

/**
 * @route   POST /api/orders
 * @desc    Create new order (Status initially set to pending)
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, paymentIntentId, promoCode } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return sendError(res, 400, 'Order must contain at least one item');
  }

  if (!shippingAddress) {
    return sendError(res, 400, 'Shipping address is required');
  }

  // 1. Validate items and calculate totals
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product || !product.isActive) {
      return sendError(res, 400, `Product ${item.product} not found or inactive`);
    }

    if (product.stock < item.quantity) {
      return sendError(res, 400, `Insufficient stock for ${product.title}`);
    }

    // Validate size and color
    if (!product.sizes.includes(item.size)) {
      return sendError(res, 400, `Size ${item.size} not available for ${product.title}`);
    }

    if (!product.colors.some(c => c.toLowerCase() === item.color.toLowerCase())) {
      return sendError(res, 400, `Color ${item.color} not available for ${product.title}`);
    }

    const itemPrice = product.discountPrice || product.price;
    const itemTotal = itemPrice * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0],
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: itemPrice
    });

    // Update product stock (Immediate reduction to reserve items)
    product.stock -= item.quantity;
    await product.save();
  }

  // 2. Apply promo code if provided
  let promoCodeDiscount = 0;
  let appliedPromoCode = null;

  if (promoCode) {
    const promoCodeDoc = await PromoCode.findOne({ code: promoCode.toUpperCase() });

    if (promoCodeDoc && promoCodeDoc.isValid()) {
      const canApply = totalAmount >= promoCodeDoc.minPurchaseAmount;

      if (canApply) {
        promoCodeDiscount = promoCodeDoc.calculateDiscount(totalAmount);
        appliedPromoCode = promoCodeDoc.code;

        // Increment usage count
        await promoCodeDoc.incrementUsage();
      }
    }
  }

  // 3. Calculate final amounts
  const subtotalAfterDiscount = totalAmount - promoCodeDiscount;
  const shippingCost = 0;
  const tax = subtotalAfterDiscount * 0.1;
  const finalAmount = subtotalAfterDiscount + shippingCost + tax;

  // 4. Create order
  // SECURITY FIX: paymentStatus is 'pending' by default. 
  // It only changes to 'paid' via Stripe Webhook for security.
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'stripe',
    paymentIntentId,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    totalAmount: finalAmount,
    shippingCost,
    tax,
    promoCode: appliedPromoCode,
    promoCodeDiscount
  });

  // 5. Clear user cart
  await User.findByIdAndUpdate(userId, { cart: [] });

  await order.populate('user', 'name email');
  // items.product is already validated above, populating for response
  await order.populate('items.product', 'title brand');

  sendSuccess(res, 201, 'Order created successfully. Awaiting payment confirmation.', {
    order
  });
});

/**
 * @route   GET /api/orders/my
 * @desc    Get current user's orders
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('items.product', 'title brand images');

  const total = await Order.countDocuments({ user: userId });

  sendSuccess(res, 200, 'Orders retrieved successfully', {
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalOrders: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 */
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid order ID');
  }

  const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'title brand images description');

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  if (order.user._id.toString() !== userId && req.user.role !== 'admin') {
    return sendError(res, 403, 'Not authorized to access this order');
  }

  sendSuccess(res, 200, 'Order retrieved successfully', {
    order
  });
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid order ID');
  }

  const updateData = {};
  if (orderStatus) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return sendError(res, 400, 'Invalid order status');
    }
    updateData.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return sendError(res, 400, 'Invalid payment status');
    }
    updateData.paymentStatus = paymentStatus;
  }

  const order = await Order.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  })
    .populate('user', 'name email')
    .populate('items.product', 'title brand');

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  sendSuccess(res, 200, 'Order status updated successfully', {
    order
  });
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin only)
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    orderStatus,
    paymentStatus,
    userId
  } = req.query;

  const query = {};
  if (orderStatus) query.orderStatus = orderStatus;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (userId && isValidObjectId(userId)) query.user = userId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email')
    .populate('items.product', 'title brand images');

  const total = await Order.countDocuments(query);

  sendSuccess(res, 200, 'Orders retrieved successfully', {
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalOrders: total,
      limit: parseInt(limit)
    }
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
};