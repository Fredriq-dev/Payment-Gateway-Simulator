
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const { body } = require("express-validator");
const controller = require("../Controllers/PaymentController");
const apiKeyAuth = require("../Middleware/apiKeyAuth");
const validate = require("../Middleware/validate");
const { CURRENCIES } = require("../Config/constants");

const router = express.Router();

router.use(apiKeyAuth);

router.post(
  "/initiate",
  [
    body("amount").isInt({ min: 1 }).withMessage("Amount must be a positive integer (in kobo)"),
    body("currency").optional().isIn(CURRENCIES).withMessage("Unsupported currency"),
    body("email").isEmail().withMessage("Valid customer email is required"),
    body("callback_url").optional().isURL({ require_tld: false }),
  ],
  validate,
  catchAsync(controller.initiate)
);

router.get("/verify/:reference", catchAsync(controller.verify));
router.get("/", catchAsync(controller.list));
router.post("/:reference/refund", catchAsync(controller.refund));

module.exports = router;
