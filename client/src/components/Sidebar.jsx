import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user, isAuthenticated } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/market-data', label: 'Market Data' },
  ];

  // Add role-specific links
  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') {
      links.push({ to: '/admin/dashboard', label: 'Admin Dashboard' });
      links.push({ to: '/admin/users', label: 'Users' });
      links.push({ to: '/admin/market-data', label: 'Manage Market Data' });
    } else {
      links.push({ to: '/marketplace', label: 'Marketplace' });
      links.push({ to: '/where-should-i-sell', label: 'Where Should I Sell?' });
      links.push({ to: '/analytics', label: 'Analytics' });
      links.push({ to: '/ai', label: 'AI Market Assistant' });

      if (['FARMER', 'VENDOR'].includes(user.role)) {
        links.push({ to: '/sell-product', label: 'Sell Product' });
        links.push({ to: '/my-listings', label: 'My Listings' });
      }

      links.push({ to: '/my-requests', label: 'My Requests' });
      links.push({ to: '/notifications', label: 'Notifications' });
    }

    links.push({ to: '/profile', label: 'Profile' });
  } else {
    links.push({ to: '/marketplace', label: 'Marketplace' });
    links.push({ to: '/where-should-i-sell', label: 'Where Should I Sell?' });
    links.push({ to: '/analytics', label: 'Analytics' });
    links.push({ to: '/ai', label: 'AI Market Assistant' });
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
