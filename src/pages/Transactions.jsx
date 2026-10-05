import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate, formatMoney, isLoggedIn, listPayments } from "../api";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 10;
const STATUSES = ["", "success", "failed", "pending", "abandoned", "refunded"];

function Transactions() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listPayments({ status, page, limit: PAGE_SIZE })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [status, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const changeStatus = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="transactions-container">
      <div className="transactions-content">
        <h1>Transaction History</h1>

        <p>View your recent payment transactions.</p>

        {!isLoggedIn() && (
          <p className="form-info">
            Showing the demo merchant's transactions. <Link to="/login">Login</Link> to see your own.
          </p>
        )}

        <div className="filter-row">
          <label>
            Status:{" "}
            <select value={status} onChange={changeStatus}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {!data && !error && <p>Loading transactions...</p>}

        {data && data.transactions.length === 0 && (
          <div className="no-transaction">
            <p>No transactions available yet.</p>

            <Link to="/payment">
              <button>Make a Payment</button>
            </Link>
          </div>
        )}

        {data && data.transactions.length > 0 && (
          <>
            <div className="table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.reference}</td>
                      <td>{t.customer_email}</td>
                      <td>{formatMoney(t.amount, t.currency)}</td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td>{formatDate(t.created_at)}</td>
                      <td>
                        <Link to={`/transaction-details/${t.reference}`}>Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages} ({data.total} total)
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          </>
        )}

        <br />

        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    </div>
  );
}

export default Transactions;
