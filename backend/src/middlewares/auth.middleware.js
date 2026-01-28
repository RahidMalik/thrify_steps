/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User.model');
const { sendError } = require('../utils/response');

/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return sendError(res, 401, 'User not found');
      }

      next();
    } catch (error) {
      return sendError(res, 401, 'Invalid token');
    }
  } catch (error) {
    return sendError(res, 500, 'Server error during authentication');
  }
};

module.exports = { protect };
