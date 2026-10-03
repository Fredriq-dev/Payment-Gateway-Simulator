import { useState } from "react";
import { Link } from "react-router-dom";

function Payment() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [transactionReference, setTransactionReference] = useState("");
  const [processing, setProcessing] = useState(false);
const [paymentStatus, setPaymentStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  setProcessing(true);

  setTimeout(() => {
    const reference =
      "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const transaction = {
      reference: reference,
      name: formData.name,
      email: formData.email,
      amount: formData.amount,
      status: "Successful",
      paymentMethod: "Card",
      date: new Date().toLocaleString(),
    };

    localStorage.setItem(
      "transaction",
      JSON.stringify(transaction)
    );

    setTransactionReference(reference);
    setPaymentStatus(transaction.status);
    setProcessing(false);
    setPaymentSuccessful(true);
  }, 2000);
};

  const makeAnotherPayment = () => {
    setFormData({
      name: "",
      email: "",
      amount: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });

    setTransactionReference("");
    setPaymentSuccessful(false);
  };

if (processing) {
  return (
    <div className="payment-container">
      <h1>Processing Payment...</h1>
      <p>Please wait while your payment is being processed.</p>
    </div>
  );
}

  if (paymentSuccessful) {
    return (
      <div className="payment-container success-container">
        <h1>Payment Successful!</h1>

        <p>Your payment has been processed successfully.</p>
        <p>
          <strong>Payment Status:</strong>
          <br />
          {paymentStatus}
        </p>

        <p>
          <strong>Transaction Reference:</strong>
          <br />
          {transactionReference}
        </p>

        <p>
          <strong>Amount:</strong> ₦{formData.amount}
        </p>

        <p>
          <strong>Name:</strong> {formData.name}
        </p>

        <button onClick={makeAnotherPayment}>
          Make Another Payment
        </button>
        <br />
<br />

<Link to="/dashboard">
  Back to Dashboard
</Link>
      </div>
    );
  }

  return (
   <div className="payment-page">
  <div className="payment-container">
    <h1>Payment Gateway</h1>

    <p className="payment-description">
  Enter your payment details below to complete your transaction.
</p>
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
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
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

        <input
          type="password"
          name="cvv"
          placeholder="CVV"
          value={formData.cvv}
          onChange={handleChange}
          required
        />

        <button type="submit">Make Payment</button>
      </form>
      </div>
    </div>
  );
}

export default Payment;