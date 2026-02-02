/**
 * Product Controller
 * Handles product CRUD operations and filtering with Cloudinary integration
 */

const Product = require('../models/Product.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { isValidObjectId } = require('../utils/validators');
const cloudinary = require('cloudinary').v2; // Added Cloudinary

/**
 * @route   GET /api/products
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

  if (brand) query.brand = new RegExp(brand, 'i');

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (size) query.sizes = size;
  if (color) query.colors = new RegExp(color, 'i');
  if (featured === 'true') query.isFeatured = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
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
 */
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return sendError(res, 400, 'Invalid product ID');

  const product = await Product.findById(id)
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name' }
    });

  if (!product || !product.isActive) return sendError(res, 404, 'Product not found');

  sendSuccess(res, 200, 'Product retrieved successfully', { product });
});

/**
 * @route   POST /api/products
 * @desc    Create new product using Cloudinary for images
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
    description,
    isFeatured
  } = req.body;

  // images ab req.files se aayengi (Multer middleware ki wajah se)
  const imageFiles = req.files;

  if (!title || !price || !sizes || !colors || !category || !description || !imageFiles || imageFiles.length === 0) {
    return sendError(res, 400, 'Please provide all required fields and at least one image');
  }

  // Cloudinary URLs extract karna
  const imagesArray = imageFiles.map(file => file.path);

  const sizesArray = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim());
  const colorsArray = Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim());

  const product = await Product.create({
    title,
    brand,
    price: parseFloat(price),
    discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
    sizes: sizesArray,
    colors: colorsArray,
    stock: parseInt(stock) || 0,
    category,
    images: imagesArray, // Cloudinary URLs saved here
    description,
    isFeatured: isFeatured === 'true' || isFeatured === true
  });

  await product.populate('category', 'name slug');
  sendSuccess(res, 201, 'Product created successfully', { product });
});

/**
 * @route   PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateProduct = await Product.findById(id);
  if (!updateProduct) return sendError(res, 404, 'Product not found');

  const updateData = { ...req.body };

  if (req.files && req.files.length > 0) {
    // --- PURANI IMAGES DELETE KARO ---
    if (updateProduct.images && updateProduct.images.length > 0) {
      for (const imgUrl of updateProduct.images) {
        const publicId = imgUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`thrifty_steps/${publicId}`);
      }
    }
    // Nayi images ka path set karo
    updateData.images = req.files.map(file => file.path);
  }
  if (updateData.sizes && typeof updateData.sizes === 'string') {
    updateData.sizes = updateData.sizes.split(',').map(s => s.trim());
  }
  if (updateData.colors && typeof updateData.colors === 'string') {
    updateData.colors = updateData.colors.split(',').map(c => c.trim());
  }

  if (updateData.price) updateData.price = parseFloat(updateData.price);
  if (updateData.stock) updateData.stock = parseInt(updateData.stock);
  if (updateData.isFeatured !== undefined) {
    updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('category', 'name slug');

  if (!product) return sendError(res, 404, 'Product not found');
  sendSuccess(res, 200, 'Product updated successfully', { product });
});

/**
 * @route   DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return sendError(res, 404, 'Product not found');

  // Cloudinary se images urrao
  if (product.images && product.images.length > 0) {
    for (const imgUrl of product.images) {
      // URL se ID nikalne ka tareeqa
      const publicId = imgUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`thrifty_steps/${publicId}`);
    }
  }

  await product.deleteOne(); // Database se khatam
  sendSuccess(res, 200, 'Product and Images deleted successfully');
});

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });
  sendSuccess(res, 200, 'Brands retrieved successfully', { brands: brands.sort() });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands
};