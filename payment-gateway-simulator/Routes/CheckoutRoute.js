/** OWNER: Person 4 (Checkout and Simulator). Public routes, no API key. */
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const { body } = require("express-validator");
const controller = require("../Controllers/CheckoutController");
const validate = require("../Middleware/validate");

const router = express.Router();

router.get("/:reference", catchAsync(controller.getCheckout));

router.post(
  "/:reference/pay",
  [
    body("number").notEmpty().withMessage("Card number is required"),
    body("expiry").notEmpty().withMessage("Expiry is required"),
    body("cvv").isLength({ min: 3, max: 4 }).withMessage("Invalid CVV"),
  ],
  validate,
  catchAsync(controller.pay)
);

router.post("/:reference/cancel", catchAsync(controller.cancel));

module.exports = router;
