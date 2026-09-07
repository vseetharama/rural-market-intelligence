import { useEffect, useState } from 'react';
import {
  getMyPurchaseRequests,
  getSellingRequests,
  updatePurchaseRequestStatus,
} from '../services/api';

function MyRequests() {
  const [buying, setBuying] = useState([]);
  const [selling, setSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadRequests() {
    try {
      setLoading(true);
      setError('');
      const [buyData, sellData] = await Promise.all([
        getMyPurchaseRequests(),
        getSellingRequests(),
      ]);
      setBuying(buyData);
      setSelling(sellData);
    } catch (err) {
      setError(err.message || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id, status) {
    try {
      await updatePurchaseRequestStatus(id, status);
      setMessage(`Request ${status.toLowerCase()} successfully.`);
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Unable to update request.');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Requests</h1>
          <p className="page-intro">Track purchase requests you sent and requests for your listings.</p>
        </div>
      </div>

      {message ? <p className="status-message success">{message}</p> : null}
      {error ? <p className="status-message error">{error}</p> : null}
      {loading ? <p className="status-message">Loading requests...</p> : null}

      <section className="panel">
        <h2>Purchase Requests</h2>
        {!loading && buying.length === 0 ? (
          <p className="empty-text">No purchase requests yet.</p>
        ) : null}
        <div className="request-list">
          {buying.map((request) => (
            <article key={request._id} className="request-card">
              <div className="panel-header">
                <h3>{request.listing?.product || 'Product'}</h3>
                <span className={`status-pill status-${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>
              <p>
                {request.quantity} {request.listing?.unit} · Offered ₹{request.offeredPrice}
              </p>
              <p>Seller: {request.seller?.name}</p>
              {request.message ? <p className="empty-text">{request.message}</p> : null}
              {request.status === 'PENDING' ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => updateStatus(request._id, 'CANCELLED')}
                >
                  Cancel Request
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Selling Requests</h2>
        {!loading && selling.length === 0 ? (
          <p className="empty-text">No selling requests yet.</p>
        ) : null}
        <div className="request-list">
          {selling.map((request) => (
            <article key={request._id} className="request-card">
              <div className="panel-header">
                <h3>{request.listing?.product || 'Product'}</h3>
                <span className={`status-pill status-${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>
              <p>
                Buyer: {request.buyer?.name} · Requested {request.quantity}{' '}
                {request.listing?.unit}
              </p>
              <p>Offered price: ₹{request.offeredPrice}</p>
              {request.message ? <p className="empty-text">{request.message}</p> : null}
              {request.status === 'PENDING' ? (
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateStatus(request._id, 'ACCEPTED')}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => updateStatus(request._id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </div>
              ) : null}
              {request.status === 'ACCEPTED' ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => updateStatus(request._id, 'COMPLETED')}
                >
                  Mark Completed
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MyRequests;
