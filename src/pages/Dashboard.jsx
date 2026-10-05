import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney, getSession, listPayments, saveSession, updateWebhookUrl } from "../api";

function Dashboard() {
  const session = getSession();
  const user = session?.user;

  const [summary, setSummary] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(user?.webhook_url || "");
  const [webhookMessage, setWebhookMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // 100 is the largest page the list endpoint returns, plenty for a summary
    listPayments({ limit: 100 })
      .then((data) => {
        if (cancelled) return;
        const successful = data.transactions.filter((t) => t.status === "success");
        setSummary({
          total: data.total,
          successful: successful.length,
          volume: successful.reduce((sum, t) => sum + Number(t.amount), 0),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const saveWebhook = async (e) => {
    e.preventDefault();
    setWebhookMessage(null);

    try {
      const data = await updateWebhookUrl(webhookUrl);
      saveSession({ ...session, user: data.user });
      setWebhookMessage({ type: "success", text: "Webhook URL saved." });
    } catch (err) {
      setWebhookMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>{user ? `Welcome, ${user.business_name}` : "User Dashboard"}</h1>

        {!user && (
          <p className="form-info">
            You are not logged in. <Link to="/login">Login</Link> or <Link to="/register">create an account</Link> to
            see your own keys and payments.
          </p>
        )}

        {summary && (
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h2>{summary.total}</h2>
              <p>Total transactions</p>
            </div>
            <div className="dashboard-card">
              <h2>{summary.successful}</h2>
              <p>Successful payments</p>
            </div>
            <div className="dashboard-card">
              <h2>{formatMoney(summary.volume)}</h2>
              <p>Money received</p>
            </div>
          </div>
        )}

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

        {user && (
          <div className="keys-box">
            <h2>API Keys</h2>
            <p>
              <strong>Public key:</strong> <code>{user.public_key}</code>
            </p>
            <p>
              <strong>Secret key:</strong> <code>{showSecret ? user.secret_key : "sk_test_••••••••••••"}</code>{" "}
              <button type="button" className="link-button" onClick={() => setShowSecret(!showSecret)}>
                {showSecret ? "Hide" : "Show"}
              </button>
            </p>
            <p className="keys-note">Keep your secret key private. Never put it in public code.</p>

            <form className="webhook-form" onSubmit={saveWebhook}>
              <label htmlFor="webhook-url">
                <strong>Webhook URL</strong> (where payment results are sent)
              </label>
              <input
                id="webhook-url"
                type="text"
                placeholder="http://localhost:5000/api/v1/mock-merchant/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                required
              />
              <button type="submit">Save Webhook URL</button>
              {webhookMessage && (
                <p className={webhookMessage.type === "error" ? "form-error" : "form-success"}>{webhookMessage.text}</p>
              )}
            </form>
          </div>
        )}

        <br />

        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

export default Dashboard;
