/**
 * MongoDB Database Connection
 */

const mongoose = require('mongoose');
const { MONGODB_URI, NODE_ENV } = require('./env');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('💡 Please create a .env file with MONGODB_URI');
      process.exit(1);
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${NODE_ENV})`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Provide helpful error messages
    if (error.message.includes('authentication')) {
      console.error(`💡 Authentication Error: Check your MongoDB credentials in MONGODB_URI`);
      console.error(`💡 Connection string format: mongodb://username:password@host:port/database`);
      console.error(`💡 Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database`);
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error(`💡 Connection Error: Make sure MongoDB is running and accessible`);
      console.error(`💡 For local MongoDB: mongodb://localhost:27017/thrifty_steps`);
      console.error(`💡 For MongoDB Atlas: Check your connection string and IP whitelist`);
    } else {
      console.error(`💡 Make sure MongoDB is running and the connection string is correct`);
    }

    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Error: ${err.message}`);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
