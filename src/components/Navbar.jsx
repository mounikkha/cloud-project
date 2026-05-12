import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: '🏠 Dashboard' },
    { to: '/add-plan', label: '➕ Add Plan' },
    { to: '/my-plans', label: '📋 My Plans' },
    { to: '/matches', label: '🔍 Find Matches' },
  ];

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          🚗 <span>RideSync</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'show' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="nav-user">
            <span className="user-name">👤 {user?.name}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
