/**
 * OWNER: Person 1 (Foundation)
 * Entry point. Person 1 mounts every route here.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const rateLimiter = require("./Middleware/rateLimiter");
const errorHandler = require("./Middleware/errorHandler");
const AppError = require("./Utility/AppError");

// the shared PostgreSQL pool
const pool = require("./Config/databaseConfig");
const WebhookService = require("./Services/WebhookService");

// fail fast if required environment variables are missing
   const requiredEnvVars = ["DATABASE_URL","JWT_SECRET", "JWT_EXPIRES_IN", "CHECKOUT_BASE_URL", "TRANSACTION_EXPIRY_MINUTES", "WEBHOOK_MAX_ATTEMPTS"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length) {
  console.error(`Missing required env vars: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

// confirms the database is reachable
const testDBConnection = async () => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected at:", rows[0].now);
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimiter);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Payment Gateway Simulator is running" });
});

const API = "/api/v1";
app.use(`${API}/users`, require("./Routes/UserRoute"));
app.use(`${API}/admin`, require("./Routes/AdminRoute"));
app.use(`${API}/payments`, require("./Routes/PaymentRoute"));
app.use(`${API}/checkout`, require("./Routes/CheckoutRoute"));
app.use(`${API}/webhooks`, require("./Routes/WebhookRoute"));
app.use(`${API}/mock-merchant`, require("./Routes/MockMerchantRoute"));

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// test the database first, then start listening
if (require.main === module) {
  testDBConnection().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // retries failed webhooks in the background
      WebhookService.startRetryWorker();
    });
  });
}

module.exports = app;