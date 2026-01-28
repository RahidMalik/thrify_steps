/**
 * Server Entry Point
 * Starts the Express server and connects to database
 */

const app = require('./app');
const connectDB = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║    🚀 Thrifty Steps Backend Server    ║
  ╠════════════════════════════════════════╣
  ║  Server running on port ${PORT}        ║
  ║  Environment: ${NODE_ENV.padEnd(16)}   ║
  ║  Health: http://localhost:${PORT}/health ║
  ╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});
