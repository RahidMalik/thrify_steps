/**
 * Create Admin User Script
 * Creates a new admin user or updates an existing user to admin role
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const { MONGODB_URI } = require('./src/config/env');

// Default admin credentials (can be modified)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL // 'admin@thrifysteps.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD // 'Admin@12345';
const ADMIN_NAME = process.env.ADMIN_NAME // 'spectre';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: ADMIN_EMAIL });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`⚠️  User with email "${ADMIN_EMAIL}" already exists and is already an admin.`);
        console.log(`   User ID: ${existingUser._id}`);
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Role: ${existingUser.role}\n`);

        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise(resolve => {
          readline.question('Do you want to update the password? (y/n): ', resolve);
        });
        readline.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          existingUser.password = ADMIN_PASSWORD;
          await existingUser.save();
          console.log(`✅ Password updated for admin user "${ADMIN_EMAIL}"`);
        } else {
          console.log('No changes made.');
        }
      } else {
        // Update existing user to admin
        existingUser.role = 'admin';
        if (process.env.UPDATE_PASSWORD === 'true') {
          existingUser.password = ADMIN_PASSWORD;
        }
        await existingUser.save();
        console.log(`✅ Updated existing user to admin:`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Role: ${existingUser.role} (updated)`);
        console.log(`   User ID: ${existingUser._id}\n`);
      }
    } else {
      // Create new admin user
      const adminUser = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   User ID: ${adminUser._id}\n`);
    }

    console.log('📝 Login credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}\n`);
    console.log('🚀 You can now log in to the admin panel at:');
    console.log('   http://localhost:8080/login\n');

  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error(error.message);
    if (error.code === 11000) {
      console.error('\n   This email is already in use. Try updating the existing user.');
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Run the script
createAdmin();
