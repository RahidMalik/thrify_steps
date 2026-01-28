/**
 * Promo Code Model
 * Handles discount codes and promotions
 */

const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase amount cannot be negative']
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
    min: [0, 'Max discount amount cannot be negative']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
    min: [1, 'Usage limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
promoCodeSchema.index({ code: 1, isActive: 1 });
promoCodeSchema.index({ validFrom: 1, validUntil: 1 });

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

// Method to calculate discount amount
promoCodeSchema.methods.calculateDiscount = function(subtotal) {
  if (!this.isValid()) {
    return 0;
  }

  if (subtotal < this.minPurchaseAmount) {
    return 0;
  }

  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  // Apply max discount limit if set
  if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }

  // Don't allow discount to exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to increment usage count
promoCodeSchema.methods.incrementUsage = async function() {
  this.usedCount += 1;
  await this.save();
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);
