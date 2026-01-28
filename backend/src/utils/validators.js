/**
 * Custom Validation Utilities
 * Additional validation helpers
 */

/**
 * Validate MongoDB ObjectId format
 * @param {String} id - ID to validate
 * @returns {Boolean} True if valid
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid
 */
const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

/**
 * Validate price (positive number with up to 2 decimals)
 * @param {Number|String} price - Price to validate
 * @returns {Boolean} True if valid
 */
const isValidPrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(price.toString());
};

/**
 * Sanitize string input
 * @param {String} str - String to sanitize
 * @returns {String} Sanitized string
 */
const sanitizeString = (str) => {
  return String(str).trim().replace(/[<>]/g, '');
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidPrice,
  sanitizeString
};
