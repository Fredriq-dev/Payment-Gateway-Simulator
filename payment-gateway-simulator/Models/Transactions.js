
const pool = require("../Config/databaseConfig");
const notImplemented = require("../Utility/notImplemented");

/**
 * create({ reference, merchantId, email, amount, currency, callbackUrl, metadata, expiresAt })
 * -> new transaction row
 */
const create = async ({
  reference,
  merchantId,
  email,
  amount,
  currency,
  callbackUrl,
  metadata,
  expiresAt,
}) => {
  const result = await pool.query(
    `
      INSERT INTO transactions (
        reference,
        merchant_id,
        customer_email,
        amount,
        currency,
        callback_url,
        metadata,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    [
      reference,
      merchantId,
      email,
      amount,
      currency,
      callbackUrl,
      metadata,
      expiresAt,
    ]
  );

  return result.rows[0];
};

/** findByReference(reference) -> transaction row or undefined */
const findByReference = async (reference) => {
  const result = await pool.query(
    `
      SELECT *
      FROM transactions
      WHERE reference = $1
      LIMIT 1;
    `,
    [reference]
  );

  return result.rows[0];
};

/** findById(id) -> transaction row or undefined */
const findById = async (id) => {
  const result = await pool.query(
    `
      SELECT *
      FROM transactions
      WHERE id = $1
      LIMIT 1;
    `,
    [id]
  );

  return result.rows[0];
};

/**
 * findByReferenceForUpdate(client, reference) -> transaction row or undefined
 * Uses SELECT ... FOR UPDATE so two requests cannot process the same payment twice.
 */
const findByReferenceForUpdate = async (client, reference) => {
  const result = await client.query(
    `
      SELECT *
      FROM transactions
      WHERE reference = $1
      LIMIT 1
      FOR UPDATE;
    `,
    [reference]
  );

  return result.rows[0];
};

/**
 * updateStatus(client, id, { status, failureReason, cardLast4, cardBrand, paidAt })
 * -> updated transaction row. Also sets updated_at = NOW().
 */
const updateStatus = async (client, id, fields) => {
  const {
    status,
    failureReason,
    cardLast4,
    cardBrand,
    paidAt,
  } = fields;

  const result = await client.query(
    `
      UPDATE transactions
      SET
        status = $1,
        failure_reason = $2,
        card_last4 = $3,
        card_brand = $4,
        paid_at = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `,
    [
      status,
      failureReason,
      cardLast4,
      cardBrand,
      paidAt,
      id,
    ]
  );

  return result.rows[0];
};
/**
 * listByMerchant(merchantId, { status, from, to, page, limit })
 * -> { rows, total }
 */
const listByMerchant = async (
  merchantId,
  { status, from, to, page = 1, limit = 20 } = {}
) => {
  const offset = (page - 1) * limit;

  const values = [merchantId];
  const conditions = ["merchant_id = $1"];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (from) {
    values.push(from);
    conditions.push(`created_at >= $${values.length}`);
  }

  if (to) {
    values.push(to);
    conditions.push(`created_at <= $${values.length}`);
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM transactions
      WHERE ${whereClause};
    `,
    values
  );

  const dataValues = [...values, limit, offset];

  const result = await pool.query(
    `
      SELECT *
      FROM transactions
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length};
    `,
    dataValues
  );

  return {
    rows: result.rows,
    total: countResult.rows[0].total,
  };
};

/** listAll({ status, from, to, page, limit }) -> { rows, total }. Used by admin. */
const listAll = async (
  { status, from, to, page = 1, limit = 20 } = {}
) => {
  const offset = (page - 1) * limit;

  const values = [];
  const conditions = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (from) {
    values.push(from);
    conditions.push(`created_at >= $${values.length}`);
  }

  if (to) {
    values.push(to);
    conditions.push(`created_at <= $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM transactions
      ${whereClause};
    `,
    values
  );

  const dataValues = [...values, limit, offset];

  const result = await pool.query(
    `
      SELECT *
      FROM transactions
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length};
    `,
    dataValues
  );

  return {
    rows: result.rows,
    total: countResult.rows[0].total,
  };
};

/** stats() -> { total, success, failed, pending, volume }. Used by admin. */
const stats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'success')::int AS success,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COALESCE(
        SUM(amount) FILTER (WHERE status = 'success'),
        0
      ) AS volume
    FROM transactions;
  `);

  return result.rows[0];
};
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
