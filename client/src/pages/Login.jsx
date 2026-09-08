import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="panel auth-card">
        <h1>Login</h1>
        <p className="page-intro">Access your rural market dashboard and marketplace.</p>
        {error ? <p className="status-message error">{error}</p> : null}
        <form className="market-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="farmer1@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-switch">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <p className="empty-text">
          Demo: farmer1@example.com / password123
        </p>
      </section>
    </div>
  );
}

export default Login;
