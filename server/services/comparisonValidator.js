const MarketData = require('../models/MarketData');

/**
 * Validates all user inputs for the market comparison feature
 * 
 * @param {string} product - Product name to validate
 * @param {number} quantity - Quantity to validate
 * @param {string} unit - Unit of measurement to validate
 * @param {string} location - Location to validate
 * @returns {Promise<Object>} Validation result: { valid: true } or { valid: false, error: "error message" }
 */
async function validateInput(product, quantity, unit, location) {
  try {
    // Check if product exists in MarketData
    const productExists = await MarketData.findOne({
      product: { $regex: product, $options: 'i' }
    });

    if (!productExists) {
      return {
        valid: false,
        error: `Product '${product}' not found in market records`
      };
    }

    // Check if quantity is a positive number
    if (typeof quantity !== 'number' || quantity <= 0) {
      return {
        valid: false,
        error: 'Quantity must be a positive number'
      };
    }

    // Check if unit matches the product's recorded unit
    const recordedUnit = productExists.unit;
    if (unit !== recordedUnit) {
      return {
        valid: false,
        error: `Unit '${unit}' does not match product records for '${product}'`
      };
    }

    // Check if location exists in MarketData
    const locationExists = await MarketData.findOne({
      location: { $regex: location, $options: 'i' }
    });

    if (!locationExists) {
      return {
        valid: false,
        error: `Location '${location}' not found in market records`
      };
    }

    // All validations passed
    return {
      valid: true
    };
  } catch (error) {
    // Handle database errors gracefully
    throw new Error(`Validation error: ${error.message}`);
  }
}

module.exports = {
  validateInput
};
