import { useState, useEffect } from 'react';
import { api } from '../services/api';

function AdminMarketData() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    product: '',
    category: '',
    price: '',
    quantity: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/market-data');
      setRecords(response);
    } catch (err) {
      setError(err.message || 'Unable to load market data');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setMessage('');

      if (editingId) {
        await api.put(`/market-data/${editingId}`, form);
        setMessage('Market data updated successfully');
      } else {
        await api.post('/market-data', form);
        setMessage('Market data added successfully');
      }

      setShowForm(false);
      setEditingId(null);
      setForm({
        product: '',
        category: '',
        price: '',
        quantity: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
      });
      await fetchRecords();
    } catch (err) {
      setError(err.message || 'Unable to save market data');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      setError('');
      await api.delete(`/market-data/${id}`);
      setMessage('Market data deleted successfully');
      await fetchRecords();
    } catch (err) {
      setError(err.message || 'Unable to delete market data');
    }
  }

  function handleEdit(record) {
    setForm({
      product: record.product,
      category: record.category,
      price: record.price,
      quantity: record.quantity,
      location: record.location,
      date: record.date.split('T')[0],
    });
    setEditingId(record._id);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm({
      product: '',
      category: '',
      price: '',
      quantity: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
    });
  }

  if (loading) {
    return <p className="status-message">Loading market data...</p>;
  }

  return (
    <div className="admin-market-data">
      <h1>Manage Market Data</h1>
      {error ? <p className="status-message error">{error}</p> : null}
      {message ? <p className="status-message success">{message}</p> : null}

      <button
        className="btn btn-primary"
        onClick={() => {
          setShowForm(!showForm);
          if (showForm) handleCancel();
        }}
      >
        {showForm ? 'Cancel' : 'Add Market Data'}
      </button>

      {showForm && (
        <form className="market-form" onSubmit={handleSubmit}>
          <label>
            Product Name
            <input
              name="product"
              value={form.product}
              onChange={handleChange}
              placeholder="e.g., Wheat"
              required
            />
          </label>
          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g., Grain"
              required
            />
          </label>
          <label>
            Price (per unit)
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g., 50.00"
              required
            />
          </label>
          <label>
            Quantity (units)
            <input
              name="quantity"
              type="number"
              step="0.01"
              value={form.quantity}
              onChange={handleChange}
              placeholder="e.g., 100"
              required
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Punjab"
              required
            />
          </label>
          <label>
            Date
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update' : 'Add'} Market Data
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record._id}>
                <td>{record.product}</td>
                <td>{record.category}</td>
                <td>₹{record.price}</td>
                <td>{record.quantity}</td>
                <td>{record.location}</td>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(record)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(record._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 && (
        <p className="empty-text">No market data records found.</p>
      )}
    </div>
  );
}

export default AdminMarketData;
