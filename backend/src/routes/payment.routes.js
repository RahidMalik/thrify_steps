/**
 * Payment Routes
 * Handles Stripe payment operations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const { sendSuccess, sendError } = require('../utils/response');
const { createPaymentIntent } = require('../services/payment.service');

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent for Stripe
 * @access  Private
 */
const createIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd', description } = req.body;

  if (!amount || amount <= 0) {
    return sendError(res, 400, 'Valid amount is required');
  }

  try {
    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      amount,
      currency,
      description || 'Thrify Kicks Order'
    );

    sendSuccess(res, 200, 'Payment intent created', {
      clientSecret,
      paymentIntentId
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

router.post('/create-intent', protect, createIntent);

module.exports = router;
