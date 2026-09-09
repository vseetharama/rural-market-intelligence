import { useEffect, useState } from 'react';
import {
  compareMarkets,
  getMyListings,
  getDistinctLocations,
} from '../services/api';

function WhereShoudISell() {
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    unit: '',
    location: '',
  });

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noActiveListings, setNoActiveListings] = useState(false);

  // Load farmer's active products on component mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const listings = await getMyListings();
        
        // Filter for ACTIVE listings only
        const active = Array.isArray(listings)
          ? listings.filter(listing => listing.status === 'ACTIVE')
          : [];

        if (active.length === 0) {
          setNoActiveListings(true);
          setProducts([]);
          setActiveListings([]);
          setError('No active products available. Create a listing first.');
          return;
        }

        // Store active listings for unit lookup
        setActiveListings(active);

        // Extract unique product names from active listings
        const uniqueProducts = [...new Set(active.map(listing => listing.product))].sort();
        setProducts(uniqueProducts);
        setNoActiveListings(false);
        setError('');
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Unable to load your listings. Please refresh the page or log in.');
        setNoActiveListings(true);
      }
    }

    loadProducts();
  }, []);

  // Load locations on component mount
  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await getDistinctLocations();
        // Extract distinct locations from market data
        const locationList = data && Array.isArray(data)
          ? [...new Set(data.map(record => record.location))]
          : [];
        setLocations(locationList);
      } catch (err) {
        console.error('Error loading locations:', err);
        setError('Unable to load locations. Please refresh the page.');
      }
    }

    loadLocations();
  }, []);

  // Load unit from active listing when product changes
  useEffect(() => {
    if (!formData.product) {
      setUnits([]);
      return;
    }

    // Find the first active listing for the selected product
    const listing = activeListings.find(l => l.product === formData.product);

    if (listing && listing.unit) {
      // Set unit from the listing and auto-select it
      setUnits([listing.unit]);
      setFormData(prev => ({ ...prev, unit: listing.unit }));
    } else {
      // No unit found in listing
      setUnits([]);
      setFormData(prev => ({ ...prev, unit: '' }));
    }
  }, [formData.product, activeListings]);

  function handleInputChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleProductChange(product) {
    setFormData(prev => ({
      ...prev,
      product,
      unit: '', // Reset unit when product changes
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate form data
    if (!formData.product) {
      setError('Please select a product');
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (!formData.unit) {
      setError('Please select a unit');
      return;
    }

    if (!formData.location) {
      setError('Please select your location');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setComparisonResults(null);

      const results = await compareMarkets(
        formData.product,
        Number(formData.quantity),
        formData.unit,
        formData.location
      );

      if (results.success) {
        setComparisonResults(results);
      } else {
        setError(results.error || 'Unable to compare markets. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to compare markets. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Where Should I Sell?</h1>
          <p className="page-intro">
            Compare market prices and find the location offering the highest net return for your products.
          </p>
        </div>
      </div>

      {error && <p className="status-message error">{error}</p>}

      {noActiveListings ? (
        <section className="panel">
          <p className="status-message error">No active products available. Create a listing first.</p>
        </section>
      ) : (
      <section className="panel">
        <h2>Compare Markets</h2>
        <form className="market-comparison-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Product
              <select
                value={formData.product}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              >
                <option value="">-- Select a product --</option>
                {products.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="100"
                required
              />
            </label>

            <label>
              Unit
              <select
                value={formData.unit}
                disabled={true}
                required
              >
                <option value="">-- Select a unit --</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {formData.unit && <small style={{display: 'block', marginTop: '4px', color: '#666'}}>Unit from your listing</small>}
            </label>

            <label>
              Your Location
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              >
                <option value="">-- Select your location --</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Comparing...' : 'Compare Markets'}
            </button>
          </div>
        </form>
      </section>
      )}

      {loading && (
        <section className="panel">
          <p className="status-message">Loading market comparison data...</p>
        </section>
      )}

      {comparisonResults && (
        <>
          <section className="panel">
            <h2>Recommended Market</h2>
            <div className="recommendation-card">
              <h3>{comparisonResults.recommendedMarket.location}</h3>
              <div className="recommendation-details">
                <p>
                  <strong>Estimated Net Return:</strong> ₹
                  {comparisonResults.recommendedMarket.netReturn.toFixed(2)}
                </p>
                <p className="recommendation-reasoning">
                  {comparisonResults.recommendedMarket.reasoning}
                </p>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Comparison Details</h2>
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Market Location</th>
                    <th>Market Price</th>
                    <th>Distance (km)</th>
                    <th>Transport Cost</th>
                    <th>Gross Value</th>
                    <th>Net Return</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResults.comparisonData.map((market, index) => (
                    <tr
                      key={index}
                      className={market.isRecommended ? 'recommended-row' : ''}
                    >
                      <td>
                        <strong>{market.marketLocation}</strong>
                        {market.isRecommended && (
                          <span className="badge recommended-badge">
                            Recommended
                          </span>
                        )}
                      </td>
                      <td>₹{market.marketPrice.toFixed(2)}</td>
                      <td>{market.distance}</td>
                      <td>₹{market.transportationCost.toFixed(2)}</td>
                      <td>₹{market.grossValue.toFixed(2)}</td>
                      <td className="net-return-cell">
                        ₹{market.netReturn.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel disclaimer-section">
            <h3>Disclaimer</h3>
            <p>{comparisonResults.disclaimer}</p>
          </section>
        </>
      )}
    </div>
  );
}

export default WhereShoudISell;
