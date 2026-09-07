import { useState } from 'react';
import AiAskPanel from '../components/AiAskPanel';
import { useAuth } from '../context/AuthContext';
import { getSellAdvice, getStockAdvice } from '../services/api';

function AIAssistant() {
  const { user } = useAuth();
  const [sellForm, setSellForm] = useState({
    product: 'Tomato',
    quantity: '500',
    location: user?.location || 'Kundapura',
  });
  const [sellResult, setSellResult] = useState(null);
  const [stockResult, setStockResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingSell, setLoadingSell] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);

  async function handleSellAdvice(event) {
    event.preventDefault();
    try {
      setLoadingSell(true);
      setError('');
      const result = await getSellAdvice({
        product: sellForm.product,
        quantity: Number(sellForm.quantity),
        location: sellForm.location,
      });
      setSellResult(result);
    } catch (err) {
      setError(err.message || 'Unable to get selling advice.');
    } finally {
      setLoadingSell(false);
    }
  }

  async function handleStockAdvice() {
    try {
      setLoadingStock(true);
      setError('');
      const result = await getStockAdvice();
      setStockResult(result);
    } catch (err) {
      setError(err.message || 'Unable to get stock advice.');
    } finally {
      setLoadingStock(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>AI Market Assistant</h1>
          <p className="page-intro">
            Ask Gemini-powered questions using this platform’s market and marketplace data.
          </p>
        </div>
      </div>

      {error ? <p className="status-message error">{error}</p> : null}

      <AiAskPanel />

      <section className="panel">
        <h2>Where should I sell?</h2>
        <form className="market-form" onSubmit={handleSellAdvice}>
          <div className="form-grid">
            <label>
              Product
              <input
                value={sellForm.product}
                onChange={(event) =>
                  setSellForm((prev) => ({ ...prev, product: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={sellForm.quantity}
                onChange={(event) =>
                  setSellForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Current location
              <input
                value={sellForm.location}
                onChange={(event) =>
                  setSellForm((prev) => ({ ...prev, location: event.target.value }))
                }
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loadingSell}>
            {loadingSell ? 'Calculating...' : 'Get Selling Advice'}
          </button>
        </form>

        {sellResult?.recommendation?.recommendedOpportunity ? (
          <div className="calc-card">
            <h3>Recommended Opportunity</h3>
            <p>
              Market:{' '}
              <strong>{sellResult.recommendation.recommendedOpportunity.market}</strong>
            </p>
            <p>
              Recorded average price: ₹
              {sellResult.recommendation.recommendedOpportunity.recordedAveragePrice}/unit
            </p>
            <p>
              Your quantity: {sellResult.recommendation.recommendedOpportunity.yourQuantity}
            </p>
            <p>
              Potential gross value: ₹
              {sellResult.recommendation.recommendedOpportunity.potentialGrossValue}
            </p>
            {sellResult.explanation ? <p className="ai-answer-text">{sellResult.explanation}</p> : null}
            <p className="disclaimer">{sellResult.disclaimer}</p>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>What should I buy/stock?</h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleStockAdvice}
            disabled={loadingStock}
          >
            {loadingStock ? 'Analyzing...' : 'Get Stock Advice'}
          </button>
        </div>
        {stockResult?.recommendations?.length ? (
          <>
            {stockResult.explanation ? (
              <p className="ai-answer-text">{stockResult.explanation}</p>
            ) : null}
            <ul className="simple-list">
              {stockResult.recommendations.map((item) => (
                <li key={item.product}>
                  <strong>{item.product}</strong>
                  <span>
                    Demand: {item.demandLevel} · Trend: {item.priceTrend} ·{' '}
                    {item.recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="empty-text">Run stock advice to see product recommendations.</p>
        )}
      </section>
    </div>
  );
}

export default AIAssistant;
