/**
 * Product Model
 * Handles shoe products with sizes, colors, images, and inventory
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function (value) {
        const price = this.getUpdate ? this.getUpdate().$set.price || this.price : this.price;
        if (!value) return true;
        if (this.price === undefined && !this.getUpdate) return true;
        return value < (this.price || (this.getUpdate && this.getUpdate().$set.price));
      },
      message: 'Discount price must be less than regular price'
    }
  },
  sizes: {
    type: [String],
    required: [true, 'At least one size is required'],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one size is required'
    }
  },
  colors: {
    type: [String],
    required: [true, 'At least one color is required'],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one color is required'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  // --- ADD THIS FIELD FOR CHECK ERROR ---
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  // ------------------------------------------------
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search and filtering
productSchema.index({ title: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });

// Calculate current price (with discount if available)
productSchema.virtual('currentPrice').get(function () {
  return this.discountPrice || this.price;
});

// Method to check if product is in stock
productSchema.methods.isInStock = function () {
  return this.stock > 0 && this.isActive;
};

module.exports = mongoose.model('Product', productSchema);