const { validateInput } = require('./comparisonValidator');
const { queryMarketsByProduct } = require('./marketRetriever');
const { getDistance } = require('../config/distanceMatrix');
const TRANSPORT_RATE = require('../config/transportRate');

/**
 * Calculation Engine for Market Comparison Feature
 * 
 * Orchestrates all calculations required to determine the best market for selling a product.
 * Validates inputs, retrieves market data, calculates costs and returns, and identifies
 * the recommended market location.
 * 
 * Main entry point: calculateComparison(product, quantity, unit, sellerLocation)
 */

/**
 * Calculate market comparison for a given product
 * 
 * This is the primary orchestration function that:
 * 1. Validates seller input parameters
 * 2. Queries market data for the product
 * 3. Calculates transportation cost, gross value, and net return for each market
 * 4. Identifies the recommended market (highest net return)
 * 5. Sorts results by net return descending
 * 6. Returns comprehensive comparison data with disclaimer
 * 
 * @param {string} product - Product name to compare across markets
 * @param {number} quantity - Quantity the seller intends to sell
 * @param {string} unit - Unit of measurement for the product (e.g., 'kg', 'liters')
 * @param {string} sellerLocation - Current location of the seller
 * 
 * @returns {Promise<Object>} Success or error response:
 *   - Success: { 
 *       success: true,
 *       input: { product, quantity, unit, sellerLocation },
 *       comparisonData: [
 *         {
 *           marketLocation: string,
 *           marketPrice: number,
 *           distance: number,
 *           transportationCost: number,
 *           grossValue: number,
 *           netReturn: number,
 *           isRecommended: boolean
 *         }
 *       ],
 *       recommendedMarket: {
 *         location: string,
 *         netReturn: number,
 *         reasoning: string
 *       },
 *       disclaimer: string
 *     }
 *   - Error: { success: false, error: "error message" }
 * 
 * @example
 *   const result = await calculateComparison('Tomato', 100, 'kg', 'Kundapura');
 *   if (result.success) {
 *     console.log('Best market:', result.recommendedMarket.location);
 *   } else {
 *     console.error('Comparison failed:', result.error);
 *   }
 */
async function calculateComparison(product, quantity, unit, sellerLocation) {
  try {
    // Step 1: Validate input parameters
    const validationResult = await validateInput(product, quantity, unit, sellerLocation);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    // Step 2: Query market data for the product
    const marketResult = await queryMarketsByProduct(product);
    if (!marketResult.valid) {
      return {
        success: false,
        error: marketResult.error
      };
    }

    const markets = marketResult.markets;
    const comparisonArray = [];
    let maxNetReturn = -Infinity;
    let recommendedMarket = null;

    // Step 3: Calculate comparison data for each market
    for (const market of markets) {
      const marketLocation = market.location;
      const marketPrice = market.price;

      // Get distance from Distance_Matrix
      let distance;
      try {
        distance = getDistance(sellerLocation, marketLocation);
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Calculate transportation cost: distance × rate
      const transportationCost = parseFloat((distance * TRANSPORT_RATE).toFixed(2));

      // Calculate gross value: market price × quantity
      const grossValue = parseFloat((marketPrice * quantity).toFixed(2));

      // Calculate net return: gross value - transportation cost
      const netReturn = parseFloat((grossValue - transportationCost).toFixed(2));

      // Build comparison entry
      const comparison = {
        marketLocation,
        marketPrice,
        distance,
        transportationCost,
        grossValue,
        netReturn,
        isRecommended: false
      };

      comparisonArray.push(comparison);

      // Track recommended market (highest net return)
      if (netReturn > maxNetReturn) {
        maxNetReturn = netReturn;
        recommendedMarket = comparison;
      }
    }

    // Step 4: Mark recommended market and sort by net return descending
    if (recommendedMarket) {
      recommendedMarket.isRecommended = true;
    }

    // Sort by net return in descending order
    comparisonArray.sort((a, b) => b.netReturn - a.netReturn);

    // Step 5: Build response with all required fields
    const disclaimer = "Based on recorded platform data. This is an informational estimate, not a guaranteed selling price. Market prices are historical and may fluctuate. Transportation costs are estimates based on configured rates.";

    const response = {
      success: true,
      input: {
        product,
        quantity,
        unit,
        sellerLocation
      },
      comparisonData: comparisonArray,
      recommendedMarket: {
        location: recommendedMarket.marketLocation,
        netReturn: maxNetReturn,
        reasoning: `This market provides the highest estimated net return of ₹${maxNetReturn.toFixed(2)}`
      },
      disclaimer
    };

    return response;
  } catch (error) {
    // Handle unexpected errors
    return {
      success: false,
      error: 'Unexpected server error'
    };
  }
}

module.exports = {
  calculateComparison
};
