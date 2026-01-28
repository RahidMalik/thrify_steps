/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, 'User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Generate token
  const token = generateToken(user._id);

  sendSuccess(res, 201, 'User registered successfully', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cart: user.cart
    }
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return sendError(res, 400, 'Please provide email and password');
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 401, 'Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return sendError(res, 401, 'Invalid credentials');
  }

  // Generate token
  const token = generateToken(user._id);

  sendSuccess(res, 200, 'Login successful', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cart: user.cart
    }
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product');

  sendSuccess(res, 200, 'User profile retrieved', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cart: user.cart
    }
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return sendError(res, 400, 'Email already in use');
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  ).select('-password');

  sendSuccess(res, 200, 'Profile updated successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * @route   POST /api/auth/cart
 * @desc    Add item to cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, size, color } = req.body;
  const user = await User.findById(req.user.id);

  // Check if item already exists in cart
  const existingItemIndex = user.cart.findIndex(
    item => item.product.toString() === productId && 
            item.size === size && 
            item.color === color
  );

  if (existingItemIndex > -1) {
    // Update quantity
    user.cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    user.cart.push({ product: productId, quantity, size, color });
  }

  await user.save();
  await user.populate('cart.product');

  sendSuccess(res, 200, 'Item added to cart', {
    cart: user.cart
  });
});

/**
 * @route   PUT /api/auth/cart/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const user = await User.findById(req.user.id);

  const itemIndex = user.cart.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) {
    return sendError(res, 404, 'Cart item not found');
  }

  if (quantity <= 0) {
    user.cart.splice(itemIndex, 1);
  } else {
    user.cart[itemIndex].quantity = quantity;
  }

  await user.save();
  await user.populate('cart.product');

  sendSuccess(res, 200, 'Cart updated', {
    cart: user.cart
  });
});

/**
 * @route   DELETE /api/auth/cart/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const user = await User.findById(req.user.id);

  user.cart = user.cart.filter(item => item._id.toString() !== itemId);
  await user.save();
  await user.populate('cart.product');

  sendSuccess(res, 200, 'Item removed from cart', {
    cart: user.cart
  });
});

/**
 * @route   GET /api/auth/cart
 * @desc    Get user cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product');

  sendSuccess(res, 200, 'Cart retrieved', {
    cart: user.cart
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart
};
