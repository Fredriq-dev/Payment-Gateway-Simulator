/**
 * OWNER: Person 3 (Payments)
 *
 * initiate: validate amount (positive integer in kobo), currency and email.
 *           reference = generateReference(), expiresAt = now + TRANSACTION_EXPIRY_MINUTES.
 *           Save with Transactions.create using req.merchant.id from apiKeyAuth.
 *           Respond 201 with { reference, payment_url, expires_at }.
 *           payment_url = `${process.env.CHECKOUT_BASE_URL}/${reference}`
 * verify:   find by reference, make sure it belongs to req.merchant.id, return status and details.
 * list:     Transactions.listByMerchant(req.merchant.id, req.query) with pagination.
 * refund:   stretch goal.
 */
const Transactions = require("../Models/Transactions");
const TransactionEvents = require("../Models/TransactionEvents");
const generateReference = require("../Utility/generateReference");
const { success } = require("../Utility/response");
const AppError = require("../Utility/AppError");
const notImplemented = require("../Utility/notImplemented");

exports.initiate = async (req, res) => notImplemented("PaymentController.initiate");
exports.verify = async (req, res) => notImplemented("PaymentController.verify");
exports.list = async (req, res) => notImplemented("PaymentController.list");
exports.refund = async (req, res) => notImplemented("PaymentController.refund");
