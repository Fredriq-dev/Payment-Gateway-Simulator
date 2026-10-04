import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>Payment Gateway</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/payment">Payment</Link>
        <Link to="/transactions">Transactions</Link>
      </div>
    </nav>
  );
}

export default Navbar;