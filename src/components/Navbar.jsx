import { Link, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../api";

function Navbar() {
  const navigate = useNavigate();
  const session = getSession();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>Payment Gateway</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/payment">Payment</Link>
        <Link to="/transactions">Transactions</Link>

        {session ? (
          <a href="#logout" onClick={handleLogout}>
            Logout
          </a>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
