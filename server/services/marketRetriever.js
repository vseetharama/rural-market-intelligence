const MarketData = require('../models/MarketData');

/**
 * Query markets by product with location diversity validation
 * 
 * Retrieves all market records for a given product (case-insensitive),
 * groups by location, and selects the latest date record for each location.
 * Validates that at least 2 unique locations have data for the product.
 * 
 * @param {string} product - Product name to search for
 * @returns {Promise<Object>} Result object with structure:
 *   - On success: { valid: true, markets: [...] }
 *   - On failure: { valid: false, error: "error message" }
 * 
 * Requirements:
 *   - 2.1: Query MarketData for records matching product name (case-insensitive)
 *   - 2.2: Retrieve most recent market price for each distinct Market_Location
 *   - 2.3: Select record with latest date when multiple exist for same product/location
 *   - 2.4: Return error if no MarketData records found for specified product
 *   - 2.5: Return error if fewer than 2 locations have price data
 *   - 10.5: Return error with format "Insufficient market data for comparison. Only [count] location(s) available"
 */
async function queryMarketsByProduct(product) {
  try {
    // Use MongoDB aggregation pipeline for efficiency:
    // 1. $match: Find records where product matches (case-insensitive)
    // 2. $sort: Sort by date descending to get latest first
    // 3. $group: Group by location, take first (latest) record
    const pipeline = [
      {
        $match: {
          product: { $regex: `^${product}$`, $options: 'i' }
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $group: {
          _id: '$location',
          latestRecord: { $first: '$$ROOT' }
        }
      }
    ];

    const results = await MarketData.aggregate(pipeline);

    // Check if product was found
    if (results.length === 0) {
      return {
        valid: false,
        error: `Product '${product}' not found in market records`
      };
    }

    // Check location diversity - must have at least 2 locations
    if (results.length < 2) {
      return {
        valid: false,
        error: `Insufficient market data for comparison. Only ${results.length} location(s) available`
      };
    }

    // Extract market data from aggregation results
    const markets = results.map(result => result.latestRecord);

    return {
      valid: true,
      markets
    };
  } catch (error) {
    // Return error object on exception
    return {
      valid: false,
      error: error.message
    };
  }
}

module.exports = { queryMarketsByProduct };
