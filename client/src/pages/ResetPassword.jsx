import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await api.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      setMessage('Password has been reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <section className="panel auth-card">
          <h1>Invalid Reset Link</h1>
          <p className="status-message error">
            The password reset link is invalid or has expired.
          </p>
          <p className="auth-switch">
            <Link to="/forgot-password">Request a new reset link</Link>
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <section className="panel auth-card">
        <h1>Reset Password</h1>
        <p className="page-intro">Enter your new password below.</p>
        {error ? <p className="status-message error">{error}</p> : null}
        {message ? <p className="status-message success">{message}</p> : null}
        <form className="market-form" onSubmit={handleSubmit}>
          <label>
            New Password
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="auth-switch">
          <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </div>
  );
}

export default ResetPassword;
