import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelCheckout, formatDate, formatMoney, getCheckout, payCheckout } from "../api";
import StatusBadge from "../components/StatusBadge";

// The page a customer lands on from the payment_url returned by /payments/initiate.
function Checkout() {
  const { reference } = useParams();

  const [checkout, setCheckout] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getCheckout(reference)
      .then((data) => {
        if (!cancelled) {
          setCheckout(data);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.status === 404 ? "This payment link is not valid." : err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [reference, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const handleChange = (e) => setCard({ ...card, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const result = await payCheckout(reference, card);

      if (result.status === "pending") {
        setMessage({
          type: "info",
          text: "Your payment is still processing. You can try again or use a different card.",
        });
      } else if (result.status === "failed") {
        setMessage({ type: "error", text: result.failure_reason || "Payment failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setBusy(false);
      reload();
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    setMessage(null);

    try {
      await cancelCheckout(reference);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setBusy(false);
      reload();
    }
  };

  if (loadError) {
    return (
      <div className="payment-container">
        <h1>Checkout</h1>
        <p className="form-error">{loadError}</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  if (!checkout) {
    return (
      <div className="payment-container">
        <h1>Loading payment...</h1>
      </div>
    );
  }

  const expired = checkout.status === "pending" && new Date(checkout.expires_at) <= new Date();
  const canPay = checkout.status === "pending" && !expired;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Pay {checkout.business_name}</h1>

        <div className="checkout-summary">
          <p className="checkout-amount">{formatMoney(checkout.amount, checkout.currency)}</p>
          <p>
            Reference: <strong>{checkout.reference}</strong>
          </p>
          <p>
            Status: <StatusBadge status={expired ? "abandoned" : checkout.status} />
          </p>
          {canPay && <p>Pay before {formatDate(checkout.expires_at)}</p>}
        </div>

        {message && <p className={message.type === "error" ? "form-error" : "form-info"}>{message.text}</p>}

        {canPay && (
          <form className="payment-form" onSubmit={handlePay}>
            <input
              type="text"
              name="name"
              placeholder="Name on Card"
              value={card.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="number"
              placeholder="Card Number (try 4242 4242 4242 4242)"
              value={card.number}
              onChange={handleChange}
              required
            />
            <input type="text" name="expiry" placeholder="MM/YY" value={card.expiry} onChange={handleChange} required />
            <input type="password" name="cvv" placeholder="CVV" value={card.cvv} onChange={handleChange} required />

            <button type="submit" disabled={busy}>
              {busy ? "Processing..." : `Pay ${formatMoney(checkout.amount, checkout.currency)}`}
            </button>
            <button type="button" className="secondary-button" disabled={busy} onClick={handleCancel}>
              Cancel Payment
            </button>
          </form>
        )}

        {checkout.status === "success" && <p className="form-success">Payment successful. Thank you!</p>}
        {checkout.status === "failed" && <p className="form-error">This payment failed and cannot be retried.</p>}
        {(checkout.status === "abandoned" || expired) && (
          <p className="form-error">This payment was cancelled or has expired.</p>
        )}
        {checkout.status === "refunded" && <p className="form-info">This payment was refunded.</p>}
      </div>
    </div>
  );
}

export default Checkout;
