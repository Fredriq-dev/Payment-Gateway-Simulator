import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDate, formatMoney, refundPayment, verifyPayment } from "../api";
import StatusBadge from "../components/StatusBadge";

function TransactionDetails() {
  const { reference } = useParams();

  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    verifyPayment(reference)
      .then((data) => {
        if (!cancelled) {
          setTransaction(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [reference, reloadKey]);

  const handleRefund = async () => {
    if (!window.confirm("Refund this payment?")) return;

    setBusy(true);
    try {
      await refundPayment(reference);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !transaction) {
    return (
      <div className="details-container">
        <div className="details-content">
          <h1>Transaction Details</h1>

          <p className="form-error">{error}</p>

          <Link to="/transactions">
            <button>Back to Transactions</button>
          </Link>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="details-container">
        <div className="details-content">
          <h1>Transaction Details</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-content">
        <h1>Transaction Details</h1>

        {error && <p className="form-error">{error}</p>}

        <div className="details-card">
          <h2>Payment Information</h2>

          <p>
            <strong>Transaction Reference</strong>
            <span>{transaction.reference}</span>
          </p>

          <p>
            <strong>Name</strong>
            <span>{transaction.metadata?.name || "-"}</span>
          </p>

          <p>
            <strong>Email</strong>
            <span>{transaction.email}</span>
          </p>

          <p>
            <strong>Amount</strong>
            <span>{formatMoney(transaction.amount, transaction.currency)}</span>
          </p>

          <p>
            <strong>Status</strong>
            <span>
              <StatusBadge status={transaction.status} />
            </span>
          </p>

          {transaction.failure_reason && (
            <p>
              <strong>Reason</strong>
              <span>{transaction.failure_reason}</span>
            </p>
          )}

          <p>
            <strong>Payment Method</strong>
            <span>
              {transaction.card_last4
                ? `${(transaction.card_brand || "Card").toUpperCase()} ending ${transaction.card_last4}`
                : "-"}
            </span>
          </p>

          <p>
            <strong>Created</strong>
            <span>{formatDate(transaction.created_at)}</span>
          </p>

          <p>
            <strong>Paid</strong>
            <span>{formatDate(transaction.paid_at)}</span>
          </p>
        </div>

        {transaction.status === "success" && (
          <button className="refund-button" disabled={busy} onClick={handleRefund}>
            {busy ? "Refunding..." : "Refund Payment"}
          </button>
        )}

        <div className="details-links">
          <Link to="/transactions">Back to Transactions</Link>

          <Link to="/dashboard">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetails;
