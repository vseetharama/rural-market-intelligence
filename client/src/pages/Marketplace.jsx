import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  createPurchaseRequest,
  getListing,
  getListings,
} from '../services/api';

function Marketplace() {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    sellerRole: '',
    minPrice: '',
    maxPrice: '',
  });
  const [selected, setSelected] = useState(null);
  const [requestForm, setRequestForm] = useState({ quantity: '', offeredPrice: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadListings(activeFilters = filters) {
    try {
      setLoading(true);
      setError('');
      const data = await getListings({
        ...activeFilters,
        status: 'ACTIVE',
      });
      setListings(data);
    } catch (err) {
      setError('Unable to load marketplace listings. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    loadListings(filters);
  }

  async function openDetails(listing) {
    try {
      const full = await getListing(listing._id);
      setSelected(full);
      setRequestForm({
        quantity: '',
        offeredPrice: full.price,
        message: '',
      });
      setMessage('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendRequest(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      setError('Please login as a buyer or vendor to send a purchase request.');
      return;
    }

    try {
      await createPurchaseRequest({
        listingId: selected._id,
        quantity: Number(requestForm.quantity),
        offeredPrice: Number(requestForm.offeredPrice),
        message: requestForm.message,
      });
      setMessage('Purchase request sent successfully.');
      setSelected(null);
      await loadListings();
    } catch (err) {
      setError(err.message || 'Unable to send purchase request.');
    }
  }

  const canBuy =
    isAuthenticated && user && ['BUYER', 'VENDOR'].includes(user.role) && selected
      ? selected.seller?._id !== user.id && selected.seller?._id !== user._id
      : false;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Marketplace</h1>
          <p className="page-intro">Browse products offered by farmers and vendors.</p>
        </div>
        {isAuthenticated && ['FARMER', 'VENDOR'].includes(user.role) ? (
          <Link to="/my-listings" className="btn btn-primary">
            Manage My Listings
          </Link>
        ) : null}
      </div>

      {message ? <p className="status-message success">{message}</p> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      <section className="panel">
        <form className="filter-form" onSubmit={applyFilters}>
          <label>
            Search
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="tomato"
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Kundapura"
            />
          </label>
          <label>
            Category
            <input
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Vegetable"
            />
          </label>
          <label>
            Seller role
            <select name="sellerRole" value={filters.sellerRole} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="FARMER">Farmer</option>
              <option value="VENDOR">Vendor</option>
            </select>
          </label>
          <label>
            Min price
            <input
              name="minPrice"
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </label>
          <label>
            Max price
            <input
              name="maxPrice"
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </label>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </section>

      {loading ? <p className="status-message">Loading marketplace...</p> : null}

      {!loading && listings.length === 0 ? (
        <div className="empty-state">
          <p>No active listings found.</p>
          <p>Try another search or create a listing if you are a seller.</p>
        </div>
      ) : null}

      <div className="listing-grid">
        {listings.map((listing) => (
          <article key={listing._id} className="listing-card">
            <h2>{listing.product}</h2>
            <p className="listing-price">
              ₹{listing.price}/{listing.unit}
            </p>
            <p>
              {listing.quantity} {listing.unit} available
            </p>
            <p>{listing.location}</p>
            <p className="empty-text">
              Seller: {listing.seller?.name || 'Unknown'} ({listing.seller?.role})
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => openDetails(listing)}
              >
                View Details
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => openDetails(listing)}
              >
                Request to Buy
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected ? (
        <section className="panel">
          <div className="panel-header">
            <h2>{selected.product} Details</h2>
            <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          <p>{selected.description || 'No description provided.'}</p>
          <p>
            Price: ₹{selected.price}/{selected.unit}
          </p>
          <p>
            Available: {selected.quantity} {selected.unit}
          </p>
          <p>Location: {selected.location}</p>
          <p>
            Seller: {selected.seller?.name} · {selected.seller?.phone} · {selected.seller?.location}
          </p>

          {canBuy ? (
            <form className="market-form" onSubmit={sendRequest}>
              <div className="form-grid">
                <label>
                  Quantity
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={requestForm.quantity}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, quantity: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Offered price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={requestForm.offeredPrice}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, offeredPrice: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label>
                Message
                <input
                  value={requestForm.message}
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  placeholder="I need this for my shop this week"
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Send Purchase Request
              </button>
            </form>
          ) : (
            <p className="empty-text">
              {isAuthenticated
                ? 'Login as a buyer/vendor (and not as this listing’s seller) to request a purchase.'
                : 'Login as a buyer or vendor to request a purchase.'}
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}

export default Marketplace;
