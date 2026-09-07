import { useEffect, useState } from 'react';
import MarketForm from '../components/MarketForm';
import MarketTable from '../components/MarketTable';
import {
  createMarketData,
  deleteMarketData,
  getMarketData,
  updateMarketData,
} from '../services/api';

function MarketData() {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    product: '',
    location: '',
    category: '',
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function loadRecords(activeFilters = filters) {
    try {
      setLoading(true);
      setError('');
      const data = await getMarketData(activeFilters);
      setRecords(data);
    } catch (err) {
      setError(
        'Unable to load market data. Please check that the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    loadRecords(filters);
  }

  function clearFilters() {
    const cleared = { product: '', location: '', category: '' };
    setFilters(cleared);
    loadRecords(cleared);
  }

  async function handleCreate(data) {
    try {
      await createMarketData(data);
      setMessage('Market data added successfully.');
      setShowForm(false);
      await loadRecords();
    } catch (err) {
      setError(err.message || 'Unable to add market data.');
    }
  }

  async function handleUpdate(data) {
    try {
      await updateMarketData(editingRecord._id, data);
      setMessage('Market data updated successfully.');
      setEditingRecord(null);
      setShowForm(false);
      await loadRecords();
    } catch (err) {
      setError(err.message || 'Unable to update market data.');
    }
  }

  async function handleDelete(record) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this market record?'
    );
    if (!confirmed) return;

    try {
      await deleteMarketData(record._id);
      setMessage('Market data deleted successfully.');
      await loadRecords();
    } catch (err) {
      setError(err.message || 'Unable to delete market data.');
    }
  }

  function startCreate() {
    setEditingRecord(null);
    setShowForm(true);
    setMessage('');
    setError('');
  }

  function startEdit(record) {
    setEditingRecord(record);
    setShowForm(true);
    setMessage('');
    setError('');
  }

  function cancelForm() {
    setEditingRecord(null);
    setShowForm(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Market Data</h1>
          <p className="page-intro">
            View, add, edit, and filter rural market records.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          Add Market Data
        </button>
      </div>

      {message ? <p className="status-message success">{message}</p> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      {showForm ? (
        <section className="panel">
          <h2>{editingRecord ? 'Edit Market Data' : 'Add Market Data'}</h2>
          <MarketForm
            initialValues={editingRecord}
            onSubmit={editingRecord ? handleUpdate : handleCreate}
            onCancel={cancelForm}
            submitLabel={editingRecord ? 'Update Record' : 'Add Record'}
          />
        </section>
      ) : null}

      <section className="panel">
        <h2>Filter Records</h2>
        <form className="filter-form" onSubmit={applyFilters}>
          <label>
            Product
            <input
              name="product"
              value={filters.product}
              onChange={handleFilterChange}
              placeholder="Tomato"
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Udupi"
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
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>All Market Records</h2>
        {loading ? (
          <p className="status-message">Loading market data...</p>
        ) : (
          <MarketTable
            records={records}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}

export default MarketData;
