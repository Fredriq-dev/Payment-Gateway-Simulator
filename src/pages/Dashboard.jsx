import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>User Dashboard</h1>

        <p>Welcome to your payment dashboard.</p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h2>Make a Payment</h2>
            <p>Make a secure payment using our payment gateway.</p>

            <Link to="/payment">
              <button>Make Payment</button>
            </Link>
          </div>

          <div className="dashboard-card">
            <h2>Transaction History</h2>
            <p>View your previous payment transactions.</p>

            <Link to="/transactions">
              <button>View Transactions</button>
            </Link>
          </div>
        </div>

        <br />

        <Link to="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;