/**
 * Admin Controller
 * Handles admin dashboard and statistics
 */

const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Category = require('../models/Category.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private/Admin
 */
const getStats = asyncHandler(async (req, res) => {
  // Total counts
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalCategories = await Category.countDocuments({ isActive: true });
  const totalOrders = await Order.countDocuments();

  // Revenue calculations
  const revenueStats = await Order.aggregate([
    {
      $match: { paymentStatus: 'paid' }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .select('totalAmount orderStatus paymentStatus createdAt');

  // Low stock products
  const lowStockProducts = await Product.find({
    isActive: true,
    stock: { $lte: 10 }
  })
    .select('title brand stock')
    .limit(10);

  const stats = {
    overview: {
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders
    },
    revenue: {
      total: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
      averageOrderValue: revenueStats.length > 0 ? revenueStats[0].averageOrderValue : 0
    },
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    revenueByMonth,
    recentOrders,
    lowStockProducts
  };

  sendSuccess(res, 200, 'Statistics retrieved successfully', {
    stats
  });
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;

  const query = {};
  if (role) query.role = role;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  sendSuccess(res, 200, 'Users retrieved successfully', {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalUsers: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'customer'].includes(role)) {
    return sendError(res, 400, 'Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'User role updated successfully', {
    user
  });
});

module.exports = {
  getStats,
  getAllUsers,
  updateUserRole
};
