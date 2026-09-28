/**
 * OWNER: Person 4 (Checkout and Simulator)
 *
 * CONTRACT: processPayment(reference, card) -> updated transaction row
 *   card = { number, expiry, cvv, name }
 *
 * Steps:
 *   1. const client = await pool.connect(); await client.query("BEGIN");
 *   2. Transactions.findByReferenceForUpdate(client, reference)
 *   3. Throw AppError 404 if missing, 409 if status is not "pending", 410 if expired
 *   4. SimulatorService.run(card.number)
 *   5. Transactions.updateStatus(client, txn.id, { ... last4 only, never the full number })
 *   6. TransactionEvents.add(client, { ... })
 *   7. COMMIT, then WebhookService.dispatch(txn.id) WITHOUT await
 *   8. On error: ROLLBACK, rethrow. Always client.release() in finally.
 *
 * Also owns: cancelPayment(reference) and expiry handling (pending past expires_at -> abandoned).
 */
const pool = require("../Config/databaseConfig");
const AppError = require("../Utility/AppError");
const SimulatorService = require("./SimulatorService");
const WebhookService = require("./WebhookService");
const Transactions = require("../Models/Transactions");
const TransactionEvents = require("../Models/TransactionEvents");
const notImplemented = require("../Utility/notImplemented");

const processPayment = async (reference, card) => notImplemented("PaymentService.processPayment");

const cancelPayment = async (reference) => notImplemented("PaymentService.cancelPayment");

module.exports = { processPayment, cancelPayment };
