/**
 * OWNER: Person 4 (Checkout and Simulator)
 * These endpoints are PUBLIC (no API key), they are used by the checkout page.
 *
 * getCheckout: return only what the page needs: merchant business_name, amount,
 *              currency, status, expires_at. Never return keys or internal ids.
 * pay:         call PaymentService.processPayment(req.params.reference, req.body).
 * cancel:      call PaymentService.cancelPayment(req.params.reference).
 */
const Transactions = require("../Models/Transactions");
const PaymentService = require("../Services/PaymentService");
const { success } = require("../Utility/response");
const AppError = require("../Utility/AppError");
const notImplemented = require("../Utility/notImplemented");

exports.getCheckout = async (req, res) => notImplemented("CheckoutController.getCheckout");
exports.pay = async (req, res) => notImplemented("CheckoutController.pay");
exports.cancel = async (req, res) => notImplemented("CheckoutController.cancel");
