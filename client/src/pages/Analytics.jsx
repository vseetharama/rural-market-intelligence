import { useEffect, useState } from 'react';
import { getProductAnalytics, getProducts } from '../services/api';

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function PriceChart({ history }) {
  if (!history || history.length === 0) {
    return <p className="empty-text">No price history available.</p>;
  }

  const prices = history.map((item) => item.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  return (
    <div className="price-chart" role="img" aria-label="Historical price chart">
      {history.map((item) => {
        const height = ((item.price - minPrice) / range) * 70 + 20;
        return (
          <div key={`${item.date}-${item.price}-${item.location}`} className="chart-bar-group">
            <div className="chart-value">₹{item.price}</div>
            <div className="chart-bar" style={{ height: `${height}%` }} />
            <div className="chart-label">{formatDate(item.date)}</div>
          </div>
        );
      })}
    </div>
  );
}

function Analytics() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError('');
        const data = await getProducts();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
        }
      } catch (err) {
        setError(
          'Unable to load market data. Please check that the backend server is running.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      if (!selectedProduct) {
        setAnalytics(null);
        return;
      }

      try {
        setLoadingAnalytics(true);
        setError('');
        const data = await getProductAnalytics(selectedProduct);
        setAnalytics(data);
      } catch (err) {
        setAnalytics(null);
        setError(err.message || 'Unable to load product analytics.');
      } finally {
        setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
  }, [selectedProduct]);

  if (loading) {
    return <p className="status-message">Loading market data...</p>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="page-intro">
            Review price trends and demand levels for a selected product.
          </p>
        </div>
      </div>

      {error ? <p className="status-message error">{error}</p> : null}

      <section className="panel">
        <label className="product-select">
          Select product
          <select
            value={selectedProduct}
            onChange={(event) => setSelectedProduct(event.target.value)}
          >
            {products.length === 0 ? (
              <option value="">No products available</option>
            ) : (
              products.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))
            )}
          </select>
        </label>
      </section>

      {loadingAnalytics ? (
        <p className="status-message">Loading market data...</p>
      ) : null}

      {!loadingAnalytics && analytics ? (
        <>
          <section className="panel">
            <h2>{analytics.product} Overview</h2>
            <div className="analytics-grid">
              <div>
                <p className="meta-label">Average Price</p>
                <p className="meta-value">
                  ₹{analytics.averagePrice}/{analytics.unit}
                </p>
              </div>
              <div>
                <p className="meta-label">Current Price</p>
                <p className="meta-value">
                  ₹{analytics.currentPrice}/{analytics.unit}
                </p>
              </div>
              <div>
                <p className="meta-label">Minimum Price</p>
                <p className="meta-value">
                  ₹{analytics.minimumPrice}/{analytics.unit}
                </p>
              </div>
              <div>
                <p className="meta-label">Maximum Price</p>
                <p className="meta-value">
                  ₹{analytics.maximumPrice}/{analytics.unit}
                </p>
              </div>
              <div>
                <p className="meta-label">Price Change</p>
                <p className="meta-value">
                  {analytics.priceChangePercentage > 0 ? '+' : ''}
                  {analytics.priceChangePercentage}%
                </p>
              </div>
              <div>
                <p className="meta-label">Trend</p>
                <p className={`meta-value trend-${analytics.priceTrend.toLowerCase()}`}>
                  {analytics.priceTrend}
                </p>
              </div>
              <div>
                <p className="meta-label">Demand Level</p>
                <p className={`meta-value demand-${analytics.demandLevel.toLowerCase()}`}>
                  {analytics.demandLevel}
                </p>
              </div>
              <div>
                <p className="meta-label">Avg Demand / Quantity</p>
                <p className="meta-value">
                  {analytics.averageDemand} / {analytics.averageQuantity} {analytics.unit}
                </p>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Price Trend</h2>
            <PriceChart history={analytics.history} />
          </section>

          <section className="panel">
            <h2>Historical Prices</h2>
            <div className="table-wrap">
              <table className="market-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Quantity</th>
                    <th>Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.history.map((item) => (
                    <tr key={`${item.date}-${item.location}-${item.price}`}>
                      <td data-label="Date">{formatDate(item.date)}</td>
                      <td data-label="Price">
                        ₹{item.price}/{item.unit}
                      </td>
                      <td data-label="Location">{item.location}</td>
                      <td data-label="Quantity">
                        {item.quantity} {item.unit}
                      </td>
                      <td data-label="Demand">
                        {item.demand} {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {!loadingAnalytics && !analytics && products.length === 0 ? (
        <div className="empty-state">
          <p>No market records found.</p>
          <p>Add your first market record to get started.</p>
        </div>
      ) : null}
    </div>
  );
}

export default Analytics;
