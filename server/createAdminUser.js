require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdminUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_market_intelligence';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@example.com');
      await mongoose.disconnect();
      return;
    }

    const passwordHash = await bcrypt.hash('AdminPassword123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '1234567890',
      passwordHash,
      role: 'ADMIN',
      location: 'Platform Admin',
    });

    console.log('✓ Admin user created successfully');
    console.log(`  Email: admin@example.com`);
    console.log(`  Password: AdminPassword123`);
    console.log(`  Role: ADMIN`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
