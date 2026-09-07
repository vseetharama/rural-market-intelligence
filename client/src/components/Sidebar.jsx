import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user, isAuthenticated } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/market-data', label: 'Market Data' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/ai', label: 'AI Market Assistant' },
  ];

  if (isAuthenticated) {
    if (user && ['FARMER', 'VENDOR'].includes(user.role)) {
      links.push({ to: '/my-listings', label: 'My Listings' });
    }
    links.push({ to: '/my-requests', label: 'My Requests' });
    links.push({ to: '/profile', label: 'Profile' });
  } else {
    links.push({ to: '/login', label: 'Login' });
    links.push({ to: '/register', label: 'Register' });
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
