require('dotenv').config();

const mongoose = require('mongoose');
const MarketData = require('./models/MarketData');
const User = require('./models/User');
const ProductListing = require('./models/ProductListing');
const PurchaseRequest = require('./models/PurchaseRequest');

const sampleMarketData = [
  { product: 'Tomato', category: 'Vegetable', price: 24, quantity: 100, unit: 'kg', demand: 180, location: 'Udupi', date: '2026-09-01' },
  { product: 'Tomato', category: 'Vegetable', price: 26, quantity: 120, unit: 'kg', demand: 200, location: 'Udupi', date: '2026-09-02' },
  { product: 'Tomato', category: 'Vegetable', price: 28, quantity: 100, unit: 'kg', demand: 220, location: 'Udupi', date: '2026-09-03' },
  { product: 'Tomato', category: 'Vegetable', price: 30, quantity: 90, unit: 'kg', demand: 240, location: 'Udupi', date: '2026-09-04' },
  { product: 'Tomato', category: 'Vegetable', price: 32, quantity: 80, unit: 'kg', demand: 260, location: 'Udupi', date: '2026-09-05' },
  { product: 'Tomato', category: 'Vegetable', price: 33, quantity: 75, unit: 'kg', demand: 270, location: 'Udupi', date: '2026-09-06' },
  { product: 'Tomato', category: 'Vegetable', price: 35, quantity: 70, unit: 'kg', demand: 280, location: 'Udupi', date: '2026-09-07' },
  { product: 'Tomato', category: 'Vegetable', price: 22, quantity: 110, unit: 'kg', demand: 150, location: 'Kundapura', date: '2026-09-01' },
  { product: 'Tomato', category: 'Vegetable', price: 23, quantity: 100, unit: 'kg', demand: 160, location: 'Kundapura', date: '2026-09-03' },
  { product: 'Tomato', category: 'Vegetable', price: 25, quantity: 95, unit: 'kg', demand: 170, location: 'Kundapura', date: '2026-09-05' },
  { product: 'Tomato', category: 'Vegetable', price: 27, quantity: 90, unit: 'kg', demand: 180, location: 'Kundapura', date: '2026-09-07' },
  { product: 'Rice', category: 'Grain', price: 45, quantity: 200, unit: 'kg', demand: 350, location: 'Mangalore', date: '2026-09-01' },
  { product: 'Rice', category: 'Grain', price: 46, quantity: 180, unit: 'kg', demand: 360, location: 'Mangalore', date: '2026-09-02' },
  { product: 'Rice', category: 'Grain', price: 45, quantity: 190, unit: 'kg', demand: 340, location: 'Mangalore', date: '2026-09-03' },
  { product: 'Rice', category: 'Grain', price: 47, quantity: 170, unit: 'kg', demand: 370, location: 'Mangalore', date: '2026-09-04' },
  { product: 'Rice', category: 'Grain', price: 46, quantity: 160, unit: 'kg', demand: 380, location: 'Mangalore', date: '2026-09-05' },
  { product: 'Rice', category: 'Grain', price: 48, quantity: 150, unit: 'kg', demand: 390, location: 'Mangalore', date: '2026-09-07' },
  { product: 'Rice', category: 'Grain', price: 44, quantity: 220, unit: 'kg', demand: 300, location: 'Udupi', date: '2026-09-02' },
  { product: 'Rice', category: 'Grain', price: 45, quantity: 210, unit: 'kg', demand: 320, location: 'Udupi', date: '2026-09-04' },
  { product: 'Rice', category: 'Grain', price: 46, quantity: 200, unit: 'kg', demand: 330, location: 'Udupi', date: '2026-09-06' },
  { product: 'Onion', category: 'Vegetable', price: 40, quantity: 150, unit: 'kg', demand: 140, location: 'Karkala', date: '2026-09-01' },
  { product: 'Onion', category: 'Vegetable', price: 38, quantity: 160, unit: 'kg', demand: 145, location: 'Karkala', date: '2026-09-02' },
  { product: 'Onion', category: 'Vegetable', price: 36, quantity: 170, unit: 'kg', demand: 150, location: 'Karkala', date: '2026-09-03' },
  { product: 'Onion', category: 'Vegetable', price: 34, quantity: 180, unit: 'kg', demand: 155, location: 'Karkala', date: '2026-09-04' },
  { product: 'Onion', category: 'Vegetable', price: 32, quantity: 190, unit: 'kg', demand: 160, location: 'Karkala', date: '2026-09-05' },
  { product: 'Onion', category: 'Vegetable', price: 30, quantity: 200, unit: 'kg', demand: 165, location: 'Karkala', date: '2026-09-07' },
  { product: 'Onion', category: 'Vegetable', price: 35, quantity: 140, unit: 'kg', demand: 130, location: 'Kundapura', date: '2026-09-03' },
  { product: 'Onion', category: 'Vegetable', price: 33, quantity: 150, unit: 'kg', demand: 135, location: 'Kundapura', date: '2026-09-06' },
  { product: 'Potato', category: 'Vegetable', price: 20, quantity: 250, unit: 'kg', demand: 220, location: 'Udupi', date: '2026-09-01' },
  { product: 'Potato', category: 'Vegetable', price: 21, quantity: 240, unit: 'kg', demand: 230, location: 'Udupi', date: '2026-09-03' },
  { product: 'Potato', category: 'Vegetable', price: 22, quantity: 230, unit: 'kg', demand: 240, location: 'Udupi', date: '2026-09-05' },
  { product: 'Potato', category: 'Vegetable', price: 23, quantity: 220, unit: 'kg', demand: 250, location: 'Udupi', date: '2026-09-07' },
  { product: 'Potato', category: 'Vegetable', price: 19, quantity: 280, unit: 'kg', demand: 200, location: 'Mangalore', date: '2026-09-02' },
  { product: 'Potato', category: 'Vegetable', price: 20, quantity: 270, unit: 'kg', demand: 210, location: 'Mangalore', date: '2026-09-04' },
  { product: 'Potato', category: 'Vegetable', price: 21, quantity: 260, unit: 'kg', demand: 215, location: 'Mangalore', date: '2026-09-06' },
  { product: 'Banana', category: 'Fruit', price: 35, quantity: 80, unit: 'dozen', demand: 100, location: 'Udupi', date: '2026-09-01' },
  { product: 'Banana', category: 'Fruit', price: 36, quantity: 75, unit: 'dozen', demand: 110, location: 'Udupi', date: '2026-09-03' },
  { product: 'Banana', category: 'Fruit', price: 38, quantity: 70, unit: 'dozen', demand: 120, location: 'Udupi', date: '2026-09-05' },
  { product: 'Banana', category: 'Fruit', price: 40, quantity: 65, unit: 'dozen', demand: 130, location: 'Udupi', date: '2026-09-07' },
  { product: 'Banana', category: 'Fruit', price: 32, quantity: 90, unit: 'dozen', demand: 85, location: 'Karkala', date: '2026-09-02' },
  { product: 'Banana', category: 'Fruit', price: 34, quantity: 85, unit: 'dozen', demand: 90, location: 'Karkala', date: '2026-09-04' },
  { product: 'Banana', category: 'Fruit', price: 36, quantity: 80, unit: 'dozen', demand: 95, location: 'Karkala', date: '2026-09-06' },
  { product: 'Pulses', category: 'Grain', price: 90, quantity: 100, unit: 'kg', demand: 160, location: 'Mangalore', date: '2026-09-01' },
  { product: 'Pulses', category: 'Grain', price: 92, quantity: 95, unit: 'kg', demand: 170, location: 'Mangalore', date: '2026-09-03' },
  { product: 'Pulses', category: 'Grain', price: 94, quantity: 90, unit: 'kg', demand: 180, location: 'Mangalore', date: '2026-09-05' },
  { product: 'Pulses', category: 'Grain', price: 95, quantity: 85, unit: 'kg', demand: 190, location: 'Mangalore', date: '2026-09-07' },
  { product: 'Pulses', category: 'Grain', price: 88, quantity: 110, unit: 'kg', demand: 140, location: 'Udupi', date: '2026-09-02' },
  { product: 'Pulses', category: 'Grain', price: 90, quantity: 105, unit: 'kg', demand: 150, location: 'Udupi', date: '2026-09-04' },
  { product: 'Pulses', category: 'Grain', price: 91, quantity: 100, unit: 'kg', demand: 155, location: 'Udupi', date: '2026-09-06' },
  { product: 'Coconut', category: 'Other', price: 25, quantity: 200, unit: 'piece', demand: 180, location: 'Kundapura', date: '2026-09-01' },
  { product: 'Coconut', category: 'Other', price: 26, quantity: 190, unit: 'piece', demand: 185, location: 'Kundapura', date: '2026-09-03' },
  { product: 'Coconut', category: 'Other', price: 27, quantity: 185, unit: 'piece', demand: 190, location: 'Kundapura', date: '2026-09-05' },
  { product: 'Coconut', category: 'Other', price: 28, quantity: 180, unit: 'piece', demand: 200, location: 'Kundapura', date: '2026-09-07' },
  { product: 'Coconut', category: 'Other', price: 24, quantity: 220, unit: 'piece', demand: 170, location: 'Udupi', date: '2026-09-02' },
  { product: 'Coconut', category: 'Other', price: 25, quantity: 210, unit: 'piece', demand: 175, location: 'Udupi', date: '2026-09-04' },
  { product: 'Coconut', category: 'Other', price: 26, quantity: 200, unit: 'piece', demand: 180, location: 'Udupi', date: '2026-09-06' },
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_market_intelligence';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear ALL collections for fresh start
    await Promise.all([
      PurchaseRequest.deleteMany({}),
      ProductListing.deleteMany({}),
      User.deleteMany({}),
      MarketData.deleteMany({}),
    ]);
    console.log('✓ Cleared existing users, listings, purchase requests, and market data');

    // Seed fresh MarketData - the original market intelligence data
    const marketInserted = await MarketData.insertMany(sampleMarketData);
    console.log(`✓ Inserted ${marketInserted.length} sample market records`);

    console.log('\n✓ Seed completed successfully');
    console.log('\nDatabase state:');
    console.log('  Users: 0 (create your own via registration)');
    console.log('  ProductListings: 0 (create via application)');
    console.log('  PurchaseRequests: 0 (create via application)');
    console.log(`  MarketData: ${marketInserted.length} (historical market intelligence data)`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
