function InsightCard({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <section className="panel">
        <h2>Market Insights</h2>
        <p className="empty-text">Insights will appear once market records are available.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Market Insights</h2>
      <ul className="insight-list">
        {insights.map((insight) => (
          <li key={insight} className="insight-item">
            {insight}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default InsightCard;
