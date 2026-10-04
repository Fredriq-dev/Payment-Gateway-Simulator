import { Link } from "react-router-dom";

function TransactionDetails() {
  const savedTransaction = localStorage.getItem("transaction");

  const transaction = savedTransaction
    ? JSON.parse(savedTransaction)
    : null;

  if (!transaction) {
    return (
      <div className="details-container">
        <div className="details-content">
          <h1>Transaction Details</h1>

          <p>No transaction found.</p>

          <Link to="/payment">
            <button>Make a Payment</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-content">
        <h1>Transaction Details</h1>

        <div className="details-card">
          <h2>Payment Information</h2>

          <p>
            <strong>Transaction Reference</strong>
            <span>{transaction.reference}</span>
          </p>

          <p>
            <strong>Name</strong>
            <span>{transaction.name}</span>
          </p>

          <p>
            <strong>Email</strong>
            <span>{transaction.email}</span>
          </p>

          <p>
            <strong>Amount</strong>
            <span>₦{transaction.amount}</span>
          </p>

          <p>
            <strong>Status</strong>
            <span>{transaction.status}</span>
          </p>

          <p>
            <strong>Payment Method</strong>
            <span>{transaction.paymentMethod}</span>
          </p>

          <p>
            <strong>Date</strong>
            <span>{transaction.date}</span>
          </p>
        </div>

        <div className="details-links">
          <Link to="/transactions">
            Back to Transactions
          </Link>

          <Link to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetails;