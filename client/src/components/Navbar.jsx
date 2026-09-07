import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-mark" aria-hidden="true">
          🌾
        </span>
        <div>
          <p className="navbar-title">Rural Market Intelligence</p>
          <p className="navbar-subtitle">Buy, sell, and understand local farm markets</p>
        </div>
      </div>
      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <span className="navbar-user">
              {user.name} · {user.role}
            </span>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
