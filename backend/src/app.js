/**
 * Express Application Setup
 * Main application configuration and middleware
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { FRONTEND_URL, NODE_ENV } = require('./config/env');
const { errorHandler } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const promoCodeRoutes = require('./routes/promoCode.routes');
const webhookRoutes = require('./routes/webhook.routes');

// Initialize Express app
const app = express();
app.use('/api/webhook', webhookRoutes);
// Middleware
// Increase JSON payload limit to handle base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
// app.js mein CORS setup update karein
const allowedOrigins = [
  FRONTEND_URL, // Aapka main production domain (thrifty-steps.vercel.app)
  'http://localhost:5173',
  'http://localhost:3000',
  'https://thrifty-steps-git-main-rahidmaliks-projects.vercel.app', // Yeh wala domain add kiya
];

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);

    // 2. Exact match check
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Vercel dynamic domains check (Regex)
    if (origin.includes('rahidmaliks-projects.vercel.app') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 4. Development check
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }


    console.error(`CORS blocked for: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Logging middleware (only in development)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Thrifty Steps API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/promo-codes', promoCodeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
