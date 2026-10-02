/**
 * OWNER: Person 1 (Foundation)
 * Every endpoint responds in the same shape: { success, message, data }
 *   return success(res, "Payment initiated", { reference }, 201);
 */
const success = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const fail = (res, message, statusCode = 400, errors = null) =>
  res.status(statusCode).json({ success: false, message, errors });

module.exports = { success, fail };
