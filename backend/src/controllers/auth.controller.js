/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found with this email." });
    }

    // 1. Token generate karein (Random string)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Token ko hash karke DB mein save karein (1 hour expiry)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save({ validateBeforeSave: false });

    // 3. Nodemailer Transport Setup
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 4. Email Design
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Thrifty Steps Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request - Thrifty Steps',
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 40px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
      <div style="background-color: #000000; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">THRIFTY STEPS</h1>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">Reset Your Password</h2>
        <p style="color: #555555; line-height: 1.6; font-size: 16px;">
          We received a request to reset the password for your account. No changes have been made yet.
        </p>
        <p style="color: #555555; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
          You can reset your password by clicking the button below:
        </p>
        <div style="text-align: center;">
          <a href="${resetUrl}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; transition: background-color 0.3s ease;">
            Reset Password
          </a>
        </div>
        <p style="color: #888888; line-height: 1.6; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; pt: 20px;">
          <strong>Note:</strong> This link will expire in 1 hour for security reasons. 
          <br><br>
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
          &copy; 2026 Thrifty Steps Inc. All rights reserved.
        </p>
      </div>
    </div>
  `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email is sent successfully!" });

  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ message: "Error sending email." });
  }
};

const resetPassword = async (req, res) => {
  try {
    // hash the token from params
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Check expiry
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful!" });

  } catch (error) {
    res.status(500).json({ message: "Server error during reset." });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  forgotPassword,
  resetPassword
};
