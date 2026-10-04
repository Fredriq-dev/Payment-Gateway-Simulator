/**
 * OWNER: Person 2 (Accounts and Admin)
 * Usage: router.use(auth, role("admin"));
 * Must run after auth.js, which sets req.user.
 */

const AppError = require('../Utility/AppError');

module.exports = (role) => (req, res, next) => {
  if (req.user.role !== role) throw new AppError('Forbidden', 403);
  next();
};

// const role = (...allowedRoles) => (req, res, next) => {
//   if (!req.user || !allowedRoles.includes(req.user.role)) {
//     return res.status(403).json({ success: false, message: "Access denied", errors: null });
//   }
//   next();
// };

// module.exports = role;
