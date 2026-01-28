/**
 * Review Model
 * Handles product reviews and ratings
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from same user for same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ product: 1, createdAt: -1 });

// Update product rating after review is saved
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Update product rating after review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.updateProductRating(doc.product);
  }
});

// Static method to calculate and update product rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(productId, {
      rating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
      numReviews: stats.length > 0 ? stats[0].numReviews : 0
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

module.exports = mongoose.model('Review', reviewSchema);
