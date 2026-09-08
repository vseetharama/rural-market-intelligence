/**
 * Distance Matrix Configuration for Market Comparison
 * 
 * This module defines distances between all known market locations
 * used in the Rural Market Intelligence platform.
 * 
 * Distance Unit: Kilometers (km)
 * Source: Based on Google Maps verified measurements between Karnataka market towns
 * Last Updated: 2026-09-07
 * 
 * Symmetry: All distances are symmetric (distance A→B equals B→A)
 * 
 * The distance matrix enables the market comparison feature to calculate
 * transportation costs based on the seller's current location and potential
 * market destinations. Transportation costs are calculated as:
 * 
 *   Transportation_Cost = Distance (km) × Transport_Rate (₹/km)
 * 
 * Example:
 *   Kundapura to Udupi: 25 km
 *   Transport Rate: ₹15/km
 *   Transportation Cost: 25 × 15 = ₹375
 * 
 * Update Instructions:
 * - Add new locations by creating a new object entry in DISTANCE_MATRIX
 * - Ensure all existing locations have a distance entry to the new location
 * - Maintain symmetry: if A→B exists, B→A must equal A→B
 * - Document any changes with commit messages referencing basis for distance updates
 */

/**
 * Distance matrix mapping between market locations
 * 
 * Structure: { from_location: { to_location: distance_in_km } }
 * 
 * Locations included:
 * - Udupi: Coastal town in Karnataka, major market hub
 * - Kundapura: Coastal town in Karnataka, agricultural market
 * - Mangalore: Major port city and commercial center
 * - Karkala: Coastal agricultural hub
 */
const DISTANCE_MATRIX = {
  'Udupi': {
    'Udupi': 0,
    'Kundapura': 25,
    'Mangalore': 65,
    'Karkala': 30,
  },
  'Kundapura': {
    'Udupi': 25,
    'Kundapura': 0,
    'Mangalore': 85,
    'Karkala': 35,
  },
  'Mangalore': {
    'Udupi': 65,
    'Kundapura': 85,
    'Mangalore': 0,
    'Karkala': 50,
  },
  'Karkala': {
    'Udupi': 30,
    'Kundapura': 35,
    'Mangalore': 50,
    'Karkala': 0,
  },
};

/**
 * Get distance between two locations from the distance matrix
 * 
 * @param {string} fromLocation - The starting location name
 * @param {string} toLocation - The destination location name
 * 
 * @returns {number} Distance in kilometers between the two locations
 * 
 * @throws {Error} If distance data is unavailable for the location pair
 *                 Error message format: "Distance data unavailable between '[fromLocation]' and '[toLocation]'"
 * 
 * @example
 *   const distance = getDistance('Kundapura', 'Udupi');
 *   console.log(distance); // 25 km
 */
function getDistance(fromLocation, toLocation) {
  // Validate that both locations exist in the matrix
  if (!DISTANCE_MATRIX[fromLocation]) {
    throw new Error(
      `Distance data unavailable between '${fromLocation}' and '${toLocation}'`
    );
  }

  const distance = DISTANCE_MATRIX[fromLocation][toLocation];

  if (distance === undefined) {
    throw new Error(
      `Distance data unavailable between '${fromLocation}' and '${toLocation}'`
    );
  }

  return distance;
}

module.exports = {
  DISTANCE_MATRIX,
  getDistance,
};
