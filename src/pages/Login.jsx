import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>

        <p className="auth-description">
          Login to access your payment gateway dashboard.
        </p>

        <form className="payment-form">
          <input
            type="email"
            placeholder="Email Address"
            required
          />

          <input
            type="password"
            placeholder="Password"
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>

        <p>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;