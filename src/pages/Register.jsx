import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register, saveSession } from "../api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({ businessName: form.businessName, email: form.email, password: form.password });
      // log in straight away so the new merchant lands on their dashboard
      const session = await login(form.email, form.password);
      saveSession(session);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        <p className="auth-description">Create an account to start using the payment gateway.</p>

        <form className="payment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={form.businessName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (at least 8 characters)"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <p>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
