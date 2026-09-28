/**
 * OWNER: Person 1 (Foundation)
 * Express 4 does not catch errors thrown inside async functions, which would crash the server.
 * Every controller in the route files is wrapped with this, so a thrown AppError
 * reaches Middleware/errorHandler.js instead.
 *   router.get("/profile", auth, catchAsync(controller.getProfile));
 */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
