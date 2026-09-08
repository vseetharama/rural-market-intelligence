import { useState, useEffect } from 'react';
import { api } from '../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users');
      setUsers(response);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }

  async function initiatePasswordReset(userId) {
    try {
      setMessage('');
      setError('');
      await api.post('/auth/initiate-password-reset', { userId });
      setMessage('Password reset email has been sent to the user.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Unable to initiate password reset');
      setTimeout(() => setError(''), 5000);
    }
  }

  const filteredUsers = roleFilter === 'ALL' 
    ? users 
    : users.filter(user => user.role === roleFilter);

  if (loading) {
    return <p className="status-message">Loading users...</p>;
  }

  return (
    <div className="admin-users">
      <h1>Manage Users</h1>
      {error ? <p className="status-message error">{error}</p> : null}
      {message ? <p className="status-message success">{message}</p> : null}

      <div className="filter-container">
        <label htmlFor="role-filter">Filter by Role</label>
        <select 
          id="role-filter"
          className="filter-select"
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Users</option>
          <option value="FARMER">Farmers</option>
          <option value="BUYER">Buyers</option>
          <option value="VENDOR">Vendors</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Location</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>{user.location}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => initiatePasswordReset(user._id)}
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <p className="empty-text">No users found.</p>
      )}
    </div>
  );
}

export default AdminUsers;
