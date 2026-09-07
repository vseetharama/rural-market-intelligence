require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const ProductListing = require('./models/ProductListing');
const PurchaseRequest = require('./models/PurchaseRequest');
const MarketData = require('./models/MarketData');

async function verifyDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_market_intelligence';

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB\n');

    const userCount = await User.countDocuments();
    const listingCount = await ProductListing.countDocuments();
    const requestCount = await PurchaseRequest.countDocuments();
    const marketCount = await MarketData.countDocuments();

    console.log('=== DATABASE VERIFICATION ===\n');
    console.log('Collection Status:');
    console.log(`  Users:             ${userCount} ${userCount === 0 ? '✓' : '✗'}`);
    console.log(`  ProductListings:   ${listingCount} ${listingCount === 0 ? '✓' : '✗'}`);
    console.log(`  PurchaseRequests:  ${requestCount} ${requestCount === 0 ? '✓' : '✗'}`);
    console.log(`  MarketData:        ${marketCount} ${marketCount === 56 ? '✓' : '✗'}`);

    console.log('\nMarketData Details:');
    const products = await MarketData.distinct('product');
    console.log(`  Products: ${products.join(', ')}`);

    const locations = await MarketData.distinct('location');
    console.log(`  Locations: ${locations.join(', ')}`);

    const sample = await MarketData.findOne().lean();
    if (sample) {
      console.log(`  Sample record: ${sample.product} at ${sample.location} - ₹${sample.price}/${sample.unit}`);
    }

    console.log('\nExpected final state:');
    console.log('  Users:             0 ✓');
    console.log('  ProductListings:   0 ✓');
    console.log('  PurchaseRequests:  0 ✓');
    console.log('  MarketData:        56 ✓');

    const allCorrect = userCount === 0 && listingCount === 0 && requestCount === 0 && marketCount === 56;
    console.log(`\nOverall Status: ${allCorrect ? '✓ VERIFIED - All collections correct!' : '✗ MISMATCH - Check counts'}`);

    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
