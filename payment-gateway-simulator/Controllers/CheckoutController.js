/**
 * OWNER: Person 4 (Checkout and Simulator)
 * These endpoints are PUBLIC (no API key), they are used by the checkout page.
 *
 * getCheckout: returns only what the page needs: merchant business_name, amount,
 *              currency, status, expires_at. Never keys or internal ids.
 * pay:         calls PaymentService.processPayment. A declined card is a normal
 *              outcome, so it answers 200 with status "failed" and the reason.
 * cancel:      calls PaymentService.cancelPayment.
 */
const Transactions = require("../Models/Transactions");
const PaymentService = require("../Services/PaymentService");
const { success } = require("../Utility/response");
const AppError = require("../Utility/AppError");

exports.getCheckout = async (req, res) => {
  const checkout = await Transactions.findCheckoutByReference(req.params.reference);
  if (!checkout) throw new AppError("Transaction not found", 404);

  return success(res, "Checkout details", {
    reference: checkout.reference,
    business_name: checkout.business_name,
    // BIGINT columns arrive from pg as strings, so convert for the page.
    amount: Number(checkout.amount),
    currency: checkout.currency,
    status: checkout.status,
    expires_at: checkout.expires_at,
  });
};

exports.pay = async (req, res) => {
  const txn = await PaymentService.processPayment(req.params.reference, req.body);

  const messages = {
    success: "Payment successful",
    failed: "Payment failed",
    pending: "Payment is still processing",
  };

  return success(res, messages[txn.status] || "Payment processed", {
    reference: txn.reference,
    status: txn.status,
    failure_reason: txn.failure_reason,
  });
};

exports.cancel = async (req, res) => {
  const txn = await PaymentService.cancelPayment(req.params.reference);

  return success(res, "Payment cancelled", {
    reference: txn.reference,
    status: txn.status,
  });
};
