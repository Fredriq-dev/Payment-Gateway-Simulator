/** OWNER: Person 2 (Accounts and Admin) */
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const { body } = require("express-validator");
const controller = require("../Controllers/UserController");
const auth = require("../Middleware/auth");
const validate = require("../Middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("business_name").trim().notEmpty().withMessage("Business name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  catchAsync(controller.register)
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  catchAsync(controller.login)
);

router.get("/profile", auth, catchAsync(controller.getProfile));
router.patch("/webhook-url", auth, [body("webhook_url").isURL({ require_tld: false })], validate, catchAsync(controller.updateWebhookUrl));
router.post("/regenerate-keys", auth, catchAsync(controller.regenerateKeys));

module.exports = router;
