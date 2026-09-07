import { useEffect, useState } from 'react';
import {
  createListing,
  deleteListing,
  getMyListings,
  updateListing,
} from '../services/api';

const emptyForm = {
  product: '',
  category: '',
  description: '',
  quantity: '',
  unit: 'kg',
  price: '',
  location: '',
  availableFrom: new Date().toISOString().slice(0, 10),
  availableUntil: '',
  status: 'ACTIVE',
};

function MyListings() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadListings() {
    try {
      setLoading(true);
      setError('');
      const data = await getMyListings();
      setListings(data);
    } catch (err) {
      setError(err.message || 'Unable to load listings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage('');
  }

  function startEdit(listing) {
    setEditingId(listing._id);
    setForm({
      product: listing.product,
      category: listing.category,
      description: listing.description || '',
      quantity: listing.quantity,
      unit: listing.unit,
      price: listing.price,
      location: listing.location,
      availableFrom: listing.availableFrom
        ? new Date(listing.availableFrom).toISOString().slice(0, 10)
        : '',
      availableUntil: listing.availableUntil
        ? new Date(listing.availableUntil).toISOString().slice(0, 10)
        : '',
      status: listing.status,
    });
    setShowForm(true);
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      availableUntil: form.availableUntil || null,
    };

    try {
      if (editingId) {
        await updateListing(editingId, payload);
        setMessage('Listing updated successfully.');
      } else {
        await createListing(payload);
        setMessage('Listing created successfully.');
      }
      setShowForm(false);
      setEditingId(null);
      await loadListings();
    } catch (err) {
      setError(err.message || 'Unable to save listing.');
    }
  }

  async function handleCancel(listing) {
    const confirmed = window.confirm('Cancel this listing?');
    if (!confirmed) return;

    try {
      await deleteListing(listing._id);
      setMessage('Listing cancelled successfully.');
      await loadListings();
    } catch (err) {
      setError(err.message || 'Unable to cancel listing.');
    }
  }

  async function markSold(listing) {
    try {
      await updateListing(listing._id, { status: 'SOLD', quantity: 0 });
      setMessage('Listing marked as sold.');
      await loadListings();
    } catch (err) {
      setError(err.message || 'Unable to update listing.');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Listings</h1>
          <p className="page-intro">Create and manage products you are offering for sale.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          Create Listing
        </button>
      </div>

      {message ? <p className="status-message success">{message}</p> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      {showForm ? (
        <section className="panel">
          <h2>{editingId ? 'Edit Listing' : 'New Listing'}</h2>
          <form className="market-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Product
                <input name="product" value={form.product} onChange={handleChange} required />
              </label>
              <label>
                Category
                <input name="category" value={form.category} onChange={handleChange} required />
              </label>
              <label>
                Quantity
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Unit
                <input name="unit" value={form.unit} onChange={handleChange} required />
              </label>
              <label>
                Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Location
                <input name="location" value={form.location} onChange={handleChange} required />
              </label>
              <label>
                Available from
                <input
                  name="availableFrom"
                  type="date"
                  value={form.availableFrom}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Available until
                <input
                  name="availableUntil"
                  type="date"
                  value={form.availableUntil}
                  onChange={handleChange}
                />
              </label>
              {editingId ? (
                <label>
                  Status
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SOLD">SOLD</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </label>
              ) : null}
            </div>
            <label>
              Description
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Fresh locally grown tomatoes"
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Listing' : 'Create Listing'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="panel">
        <h2>Your Listings</h2>
        {loading ? <p className="status-message">Loading listings...</p> : null}
        {!loading && listings.length === 0 ? (
          <div className="empty-state">
            <p>No listings yet.</p>
            <p>Create your first product listing to start selling.</p>
          </div>
        ) : null}
        <div className="listing-grid">
          {listings.map((listing) => (
            <article key={listing._id} className="listing-card">
              <div className="panel-header">
                <h2>{listing.product}</h2>
                <span className={`status-pill status-${listing.status.toLowerCase()}`}>
                  {listing.status}
                </span>
              </div>
              <p className="listing-price">
                ₹{listing.price}/{listing.unit}
              </p>
              <p>
                {listing.quantity} {listing.unit}
              </p>
              <p>{listing.location}</p>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => startEdit(listing)}
                >
                  Edit
                </button>
                {listing.status === 'ACTIVE' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => markSold(listing)}
                    >
                      Mark Sold
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleCancel(listing)}
                    >
                      Cancel
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MyListings;
