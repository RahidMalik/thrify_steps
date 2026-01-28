const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { STRIPE_WEBHOOK_SECRET } = require('../config/env');
const Order = require('../models/Order.model'); // Apna Order model import karein

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Payment kamyab hone par Order status update karein
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        // Database mein order ko "Paid" mark karein
        await Order.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            { paymentStatus: 'Paid', orderStatus: 'Processing' }
        );
        console.log('✅ Payment Succeeded & Order Updated!');
    }

    res.json({ received: true });
});

module.exports = router;