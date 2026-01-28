/**
 * Admin Middleware
 * Restricts routes to admin users only
 */

const { sendError } = require('../utils/response');

/**
 * Restrict route to admin users only
 * Must be used after protect middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 403, 'Access denied. Admin only.');
  }
};

module.exports = { admin };
