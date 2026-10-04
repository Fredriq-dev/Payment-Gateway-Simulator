/**
 * OWNER: Person 2 (Accounts and Admin)
 *
 * CONTRACT: verifies the JWT from "Authorization: Bearer <token>" and sets
 *   req.user = { id, role }
 * Respond 401 if the token is missing or invalid.
 *
 * STUB: passes everything through as the seeded demo merchant so other people
 * can keep working. Person 2 must replace this with real JWT verification.
 */

const jwt = require('jsonwebtoken');
const AppError = require('../Utility/AppError');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('No token provided', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    throw new AppError('Invalid token', 401);
  }
};

// module.exports = (req, res, next) => {
//   console.warn("[STUB] auth.js is not implemented, using demo user");
//   req.user = { id: "11111111-1111-1111-1111-111111111111", role: "merchant" };
//   next();
// };
