/**
 * Payment Service
 * Handles Stripe payment integration
 */

const stripe = require('stripe');
const { STRIPE_SECRET_KEY } = require('../config/env');

// Initialize Stripe (only if key is provided)
let stripeClient = null;
if (STRIPE_SECRET_KEY) {
  stripeClient = stripe(STRIPE_SECRET_KEY);
  console.log('✅ Stripe configured');
} else {
  console.log('⚠️  Stripe not configured - payment features disabled');
}

/**
 * Create payment intent
 * @param {Number} amount - Amount in cents
 * @param {String} currency - Currency code (default: 'usd')
 * @param {String} description - Payment description
 * @returns {Promise<Object>} Payment intent object
 */
const createPaymentIntent = async (amount, currency = 'pkr', description = 'Thrifty Steps Order') => {
  if (!stripeClient) {
    throw new Error('Stripe is not configured.');
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount), // Already on frontend in cents
      currency: currency.toLowerCase(),
      description,
      automatic_payment_methods: { enabled: true }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
};

/**
 * Confirm payment intent
 * @param {String} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
const confirmPaymentIntent = async (paymentIntentId) => {
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe retrieve payment intent error:', error);
    throw new Error(`Failed to retrieve payment: ${error.message}`);
  }
};

/**
 * Refund payment
 * @param {String} paymentIntentId - Payment intent ID
 * @param {Number} amount - Amount to refund in dollars (optional, full refund if not provided)
 * @returns {Promise<Object>} Refund object
 */
const refundPayment = async (paymentIntentId, amount = null) => {
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  try {
    const refundData = {
      payment_intent: paymentIntentId
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripeClient.refunds.create(refundData);
    return refund;
  } catch (error) {
    console.error('Stripe refund error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

/**
 * Verify webhook signature
 * @param {String} payload - Raw request body
 * @param {String} signature - Stripe signature from headers
 * @param {String} secret - Webhook secret
 * @returns {Object} Event object
 */
const verifyWebhook = (payload, signature, secret) => {
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  try {
    const event = stripeClient.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  refundPayment,
  verifyWebhook,
  stripeClient
};
