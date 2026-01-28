/**
 * Product Controller
 * Handles product CRUD operations and filtering
 */

const Product = require('../models/Product.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { isValidObjectId } = require('../utils/validators');

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    size,
    color,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    featured
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) {
    if (isValidObjectId(category)) {
      query.category = category;
    } else {
      const CategoryModel = require('../models/Category.model');
      const foundCategory = await CategoryModel.findOne({
        $or: [{ name: new RegExp(category, 'i') }, { slug: category }]
      });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        query.category = '000000000000000000000000';
      }
    }
  }

  if (brand) {
    query.brand = new RegExp(brand, 'i');
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (size) {
    query.sizes = size;
  }

  if (color) {
    query.colors = new RegExp(color, 'i');
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  sendSuccess(res, 200, 'Products retrieved successfully', {
    products,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  const product = await Product.findById(id)
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name'
      }
    });

  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  sendSuccess(res, 200, 'Product retrieved successfully', {
    product
  });
});

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    brand,
    price,
    discountPrice,
    sizes,
    colors,
    stock,
    category,
    images,
    description,
    isFeatured
  } = req.body;

  // Validate required fields
  if (!title || !price || !sizes || !colors || !category || !images || !description) {
    return sendError(res, 400, 'Please provide all required fields');
  }

  // Ensure sizes and colors are arrays
  const sizesArray = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : []);
  const colorsArray = Array.isArray(colors) ? colors : (typeof colors === 'string' ? colors.split(',').map(c => c.trim()) : []);

  // Handle images - must be base64 data URIs
  let imagesArray = [];
  if (Array.isArray(images)) {
    imagesArray = images.filter(img =>
      typeof img === 'string' && img.startsWith('data:image/') && img.includes(';base64,')
    );
  } else if (typeof images === 'string') {
    // If it's a single base64 string, wrap in array
    if (images.startsWith('data:image/') && images.includes(';base64,')) {
      imagesArray = [images];
    } else {
      // Try splitting by comma for multiple images
      imagesArray = images.split(',').map(i => i.trim()).filter(i =>
        i.startsWith('data:image/') && i.includes(';base64,')
      );
    }
  }

  if (imagesArray.length === 0) {
    return sendError(res, 400, 'At least one valid base64 image is required. Format: data:image/type;base64,...');
  }

  // Validate base64 image size (limit to ~5MB per image)
  for (const img of imagesArray) {
    const base64Data = img.split(',')[1] || '';
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 5) {
      return sendError(res, 400, `Image size exceeds 5MB limit. Current size: ${sizeInMB.toFixed(2)}MB`);
    }
  }

  const product = await Product.create({
    title,
    brand,
    price: parseFloat(price),
    discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
    sizes: sizesArray,
    colors: colorsArray,
    stock: parseInt(stock) || 0,
    category,
    images: imagesArray,
    description,
    isFeatured: isFeatured === 'true' || isFeatured === true
  });

  await product.populate('category', 'name slug');

  sendSuccess(res, 201, 'Product created successfully', {
    product
  });
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  const updateData = { ...req.body };

  // Handle array fields
  if (updateData.sizes && typeof updateData.sizes === 'string') {
    updateData.sizes = updateData.sizes.split(',').map(s => s.trim());
  }
  if (updateData.colors && typeof updateData.colors === 'string') {
    updateData.colors = updateData.colors.split(',').map(c => c.trim());
  }
  // Validate and process images if provided
  if (updateData.images) {
    let imagesArray = [];
    if (Array.isArray(updateData.images)) {
      imagesArray = updateData.images.filter(img =>
        typeof img === 'string' && img.startsWith('data:image/') && img.includes(';base64,')
      );
    } else if (typeof updateData.images === 'string') {
      if (updateData.images.startsWith('data:image/') && updateData.images.includes(';base64,')) {
        imagesArray = [updateData.images];
      } else {
        imagesArray = updateData.images.split(',').map(i => i.trim()).filter(i =>
          i.startsWith('data:image/') && i.includes(';base64,')
        );
      }
    }

    if (imagesArray.length > 0) {
      // Validate image sizes
      for (const img of imagesArray) {
        const base64Data = img.split(',')[1] || '';
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        if (sizeInMB > 5) {
          return sendError(res, 400, `Image size exceeds 5MB limit. Current size: ${sizeInMB.toFixed(2)}MB`);
        }
      }
      updateData.images = imagesArray;
    } else if (updateData.images !== undefined) {
      return sendError(res, 400, 'Invalid image format. Images must be base64 data URIs (data:image/type;base64,...)');
    }
  }

  // Convert numeric fields
  if (updateData.price) updateData.price = parseFloat(updateData.price);
  if (updateData.discountPrice) updateData.discountPrice = parseFloat(updateData.discountPrice);
  if (updateData.stock) updateData.stock = parseInt(updateData.stock);
  if (updateData.isFeatured !== undefined) {
    updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('category', 'name slug');

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  sendSuccess(res, 200, 'Product updated successfully', {
    product
  });
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  sendSuccess(res, 200, 'Product deleted successfully');
});

/**
 * @route   GET /api/products/brands
 * @desc    Get all unique brands
 * @access  Public
 */
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });

  sendSuccess(res, 200, 'Brands retrieved successfully', {
    brands: brands.sort()
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands
};
