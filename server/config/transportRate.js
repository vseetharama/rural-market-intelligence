/**
 * Transport Rate Configuration for Market Comparison Feature
 * 
 * This file defines the configurable transport rate constant used in transportation
 * cost calculations for the "Where Should I Sell?" market comparison feature.
 * 
 * VALUE AND UNITS:
 * - ₹15 per kilometer (₹15/km)
 * 
 * BASIS FOR THE RATE:
 * The transport rate is based on regional fuel costs and labor rates in Karnataka:
 * 
 * Fuel Cost Component:
 *   - Regional fuel cost: ~₹100 per liter (as of implementation date)
 *   - Vehicle efficiency: ~5 km per liter (typical truck/transport vehicle)
 *   - Fuel cost per km: ₹100/liter ÷ 5 km/liter = ₹20/km
 * 
 * Labor and Vehicle Wear Component:
 *   - Driver labor costs: Variable
 *   - Vehicle depreciation and maintenance: Variable
 *   - Net reduction for bulk transport operations: ~₹5/km
 *   - Reasoning: Bulk transport benefits from efficiency; reduces per-km cost
 * 
 * Final Rate Calculation:
 *   - Base fuel cost: ₹20/km
 *   - Less bulk transport reduction: -₹5/km
 *   - Final transport rate: ₹15/km (realistic middle ground for regional markets)
 * 
 * FORMULA:
 * Transportation_Cost = Distance(km) × Transport_Rate(₹/km)
 * 
 * Example Calculation:
 * If distance = 100 km:
 *   Transportation_Cost = 100 km × ₹15/km = ₹1,500
 * 
 * LAST UPDATED: 2024-12-19
 * 
 * @constant {number} TRANSPORT_RATE - Cost in rupees per kilometer for transportation
 * @type {number}
 */

const TRANSPORT_RATE = 15; // ₹ per km

module.exports = TRANSPORT_RATE;
