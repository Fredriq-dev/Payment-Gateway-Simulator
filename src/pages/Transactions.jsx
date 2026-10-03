import { Link } from "react-router-dom";

function Transactions() {
  const savedTransaction = localStorage.getItem("transaction");

  const transaction = savedTransaction
    ? JSON.parse(savedTransaction)
    : null;

  return (
    <div className="transactions-container">
      <div className="transactions-content">
        <h1>Transaction History</h1>

        <p>View your recent payment transactions.</p>

        {!transaction ? (
          <div className="no-transaction">
            <p>No transactions available yet.</p>

            <Link to="/payment">
              <button>Make a Payment</button>
            </Link>
          </div>
        ) : (
          <div className="transaction-card">
            <h2>Recent Transaction</h2>

            <p>
              <strong>Reference:</strong>
              <br />
              {transaction.reference}
            </p>

            <p>
              <strong>Amount:</strong>
              <br />
              ₦{transaction.amount}
            </p>

            <p>
              <strong>Status:</strong>
              <br />
              {transaction.status}
            </p>

            <p>
              <strong>Date:</strong>
              <br />
              {transaction.date}
            </p>

            <Link to="/transaction-details">
              <button>View Details</button>
            </Link>
          </div>
        )}

        <br />

        <Link to="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Transactions;