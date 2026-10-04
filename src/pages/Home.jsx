import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Payment Gateway</h1>

        <p>
          A simple, secure, and reliable payment gateway simulator.
        </p>

        <div className="home-buttons">
          <Link to="/payment">
            <button>Make a Payment</button>
          </Link>

          <Link to="/register">
            <button>Create Account</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;