require('dotenv').config();

const mongoose = require('mongoose');
const MarketData = require('./models/MarketData');

/**
 * Additional MarketData seeding script
 * Purpose: Add market price records for demo products, especially Basmati Rice
 * This script is idempotent - running it multiple times won't create duplicates
 */

const additionalMarketData = [
  // ====== BASMATI RICE - New Product ======
  // Basmati Rice in Udupi
  { product: 'Basmati Rice', category: 'Grain', price: 65, quantity: 150, unit: 'kg', demand: 250, location: 'Udupi', date: '2026-09-01' },
  { product: 'Basmati Rice', category: 'Grain', price: 66, quantity: 140, unit: 'kg', demand: 260, location: 'Udupi', date: '2026-09-03' },
  { product: 'Basmati Rice', category: 'Grain', price: 67, quantity: 130, unit: 'kg', demand: 270, location: 'Udupi', date: '2026-09-05' },
  { product: 'Basmati Rice', category: 'Grain', price: 68, quantity: 120, unit: 'kg', demand: 280, location: 'Udupi', date: '2026-09-07' },

  // Basmati Rice in Kundapura
  { product: 'Basmati Rice', category: 'Grain', price: 63, quantity: 160, unit: 'kg', demand: 240, location: 'Kundapura', date: '2026-09-02' },
  { product: 'Basmati Rice', category: 'Grain', price: 64, quantity: 150, unit: 'kg', demand: 250, location: 'Kundapura', date: '2026-09-04' },
  { product: 'Basmati Rice', category: 'Grain', price: 65, quantity: 140, unit: 'kg', demand: 260, location: 'Kundapura', date: '2026-09-06' },

  // Basmati Rice in Mangalore
  { product: 'Basmati Rice', category: 'Grain', price: 70, quantity: 120, unit: 'kg', demand: 280, location: 'Mangalore', date: '2026-09-01' },
  { product: 'Basmati Rice', category: 'Grain', price: 71, quantity: 110, unit: 'kg', demand: 290, location: 'Mangalore', date: '2026-09-03' },
  { product: 'Basmati Rice', category: 'Grain', price: 72, quantity: 100, unit: 'kg', demand: 300, location: 'Mangalore', date: '2026-09-05' },
  { product: 'Basmati Rice', category: 'Grain', price: 73, quantity: 90, unit: 'kg', demand: 310, location: 'Mangalore', date: '2026-09-07' },

  // Basmati Rice in Karkala
  { product: 'Basmati Rice', category: 'Grain', price: 62, quantity: 170, unit: 'kg', demand: 230, location: 'Karkala', date: '2026-09-02' },
  { product: 'Basmati Rice', category: 'Grain', price: 63, quantity: 160, unit: 'kg', demand: 240, location: 'Karkala', date: '2026-09-04' },
  { product: 'Basmati Rice', category: 'Grain', price: 64, quantity: 150, unit: 'kg', demand: 250, location: 'Karkala', date: '2026-09-06' },

  // ====== RICE - Additional locations ======
  // Rice in Kundapura (filling gap)
  { product: 'Rice', category: 'Grain', price: 42, quantity: 240, unit: 'kg', demand: 280, location: 'Kundapura', date: '2026-09-01' },
  { product: 'Rice', category: 'Grain', price: 43, quantity: 230, unit: 'kg', demand: 290, location: 'Kundapura', date: '2026-09-03' },
  { product: 'Rice', category: 'Grain', price: 44, quantity: 220, unit: 'kg', demand: 300, location: 'Kundapura', date: '2026-09-05' },

  // Rice in Karkala (filling gap)
  { product: 'Rice', category: 'Grain', price: 43, quantity: 200, unit: 'kg', demand: 310, location: 'Karkala', date: '2026-09-02' },
  { product: 'Rice', category: 'Grain', price: 44, quantity: 190, unit: 'kg', demand: 320, location: 'Karkala', date: '2026-09-04' },
  { product: 'Rice', category: 'Grain', price: 45, quantity: 180, unit: 'kg', demand: 330, location: 'Karkala', date: '2026-09-06' },

  // ====== TOMATO - Additional locations ======
  // Tomato in Mangalore (filling gap)
  { product: 'Tomato', category: 'Vegetable', price: 25, quantity: 110, unit: 'kg', demand: 190, location: 'Mangalore', date: '2026-09-01' },
  { product: 'Tomato', category: 'Vegetable', price: 27, quantity: 100, unit: 'kg', demand: 200, location: 'Mangalore', date: '2026-09-03' },
  { product: 'Tomato', category: 'Vegetable', price: 29, quantity: 90, unit: 'kg', demand: 210, location: 'Mangalore', date: '2026-09-05' },

  // Tomato in Karkala (filling gap)
  { product: 'Tomato', category: 'Vegetable', price: 26, quantity: 105, unit: 'kg', demand: 185, location: 'Karkala', date: '2026-09-02' },
  { product: 'Tomato', category: 'Vegetable', price: 28, quantity: 95, unit: 'kg', demand: 195, location: 'Karkala', date: '2026-09-04' },
  { product: 'Tomato', category: 'Vegetable', price: 30, quantity: 85, unit: 'kg', demand: 205, location: 'Karkala', date: '2026-09-06' },

  // ====== ONION - Additional locations ======
  // Onion in Mangalore (filling gap)
  { product: 'Onion', category: 'Vegetable', price: 36, quantity: 160, unit: 'kg', demand: 145, location: 'Mangalore', date: '2026-09-01' },
  { product: 'Onion', category: 'Vegetable', price: 34, quantity: 170, unit: 'kg', demand: 150, location: 'Mangalore', date: '2026-09-03' },
  { product: 'Onion', category: 'Vegetable', price: 32, quantity: 180, unit: 'kg', demand: 155, location: 'Mangalore', date: '2026-09-05' },

  // Onion in Udupi (filling gap)
  { product: 'Onion', category: 'Vegetable', price: 38, quantity: 140, unit: 'kg', demand: 140, location: 'Udupi', date: '2026-09-02' },
  { product: 'Onion', category: 'Vegetable', price: 36, quantity: 150, unit: 'kg', demand: 145, location: 'Udupi', date: '2026-09-04' },
  { product: 'Onion', category: 'Vegetable', price: 34, quantity: 160, unit: 'kg', demand: 150, location: 'Udupi', date: '2026-09-06' },

  // ====== POTATO - Additional locations ======
  // Potato in Karkala (filling gap)
  { product: 'Potato', category: 'Vegetable', price: 18, quantity: 300, unit: 'kg', demand: 190, location: 'Karkala', date: '2026-09-01' },
  { product: 'Potato', category: 'Vegetable', price: 19, quantity: 290, unit: 'kg', demand: 200, location: 'Karkala', date: '2026-09-03' },
  { product: 'Potato', category: 'Vegetable', price: 20, quantity: 280, unit: 'kg', demand: 210, location: 'Karkala', date: '2026-09-05' },

  // Potato in Kundapura (filling gap)
  { product: 'Potato', category: 'Vegetable', price: 17, quantity: 310, unit: 'kg', demand: 180, location: 'Kundapura', date: '2026-09-02' },
  { product: 'Potato', category: 'Vegetable', price: 18, quantity: 300, unit: 'kg', demand: 190, location: 'Kundapura', date: '2026-09-04' },
  { product: 'Potato', category: 'Vegetable', price: 19, quantity: 290, unit: 'kg', demand: 200, location: 'Kundapura', date: '2026-09-06' },

  // ====== BANANA - Additional locations ======
  // Banana in Mangalore (filling gap) - Note: Using dozen as unit per existing convention
  { product: 'Banana', category: 'Fruit', price: 33, quantity: 100, unit: 'dozen', demand: 80, location: 'Mangalore', date: '2026-09-01' },
  { product: 'Banana', category: 'Fruit', price: 35, quantity: 95, unit: 'dozen', demand: 90, location: 'Mangalore', date: '2026-09-03' },
  { product: 'Banana', category: 'Fruit', price: 37, quantity: 90, unit: 'dozen', demand: 100, location: 'Mangalore', date: '2026-09-05' },

  // Banana in Kundapura (filling gap)
  { product: 'Banana', category: 'Fruit', price: 31, quantity: 110, unit: 'dozen', demand: 75, location: 'Kundapura', date: '2026-09-02' },
  { product: 'Banana', category: 'Fruit', price: 33, quantity: 105, unit: 'dozen', demand: 85, location: 'Kundapura', date: '2026-09-04' },
  { product: 'Banana', category: 'Fruit', price: 35, quantity: 100, unit: 'dozen', demand: 95, location: 'Kundapura', date: '2026-09-06' },

  // ====== COCONUT - Additional locations ======
  // Coconut in Mangalore (filling gap)
  { product: 'Coconut', category: 'Other', price: 26, quantity: 210, unit: 'piece', demand: 170, location: 'Mangalore', date: '2026-09-01' },
  { product: 'Coconut', category: 'Other', price: 27, quantity: 200, unit: 'piece', demand: 175, location: 'Mangalore', date: '2026-09-03' },
  { product: 'Coconut', category: 'Other', price: 28, quantity: 190, unit: 'piece', demand: 180, location: 'Mangalore', date: '2026-09-05' },

  // Coconut in Karkala (filling gap)
  { product: 'Coconut', category: 'Other', price: 23, quantity: 230, unit: 'piece', demand: 160, location: 'Karkala', date: '2026-09-02' },
  { product: 'Coconut', category: 'Other', price: 24, quantity: 220, unit: 'piece', demand: 165, location: 'Karkala', date: '2026-09-04' },
  { product: 'Coconut', category: 'Other', price: 25, quantity: 210, unit: 'piece', demand: 170, location: 'Karkala', date: '2026-09-06' },

  // ====== PULSES - Additional locations ======
  // Pulses in Karkala (filling gap)
  { product: 'Pulses', category: 'Grain', price: 87, quantity: 120, unit: 'kg', demand: 130, location: 'Karkala', date: '2026-09-01' },
  { product: 'Pulses', category: 'Grain', price: 89, quantity: 115, unit: 'kg', demand: 140, location: 'Karkala', date: '2026-09-03' },
  { product: 'Pulses', category: 'Grain', price: 91, quantity: 110, unit: 'kg', demand: 150, location: 'Karkala', date: '2026-09-05' },

  // Pulses in Kundapura (filling gap)
  { product: 'Pulses', category: 'Grain', price: 85, quantity: 130, unit: 'kg', demand: 120, location: 'Kundapura', date: '2026-09-02' },
  { product: 'Pulses', category: 'Grain', price: 87, quantity: 125, unit: 'kg', demand: 130, location: 'Kundapura', date: '2026-09-04' },
  { product: 'Pulses', category: 'Grain', price: 89, quantity: 120, unit: 'kg', demand: 140, location: 'Kundapura', date: '2026-09-06' },
];

async function seedAdditionalMarketData() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_market_intelligence';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // For each record, check if it already exists to prevent duplicates
    // Use product + location + date as the uniqueness key
    let insertedCount = 0;
    let skippedCount = 0;

    for (const record of additionalMarketData) {
      // Convert date string to Date object
      const recordDate = new Date(record.date);

      // Check if record with same product, location, and date already exists
      const existing = await MarketData.findOne({
        product: record.product,
        location: record.location,
        date: recordDate,
      });

      if (existing) {
        skippedCount++;
        console.log(`⊘ Skipped: ${record.product} at ${record.location} on ${record.date} (already exists)`);
      } else {
        // Insert the new record
        await MarketData.create({
          ...record,
          date: recordDate,
        });
        insertedCount++;
        console.log(`✓ Inserted: ${record.product} at ${record.location} on ${record.date} (₹${record.price}/kg)`);
      }
    }

    console.log(`\n✓ Seeding completed`);
    console.log(`  Records inserted: ${insertedCount}`);
    console.log(`  Records skipped (duplicates): ${skippedCount}`);

    // Get total count
    const totalCount = await MarketData.countDocuments();
    console.log(`  Total MarketData records now: ${totalCount}`);

    // Verify Basmati Rice records
    const basmatiCount = await MarketData.countDocuments({ product: 'Basmati Rice' });
    const basmatiByMarket = await MarketData.aggregate([
      { $match: { product: 'Basmati Rice' } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log(`\n📊 Basmati Rice verification:`);
    console.log(`  Total Basmati Rice records: ${basmatiCount}`);
    console.log('  Records by market:');
    basmatiByMarket.forEach((market) => {
      console.log(`    - ${market._id}: ${market.count} records`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedAdditionalMarketData();
