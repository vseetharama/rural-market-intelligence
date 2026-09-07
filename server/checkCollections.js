require('dotenv').config();

const mongoose = require('mongoose');

async function checkCollections() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_market_intelligence';

  try {
    await mongoose.connect(uri);

    const collections = ['users', 'productlistings', 'purchaserequests', 'marketdata'];
    const db = mongoose.connection.db;

    console.log('=== COLLECTION SIZES ===\n');
    for (const col of collections) {
      const count = await db.collection(col).countDocuments();
      console.log(`  ${col}: ${count}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCollections();
