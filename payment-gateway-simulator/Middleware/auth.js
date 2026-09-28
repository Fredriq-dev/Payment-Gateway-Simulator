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
module.exports = (req, res, next) => {
  console.warn("[STUB] auth.js is not implemented, using demo user");
  req.user = { id: "11111111-1111-1111-1111-111111111111", role: "merchant" };
  next();
};
