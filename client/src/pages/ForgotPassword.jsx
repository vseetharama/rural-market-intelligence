import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await api.post('/auth/forgot-password', { email });
      setMessage('If the account exists, a password reset link has been sent to your email.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="panel auth-card">
        <h1>Reset Password</h1>
        <p className="page-intro">Enter your email to receive a password reset link.</p>
        {error ? <p className="status-message error">{error}</p> : null}
        {message ? <p className="status-message success">{message}</p> : null}
        <form className="market-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="auth-switch">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </div>
  );
}

export default ForgotPassword;
