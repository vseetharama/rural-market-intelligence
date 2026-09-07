import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'FARMER',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Unable to register.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="panel auth-card">
        <h1>Create Account</h1>
        <p className="page-intro">
          Register as a farmer, buyer, or vendor to join the rural marketplace.
        </p>
        {error ? <p className="status-message error">{error}</p> : null}
        <form className="market-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="FARMER">Farmer</option>
                <option value="BUYER">Buyer</option>
                <option value="VENDOR">Vendor</option>
              </select>
            </label>
            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Kundapura"
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
