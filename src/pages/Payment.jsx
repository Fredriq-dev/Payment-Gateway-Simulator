import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney, initiatePayment, isLoggedIn, payCheckout, toKobo } from "../api";
import StatusBadge from "../components/StatusBadge";

const emptyForm = { name: "", email: "", amount: "", cardNumber: "", expiryDate: "", cvv: "" };

// Starts a real payment (initiate) and then pays it with the card entered here.
// Customers who receive a payment link use the Checkout page instead.
function Payment() {
  const [formData, setFormData] = useState(emptyForm);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // the payment created by the first submit; kept so a pending payment can be retried
  const [reference, setReference] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (toKobo(formData.amount) < 1) {
      setError("Enter an amount of at least 0.01.");
      return;
    }

    setProcessing(true);
    try {
      let ref = reference;
      if (!ref) {
        const created = await initiatePayment({
          amountNaira: formData.amount,
          email: formData.email,
          name: formData.name,
        });
        ref = created.reference;
        setReference(ref);
      }

      const paid = await payCheckout(ref, {
        name: formData.name,
        number: formData.cardNumber,
        expiry: formData.expiryDate,
        cvv: formData.cvv,
      });

      setResult(paid);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const startOver = () => {
    setFormData(emptyForm);
    setReference("");
    setResult(null);
    setError("");
  };

  const tryAgain = () => {
    // keep the form (and the reference if the payment is still pending)
    setResult(null);
    if (result?.status === "failed") setReference("");
  };

  if (processing) {
    return (
      <div className="payment-container">
        <h1>Processing Payment...</h1>
        <p>Please wait while your payment is being processed.</p>
      </div>
    );
  }

  if (result) {
    const amountText = formatMoney(toKobo(formData.amount));
    const succeeded = result.status === "success";

    return (
      <div className="payment-container success-container">
        <h1>
          {succeeded && "Payment Successful!"}
          {result.status === "failed" && "Payment Failed"}
          {result.status === "pending" && "Payment Still Processing"}
        </h1>

        {succeeded && <p>Your payment has been processed successfully.</p>}
        {result.status === "failed" && <p className="form-error">{result.failure_reason || "The payment failed."}</p>}
        {result.status === "pending" && <p>The card issuer has not confirmed the payment yet. You can try again.</p>}

        <p>
          <strong>Payment Status:</strong>
          <br />
          <StatusBadge status={result.status} />
        </p>

        <p>
          <strong>Transaction Reference:</strong>
          <br />
          {result.reference}
        </p>

        <p>
          <strong>Amount:</strong> {amountText}
        </p>

        <p>
          <strong>Name:</strong> {formData.name}
        </p>

        {result.status === "success" ? (
          <button onClick={startOver}>Make Another Payment</button>
        ) : (
          <button onClick={tryAgain}>{result.status === "pending" ? "Try Again" : "Try Another Card"}</button>
        )}
        <br />
        <br />

        <Link to={`/transaction-details/${result.reference}`}>View Transaction Details</Link>
        <br />
        <br />
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Payment Gateway</h1>

        <p className="payment-description">Enter your payment details below to complete your transaction.</p>

        {!isLoggedIn() && (
          <p className="form-info">
            You are not logged in, so this payment goes to the demo merchant. <Link to="/login">Login</Link> to use your
            own account.
          </p>
        )}

        <form className="payment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount (in Naira)"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number (try 4242 4242 4242 4242)"
            value={formData.cardNumber}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="expiryDate"
            placeholder="MM/YY"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />

          <input type="password" name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleChange} required />

          {error && <p className="form-error">{error}</p>}

          <button type="submit">Make Payment</button>
        </form>
      </div>
    </div>
  );
}

export default Payment;
