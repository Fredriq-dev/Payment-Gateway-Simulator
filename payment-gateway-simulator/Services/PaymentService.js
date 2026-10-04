/**
 * OWNER: Person 4 (Checkout and Simulator)
 *
 * CONTRACT: processPayment(reference, card) -> updated transaction row
 *   card = { number, expiry, cvv, name }
 *
 * Every change runs inside one database transaction, with the transaction row
 * locked (SELECT ... FOR UPDATE) so two requests cannot process the same
 * payment twice.
 *
 *   processPayment errors: 404 not found, 409 not pending, 410 expired.
 *   A card that stays "pending" (4000000000000119) changes no status. The row is
 *   returned as it is and only an event is logged, so the caller can see the
 *   status is still pending.
 *
 * cancelPayment(reference) -> pending moves to abandoned.
 *
 * Webhooks are dispatched AFTER the database commit and are never awaited, so a
 * slow or failing merchant server cannot hold up or undo a payment.
 */
const pool = require("../Config/databaseConfig");
const AppError = require("../Utility/AppError");
const SimulatorService = require("./SimulatorService");
const WebhookService = require("./WebhookService");
const Transactions = require("../Models/Transactions");
const TransactionEvents = require("../Models/TransactionEvents");
const { TRANSACTION_STATUS, canTransition } = require("../Config/constants");

/** Runs work(client) inside BEGIN / COMMIT, rolls back on any error, always releases. */
const withTransaction = async (work) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/** Locks the row and makes sure it exists and is still pending. */
const lockPending = async (client, reference) => {
  const txn = await Transactions.findByReferenceForUpdate(client, reference);
  if (!txn) throw new AppError("Transaction not found", 404);
  if (txn.status !== TRANSACTION_STATUS.PENDING) {
    throw new AppError(`Transaction is already ${txn.status}`, 409);
  }
  return txn;
};

const isExpired = (txn) => new Date(txn.expires_at) <= new Date();

/** Fire and forget. Errors are logged, never thrown. */
const notifyWebhook = (transactionId) => {
  Promise.resolve()
    .then(() => WebhookService.dispatch(transactionId))
    .catch((err) => console.error("Webhook dispatch failed:", err.message));
};

/** Moves a pending transaction to abandoned and logs the event. */
const abandon = async (client, txn, reason) => {
  const updated = await Transactions.updateStatus(client, txn.id, {
    status: TRANSACTION_STATUS.ABANDONED,
    failureReason: reason,
    cardLast4: null,
    cardBrand: null,
    paidAt: null,
  });

  await TransactionEvents.add(client, {
    transactionId: txn.id,
    fromStatus: txn.status,
    toStatus: TRANSACTION_STATUS.ABANDONED,
    note: reason,
  });

  return updated;
};

/** Runs the simulator and records the result. Only the last 4 digits are stored. */
const applyOutcome = async (client, txn, card) => {
  const outcome = await SimulatorService.run(card.number);

  if (outcome.status === TRANSACTION_STATUS.PENDING) {
    await TransactionEvents.add(client, {
      transactionId: txn.id,
      fromStatus: txn.status,
      toStatus: txn.status,
      note: `Payment left pending: ${outcome.reason}`,
    });
    return txn;
  }

  if (!canTransition(txn.status, outcome.status)) {
    throw new AppError(
      `Cannot change status from ${txn.status} to ${outcome.status}`,
      409
    );
  }

  const isSuccess = outcome.status === TRANSACTION_STATUS.SUCCESS;
  const last4 = String(card.number).replace(/\D/g, "").slice(-4);

  const updated = await Transactions.updateStatus(client, txn.id, {
    status: outcome.status,
    failureReason: isSuccess ? null : outcome.reason,
    cardLast4: last4,
    cardBrand: outcome.brand,
    paidAt: isSuccess ? new Date() : null,
  });

  await TransactionEvents.add(client, {
    transactionId: txn.id,
    fromStatus: txn.status,
    toStatus: outcome.status,
    note: isSuccess ? "Payment successful" : `Payment failed: ${outcome.reason}`,
  });

  return updated;
};

const processPayment = async (reference, card) => {
  const result = await withTransaction(async (client) => {
    const txn = await lockPending(client, reference);

    if (isExpired(txn)) {
      return { expired: await abandon(client, txn, "Transaction expired") };
    }

    return { txn: await applyOutcome(client, txn, card) };
  });

  // The expiry update is committed before the error is thrown, so it is kept.
  if (result.expired) {
    notifyWebhook(result.expired.id);
    throw new AppError("Transaction has expired", 410);
  }

  if (result.txn.status !== TRANSACTION_STATUS.PENDING) {
    notifyWebhook(result.txn.id);
  }

  return result.txn;
};

const cancelPayment = async (reference) => {
  const txn = await withTransaction(async (client) => {
    const locked = await lockPending(client, reference);
    return abandon(client, locked, "Cancelled by customer");
  });

  notifyWebhook(txn.id);
  return txn;
};

module.exports = { processPayment, cancelPayment };
