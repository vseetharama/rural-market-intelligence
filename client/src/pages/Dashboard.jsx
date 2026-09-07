import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import InsightCard from '../components/InsightCard';
import MarketTable from '../components/MarketTable';
import AiAskPanel from '../components/AiAskPanel';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../services/api';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError('');
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err) {
        setError(
          'Unable to load market data. Please check that the backend server is running.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [isAuthenticated]);

  if (loading) {
    return <p className="status-message">Loading market data...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const roleStats = summary.roleStats;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            {user
              ? `${user.role.charAt(0)}${user.role.slice(1).toLowerCase()} Dashboard`
              : 'Rural Market Intelligence'}
          </h1>
          <p className="page-intro">
            {user
              ? `Welcome, ${user.name}. Review market conditions, marketplace activity, and AI guidance.`
              : 'A simple view of local product prices, supply, demand, and marketplace opportunities.'}
          </p>
        </div>
        <div className="form-actions">
          <Link to="/marketplace" className="btn btn-secondary">
            Browse Marketplace
          </Link>
          <Link to="/market-data" className="btn btn-primary">
            Add Market Data
          </Link>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard label="Average Price" value={`₹${summary.averagePrice}`} />
        <StatCard label="Products" value={summary.totalProducts} />
        <StatCard label="High Demand" value={summary.highDemandCount || 0} />
        <StatCard label="Active Listings" value={summary.activeListings || 0} />
        <StatCard label="Total Records" value={summary.totalRecords} />
        <StatCard label="Highest Price" value={`₹${summary.highestPrice}`} />
        <StatCard label="Lowest Price" value={`₹${summary.lowestPrice}`} />
        <StatCard label="Total Demand" value={summary.totalDemand} />
      </section>

      {roleStats ? (
        <section className="stats-grid">
          {user?.role !== 'BUYER' ? (
            <>
              <StatCard label="My Listings" value={roleStats.myListings} />
              <StatCard label="Active Listings" value={roleStats.activeMyListings} />
              <StatCard label="Incoming Requests" value={roleStats.pendingSelling} />
            </>
          ) : null}
          {user?.role !== 'FARMER' ? (
            <>
              <StatCard label="My Purchase Requests" value={roleStats.pendingBuying} />
              <StatCard label="Accepted Requests" value={roleStats.acceptedBuying} />
            </>
          ) : null}
        </section>
      ) : null}

      <AiAskPanel compact />

      <div className="dashboard-grid">
        <InsightCard insights={summary.insights} />

        <section className="panel">
          <h2>High Demand Products</h2>
          {summary.highDemandProducts?.length ? (
            <ul className="simple-list">
              {summary.highDemandProducts.map((item) => (
                <li key={item.product}>
                  <strong>{item.product}</strong>
                  <span>
                    {item.priceTrend} · {item.recommendation}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No high-demand products yet.</p>
          )}
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Marketplace Opportunities</h2>
            <Link to="/marketplace" className="text-link">
              View all
            </Link>
          </div>
          {summary.recentListings?.length ? (
            <ul className="simple-list">
              {summary.recentListings.map((listing) => (
                <li key={listing._id}>
                  <strong>
                    {listing.product} · ₹{listing.price}/{listing.unit}
                  </strong>
                  <span>
                    {listing.quantity} {listing.unit} · {listing.location} ·{' '}
                    {listing.seller?.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No active listings yet.</p>
          )}
        </section>

        <section className="panel">
          <h2>Popular Market Products</h2>
          {summary.popularProducts?.length ? (
            <ul className="simple-list">
              {summary.popularProducts.map((item) => (
                <li key={item.product}>
                  <strong>{item.product}</strong>
                  <span>
                    {item.count} records · {item.category}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No products yet.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent Market Records</h2>
          <Link to="/market-data" className="text-link">
            View all
          </Link>
        </div>
        <MarketTable records={summary.recentRecords} showActions={false} />
      </section>
    </div>
  );
}

export default Dashboard;
