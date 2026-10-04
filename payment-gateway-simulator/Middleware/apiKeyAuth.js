/**
 * OWNER: Person 2 (Accounts and Admin)
 *
 * Reads "Authorization: Bearer sk_test_..." and looks the merchant up with
 * Users.findBySecretKey. On success sets req.merchant to the user row (without
 * the password hash). Responds 401 if the key is missing or unknown.
 */
const Users = require("../Models/Users");
const AppError = require("../Utility/AppError");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError("Missing API key", 401);

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) throw new AppError("Invalid API key format", 401);

    const merchant = await Users.findBySecretKey(token);
    if (!merchant) throw new AppError("Invalid API key", 401);

    const { password_hash, ...safeMerchant } = merchant;
    req.merchant = safeMerchant;
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
