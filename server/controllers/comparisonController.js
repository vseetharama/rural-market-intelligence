const { calculateComparison } = require('../services/comparisonEngine');

/**
 * Handle market comparison API request
 * 
 * Extracts product, quantity, unit, and location from request body,
 * calls the comparison engine to calculate market comparison data,
 * and returns the results with appropriate status codes.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing:
 *   - product (string): Product name to compare
 *   - quantity (number): Quantity to sell
 *   - unit (string): Unit of measurement (e.g., 'kg', 'liters')
 *   - location (string): Seller's current location
 * @param {Object} res - Express response object
 * 
 * @returns {void} Sends JSON response with status code:
 *   - 200: Successful comparison with results
 *   - 400: Validation error or invalid input
 *   - 500: Unexpected server error
 */
async function compareMarkets(req, res) {
  try {
    // Extract required fields from request body
    const { product, quantity, unit, location } = req.body;

    // Call comparison engine
    const response = await calculateComparison(product, quantity, unit, location);

    // Check if comparison was successful
    if (response.success) {
      // Return 200 response with comparison results
      return res.status(200).json(response);
    } else {
      // Return 400 response with error message if validation fails
      return res.status(400).json(response);
    }
  } catch (error) {
    // Handle unexpected errors with 500 response
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error'
    });
  }
}

module.exports = {
  compareMarkets
};
