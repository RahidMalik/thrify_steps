/**
 * Image Validation Middleware
 * Validates base64 image strings in request body
 */

/**
 * Middleware to validate base64 images
 * Ensures images array contains valid base64 data URIs
 */
const validateBase64Images = (req, res, next) => {
  try {
    // If images are provided, validate they are base64 strings
    if (req.body.images) {
      let imagesArray = [];
      
      // Handle different input formats
      if (Array.isArray(req.body.images)) {
        imagesArray = req.body.images;
      } else if (typeof req.body.images === 'string') {
        // Single image or comma-separated images
        imagesArray = req.body.images.includes(',') 
          ? req.body.images.split(',').map(i => i.trim())
          : [req.body.images.trim()];
      }

      // Validate each image is a valid base64 data URI
      const validImages = imagesArray.filter(img => {
        // Check if it's a valid base64 data URI
        return typeof img === 'string' && 
               img.startsWith('data:image/') && 
               img.includes(';base64,');
      });

      if (imagesArray.length > 0 && validImages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format. Images must be base64 data URIs (data:image/type;base64,...)'
        });
      }

      // Replace with validated images
      req.body.images = validImages.length > 0 ? validImages : imagesArray;
    }

    next();
  } catch (error) {
    console.error('Image validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating images',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  validateBase64Images
};
