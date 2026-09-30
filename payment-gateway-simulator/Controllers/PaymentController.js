/**
 * OWNER: Person 3 (Payments)
 */

const Transactions = require("../Models/Transactions");
const TransactionEvents = require("../Models/TransactionEvents");
const generateReference = require("../Utility/generateReference");
const { success } = require("../Utility/response");
const AppError = require("../Utility/AppError");
const pool = require("../Config/databaseConfig");

exports.initiate = async (req, res) => {
  const {
    amount,
    currency = "NGN",
    email,
    callback_url,
    metadata = {},
  } = req.body;

  const reference = generateReference();

  const expiresAt = new Date(
    Date.now() +
      Number(process.env.TRANSACTION_EXPIRY_MINUTES || 30) * 60 * 1000
  );

  const transaction = await Transactions.create({
    reference,
    merchantId: req.merchant.id,
    email,
    amount,
    currency,
    callbackUrl: callback_url,
    metadata,
    expiresAt,
  });

  return success(
    res,
    "Payment initiated",
    {
      reference: transaction.reference,
      payment_url: `${process.env.CHECKOUT_BASE_URL}/${transaction.reference}`,
      expires_at: transaction.expires_at,
    },
    201
  );
};

exports.verify = async (req, res) => {
  const { reference } = req.params;

  const transaction = await Transactions.findByReference(reference);

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.merchant_id !== req.merchant.id) {
    throw new AppError("Transaction not found", 404);
  }

  return success(res, "Payment details retrieved", {
    reference: transaction.reference,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    email: transaction.customer_email,
    callback_url: transaction.callback_url,
    metadata: transaction.metadata,
    failure_reason: transaction.failure_reason,
    card_last4: transaction.card_last4,
    card_brand: transaction.card_brand,
    paid_at: transaction.paid_at,
    expires_at: transaction.expires_at,
    created_at: transaction.created_at,
    updated_at: transaction.updated_at,
  });
};

exports.list = async (req, res) => {
  const result = await Transactions.listByMerchant(
    req.merchant.id,
    req.query
  );

  return success(res, "Payments retrieved", {
    transactions: result.rows,
    total: result.total,
  });
};

exports.refund = async (req, res) => {
  const { reference } = req.params;

  const transaction = await Transactions.findByReference(reference);

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.merchant_id !== req.merchant.id) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.status !== "success") {
    throw new AppError(
      "Only successful payments can be refunded",
      400
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const lockedTransaction =
      await Transactions.findByReferenceForUpdate(
        client,
        reference
      );

    if (!lockedTransaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (lockedTransaction.status !== "success") {
      throw new AppError(
        "Only successful payments can be refunded",
        400
      );
    }

    const updatedTransaction = await Transactions.updateStatus(
      client,
      lockedTransaction.id,
      {
        status: "refunded",
        failureReason: null,
        cardLast4: lockedTransaction.card_last4,
        cardBrand: lockedTransaction.card_brand,
        paidAt: lockedTransaction.paid_at,
      }
    );

    await TransactionEvents.add(client, {
      transactionId: lockedTransaction.id,
      fromStatus: "success",
      toStatus: "refunded",
      note: "Payment refunded",
    });

    await client.query("COMMIT");

    return success(res, "Payment refunded", {
      reference: updatedTransaction.reference,
      status: updatedTransaction.status,
      amount: updatedTransaction.amount,
      currency: updatedTransaction.currency,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};