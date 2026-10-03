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
module.exports = (req, res, next) => {
  console.warn("[STUB] apiKeyAuth.js is not implemented, using demo merchant");
  req.merchant = {
    id: "11111111-1111-1111-1111-111111111111",
    business_name: "Demo Merchant",
    secret_key: "sk_test_demo",
    webhook_url: "http://localhost:5000/api/v1/mock-merchant/webhook",
  };
  next();
};
