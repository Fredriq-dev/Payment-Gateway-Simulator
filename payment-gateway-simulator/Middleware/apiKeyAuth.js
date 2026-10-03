/**
 * OWNER: Person 2 (Accounts and Admin)
 *
 * CONTRACT: reads "Authorization: Bearer sk_test_..." and looks the merchant up
 * with Users.findBySecretKey(secretKey). On success sets
 *   req.merchant = { id, business_name, webhook_url, ... }
 * Respond 401 if the key is missing or unknown.
 *
 * STUB: uses the seeded demo merchant. Person 2 must replace this.
 */

const pool = require ('../Config/databaseConfig');
const AppError = require('../Utility/AppError');

/**
 * Middleware to authenticate merchants using their secret API key.
 * Expected header: Authorization: Bearer <secret_key>
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError('Missing API key', 401);

    const token = authHeader.split(' ')[1];
    if (!token) throw new AppError('Invalid API key format', 401);

    // Look up merchant by secret key
    const { rows } = await pool.query(
      'SELECT id, email, role, public_key, secret_key FROM users WHERE secret_key = $1',
      [token]
    );

    if (rows.length === 0) throw new AppError('Invalid API key', 401);

    // Attach merchant info to request for downstream controllers
    req.merchant = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

// module.exports = (req, res, next) => {
//   console.warn("[STUB] apiKeyAuth.js is not implemented, using demo merchant");
//   req.merchant = {
//     id: "11111111-1111-1111-1111-111111111111",
//     business_name: "Demo Merchant",
//     secret_key: "sk_test_demo",
//     webhook_url: "http://localhost:5000/api/v1/mock-merchant/webhook",
//   };
//   next();
// };
