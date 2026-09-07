import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { askAI } from '../services/api';

const SUGGESTIONS = [
  'Where should I sell my tomatoes?',
  'Find tomato sellers near Kundapura.',
  'What should I stock?',
  'Which products have high demand?',
];

function AiAskPanel({ compact = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [calculations, setCalculations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAsk(event) {
    event.preventDefault();
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError('');
      setAnswer('');
      const result = await askAI({ question: question.trim() });
      setAnswer(result.answer);
      setCalculations(result.calculations || null);
    } catch (err) {
      setError(err.message || 'Unable to get AI response.');
      if (err.data?.calculations) {
        setCalculations(err.data.calculations);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel ai-panel">
      <div className="panel-header">
        <h2>Rural Market AI</h2>
        {compact ? (
          <button type="button" className="text-link" onClick={() => navigate('/ai')}>
            Open full assistant
          </button>
        ) : null}
      </div>
      <p className="page-intro">
        Ask about prices, buyers, sellers, or market opportunities
        {user ? ` as a ${user.role.toLowerCase()}` : ''}.
      </p>

      <form className="ai-form" onSubmit={handleAsk}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Where should I sell my tomatoes?"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Asking...' : 'Ask AI'}
        </button>
      </form>

      <div className="suggestion-row">
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            className="chip-button"
            onClick={() => setQuestion(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {error ? <p className="status-message error">{error}</p> : null}

      {answer ? (
        <div className="ai-answer">
          <h3>AI Recommendation</h3>
          <p className="ai-answer-text">{answer}</p>
        </div>
      ) : null}

      {calculations?.sellRecommendation?.recommendedOpportunity ? (
        <div className="calc-card">
          <h3>Calculated Selling Opportunity</h3>
          <p>
            Market: <strong>{calculations.sellRecommendation.recommendedOpportunity.market}</strong>
          </p>
          <p>
            Recorded average price: ₹
            {calculations.sellRecommendation.recommendedOpportunity.recordedAveragePrice}
          </p>
          {calculations.sellRecommendation.recommendedOpportunity.potentialGrossValue != null ? (
            <p>
              Potential gross value: ₹
              {calculations.sellRecommendation.recommendedOpportunity.potentialGrossValue}
            </p>
          ) : null}
          <p className="disclaimer">
            {calculations.sellRecommendation.recommendedOpportunity.disclaimer}
          </p>
        </div>
      ) : null}

      {calculations?.stockRecommendations?.length ? (
        <div className="calc-card">
          <h3>Stock Suggestions</h3>
          <ul className="simple-list">
            {calculations.stockRecommendations.slice(0, 3).map((item) => (
              <li key={item.product}>
                <strong>{item.product}</strong>
                <span>
                  Demand {item.demandLevel} · {item.priceTrend} · {item.recommendation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact ? (
        <p className="empty-text">
          Need marketplace actions? Visit the <Link to="/marketplace">Marketplace</Link>.
        </p>
      ) : null}
    </section>
  );
}

export default AiAskPanel;
