/**
 * OWNER: Person 3 (Payments). Person 4 and Person 5 call these functions, do not rename them.
 *
 * Functions that take "client" run inside a database transaction started by the caller:
 *   const client = await pool.connect(); await client.query("BEGIN"); ...
 * Functions without "client" use the shared pool.
 */
const pool = require("../Config/databaseConfig");
const notImplemented = require("../Utility/notImplemented");

/**
 * create({ reference, merchantId, email, amount, currency, callbackUrl, metadata, expiresAt })
 * -> new transaction row
 */
const create = async (data) => notImplemented("Transactions.create");

/** findByReference(reference) -> transaction row or undefined */
const findByReference = async (reference) => notImplemented("Transactions.findByReference");

/** findById(id) -> transaction row or undefined */
const findById = async (id) => notImplemented("Transactions.findById");

/**
 * findByReferenceForUpdate(client, reference) -> transaction row or undefined
 * Uses SELECT ... FOR UPDATE so two requests cannot process the same payment twice.
 */
const findByReferenceForUpdate = async (client, reference) =>
  notImplemented("Transactions.findByReferenceForUpdate");

/**
 * updateStatus(client, id, { status, failureReason, cardLast4, cardBrand, paidAt })
 * -> updated transaction row. Also sets updated_at = NOW().
 */
const updateStatus = async (client, id, fields) => notImplemented("Transactions.updateStatus");

/**
 * listByMerchant(merchantId, { status, from, to, page, limit })
 * -> { rows, total }
 */
const listByMerchant = async (merchantId, filters) => notImplemented("Transactions.listByMerchant");

/** listAll({ status, from, to, page, limit }) -> { rows, total }. Used by admin. */
const listAll = async (filters) => notImplemented("Transactions.listAll");

/** stats() -> { total, success, failed, pending, volume }. Used by admin. */
const stats = async () => notImplemented("Transactions.stats");

module.exports = {
  create,
  findByReference,
  findById,
  findByReferenceForUpdate,
  updateStatus,
  listByMerchant,
  listAll,
  stats,
};
