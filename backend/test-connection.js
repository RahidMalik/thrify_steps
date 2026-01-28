/**
 * Quick MongoDB Connection Test (Local Development)
 * Run this to verify MongoDB connection: npm run test:db
 * or: node test-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./src/config/env');

async function testConnection() {
  try {
    console.log('\n🔌 Testing MongoDB Connection (Local Development)...\n');
    
    // Mask password in connection string for display
    const displayURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`📡 URI: ${displayURI}`);
    console.log(`📍 Host: localhost:27017\n`);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`🔄 Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
    
    // Test a simple operation (optional - may require auth)
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📚 Existing Collections: ${collections.length}`);
      if (collections.length > 0) {
        console.log(`   - ${collections.map(c => c.name).join(', ')}`);
      } else {
        console.log('   - (No collections yet - this is normal for a new database)');
      }
    } catch (collectionError) {
      // Collection listing might require auth - that's okay for local testing
      console.log('   - (Skipping collection list - connection verified)');
    }
    
    await mongoose.connection.close();
    console.log('\n👋 Connection closed. Ready to start the server!');
    console.log('💡 Run: npm run dev\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed:', error.message);
    console.error('\n💡 Troubleshooting for Local Development:');
    console.error('   1. Check if Docker container is running:');
    console.error('      docker ps | grep mongodb');
    console.error('   2. Start MongoDB if not running:');
    console.error('      docker start mongodb');
    console.error('   3. Verify MongoDB is accessible:');
    console.error('      docker exec mongodb mongosh --eval "db.version()"');
    console.error('   4. Check .env file has correct MONGODB_URI');
    console.error('   5. Default local connection: mongodb://localhost:27017/thrify_kicks\n');
    process.exit(1);
  }
}

testConnection();
