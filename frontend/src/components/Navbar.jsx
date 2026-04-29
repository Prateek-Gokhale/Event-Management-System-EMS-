import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar-wrap">
      <nav className="navbar">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-dot" />
          </span>
          EventHub
        </Link>

        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/events">Events</NavLink>
          {!isAdmin && isAuthenticated && <NavLink to="/cart">Cart ({count})</NavLink>}
          {isAuthenticated && !isAdmin && <NavLink to="/dashboard">Dashboard</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="welcome">Hi, {user?.name?.split(" ")[0]}</span>
              <button className="btn ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">
                Login
              </Link>
              <Link className="btn primary" to="/register">
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
