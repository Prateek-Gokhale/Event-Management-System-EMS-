import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    const nextPath = isAdmin ? "/admin/login" : "/login";
    logout();
    setMenuOpen(false);
    navigate(nextPath);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar-wrap">
      <nav className="navbar">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-dot" />
          </span>
          EventHub
        </Link>

        <button
          className="nav-menu-toggle"
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/events" onClick={closeMenu}>Events</NavLink>
          {!isAdmin && isAuthenticated && <NavLink to="/cart" onClick={closeMenu}>Cart ({count})</NavLink>}
          {isAuthenticated && !isAdmin && <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
        </div>

        <div className={`nav-actions ${menuOpen ? "open" : ""}`}>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            <span aria-hidden="true" />
          </button>
          <div className="auth-actions">
          {isAuthenticated ? (
            <>
              <span className="welcome">Hi, {user?.name?.split(" ")[0]}</span>
              <button className="btn ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login" onClick={closeMenu}>
                User Login
              </Link>
              <Link className="btn ghost" to="/admin/login" onClick={closeMenu}>
                Admin
              </Link>
              <Link className="btn primary" to="/register" onClick={closeMenu}>
                Join Now
              </Link>
            </>
          )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
