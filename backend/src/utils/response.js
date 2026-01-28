/**
 * Standardized Response Utility
 * Provides consistent API response format
 */

/**
 * Send success response
 * @param {Response} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} error - Error details (optional)
 */
const sendError = (res, statusCode = 400, message = 'Error', error = null) => {
  const response = {
    success: false,
    message
  };

  // Include error details in development mode
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
