/** OWNER: Person 2 (Accounts and Admin) */
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const { body } = require("express-validator");
const UserController = require("../Controllers/UserController");
const auth = require("../Middleware/auth");
const validate = require("../Middleware/validate");

const router = express.Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes (JWT required)
router.get('/profile', auth, UserController.profile);
router.post('/regenerate-keys', auth, UserController.regenerateKeys);


router.post(
  "/register",
  [
    body("business_name").trim().notEmpty().withMessage("Business name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  catchAsync(UserController.register)
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  catchAsync(UserController.login)
);

router.get("/profile", auth, catchAsync(UserController.getProfile));
router.patch("/webhook-url", auth, [body("webhook_url").isURL({ require_tld: false })], validate, catchAsync(UserController.updateWebhookUrl));
router.post("/regenerate-keys", auth, catchAsync(UserController.regenerateKeys));

module.exports = router;
