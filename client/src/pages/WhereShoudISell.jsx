import { useEffect, useState } from 'react';
import {
  compareMarkets,
  getDistinctProducts,
  getDistinctLocations,
  getProductUnits,
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
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load products on component mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getDistinctProducts();
        // Extract distinct product names from the data
        const productList = data.products && Array.isArray(data.products)
          ? data.products
          : data && Array.isArray(data)
          ? data
          : [];
        setProducts(productList);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Unable to load products. Please refresh the page.');
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

  // Load units when product changes
  useEffect(() => {
    if (!formData.product) {
      setUnits([]);
      return;
    }

    async function loadUnits() {
      try {
        const data = await getProductUnits(formData.product);
        // Extract unit information
        const unit = data?.unit || data?.data?.unit || '';
        if (unit) {
          setUnits([unit]);
          // Auto-select the unit if there's only one
          setFormData(prev => ({ ...prev, unit }));
        } else {
          setUnits([]);
        }
      } catch (err) {
        console.error('Error loading units:', err);
        setUnits([]);
      }
    }

    loadUnits();
  }, [formData.product]);

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
                onChange={(e) => handleInputChange('unit', e.target.value)}
                required
              >
                <option value="">-- Select a unit --</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
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
