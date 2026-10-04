/**
 * OWNER: Person 5 (Webhooks)
 * PostgreSQL version. Column names in the table differ slightly from the names the
 * service uses, so every SELECT renames them back:
 *   event -> event_type, attempt -> attempts, response_status -> response_code
 * Ids are UUID strings.
 */
const pool = require("../Config/databaseConfig");

const COLUMNS = `
  id, transaction_id, merchant_id, url, payload, status, success, created_at,
  event AS event_type,
  attempt AS attempts,
  response_status AS response_code,
  response_body, error_message, next_retry_at
`;

const WebhookLogs = {
  /** Creates a pending log row and returns its id. */
  async create({ transactionId = null, merchantId, eventType, url, payload }) {
    const body = typeof payload === "string" ? payload : JSON.stringify(payload);
    const { rows } = await pool.query(
      `INSERT INTO webhook_logs (transaction_id, merchant_id, event, url, payload, status, attempt)
       VALUES ($1, $2, $3, $4, $5::jsonb, 'pending', 0)
       RETURNING id`,
      [transactionId, merchantId, eventType, url, body]
    );
    return rows[0].id;
  },

  async findById(id) {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM webhook_logs WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async findByMerchant(merchantId, { status, limit = 20, offset = 0 } = {}) {
    const params = [merchantId];
    let sql = `SELECT ${COLUMNS} FROM webhook_logs WHERE merchant_id = $1`;
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    params.push(Number(limit), Number(offset));
    sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async findByTransaction(transactionId) {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM webhook_logs WHERE transaction_id = $1 ORDER BY created_at DESC`,
      [transactionId]
    );
    return rows;
  },

  /** Pending logs that have been tried at least once and whose retry time has arrived. */
  async findDueRetries(limit = 20) {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM webhook_logs
       WHERE status = 'pending' AND attempt > 0 AND next_retry_at <= NOW()
       ORDER BY next_retry_at ASC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  /** Marks a pending log as 'sending' so two workers never send the same one twice. */
  async claim(id) {
    const result = await pool.query(
      "UPDATE webhook_logs SET status = 'sending' WHERE id = $1 AND status = 'pending'",
      [id]
    );
    return result.rowCount === 1;
  },

  async recordAttempt(id, { status, attempts, responseCode, responseBody, errorMessage, nextRetryAt }) {
    await pool.query(
      `UPDATE webhook_logs
       SET status = $2, attempt = $3, response_status = $4, response_body = $5,
           error_message = $6, next_retry_at = $7, success = $8
       WHERE id = $1`,
      [
        id,
        status,
        attempts,
        responseCode ?? null,
        responseBody ?? null,
        errorMessage ?? null,
        nextRetryAt ?? null,
        status === "success",
      ]
    );
  },
};

module.exports = WebhookLogs;
