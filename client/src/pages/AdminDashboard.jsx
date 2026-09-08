import { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/stats');
      setStats(response);
    } catch (err) {
      setError(err.message || 'Unable to load statistics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="status-message">Loading admin dashboard...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} />
        <StatCard label="Farmers" value={stats?.farmers || 0} />
        <StatCard label="Buyers" value={stats?.buyers || 0} />
        <StatCard label="Vendors" value={stats?.vendors || 0} />
        <StatCard label="Product Listings" value={stats?.totalListings || 0} />
        <StatCard label="Purchase Requests" value={stats?.totalPurchaseRequests || 0} />
        <StatCard label="Market Data Records" value={stats?.totalMarketData || 0} />
      </div>
    </div>
  );
}

export default AdminDashboard;
