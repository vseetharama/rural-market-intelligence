require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const ProductListing = require('./models/ProductListing');
const PurchaseRequest = require('./models/PurchaseRequest');
const MarketData = require('./models/MarketData');

/**
 * Development utility script to clear only marketplace data
 * (Users, ProductListings, PurchaseRequests)
 * 
 * Preserves the original MarketData collection used by Market Intelligence analytics
 * 
 * Usage: node clearMarketplaceData.js
 * 
 * ⚠️  WARNING: This will delete all users, listings, and purchase requests from the database!
 */

async function clearMarketplaceData() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_market_intelligence';

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');
    console.log('');

    // Get counts before deletion
    const userCount = await User.countDocuments();
    const listingCount = await ProductListing.countDocuments();
    const requestCount = await PurchaseRequest.countDocuments();
    const marketDataCount = await MarketData.countDocuments();

    console.log('Before cleanup:');
    console.log(`  Users: ${userCount}`);
    console.log(`  ProductListings: ${listingCount}`);
    console.log(`  PurchaseRequests: ${requestCount}`);
    console.log(`  MarketData: ${marketDataCount} (will be preserved)`);
    console.log('');

    // Clear only marketplace collections
    const userResult = await User.deleteMany({});
    console.log(`✓ Deleted ${userResult.deletedCount} users`);

    const listingResult = await ProductListing.deleteMany({});
    console.log(`✓ Deleted ${listingResult.deletedCount} product listings`);

    const requestResult = await PurchaseRequest.deleteMany({});
    console.log(`✓ Deleted ${requestResult.deletedCount} purchase requests`);

    // Verify MarketData is intact
    const marketDataCountAfter = await MarketData.countDocuments();
    console.log(`✓ MarketData preserved: ${marketDataCountAfter} records`);

    console.log('');
    console.log('After cleanup:');
    console.log('  Users: 0');
    console.log('  ProductListings: 0');
    console.log('  PurchaseRequests: 0');
    console.log(`  MarketData: ${marketDataCountAfter} (unchanged)`);

    console.log('');
    console.log('✓ Marketplace data cleanup completed successfully');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Cleanup failed:', error.message);
    process.exit(1);
  }
}

clearMarketplaceData();
