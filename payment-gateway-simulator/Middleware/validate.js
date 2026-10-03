/**
 * OWNER: Person 1 (Foundation)
 * Put this after express-validator checks in a route:
 *   router.post("/register", [body("email").isEmail()], validate, controller.register);
 */
const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};
