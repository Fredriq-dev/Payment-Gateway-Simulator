// Assumes Config/databaseConfig.js exports a mysql2 promise pool.
// If it exports something else, only the `db.query` calls below need adjusting.
const db = require('../Config/databaseConfig');

const WebhookLogs = {
  async create({ transactionId = null, merchantId, eventType, url, payload }) {
    const [result] = await db.query(
      `INSERT INTO webhook_logs (transaction_id, merchant_id, event_type, url, payload, status, attempts)
       VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
      [transactionId, merchantId, eventType, url, typeof payload === 'string' ? payload : JSON.stringify(payload)]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM webhook_logs WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByMerchant(merchantId, { status, limit = 20, offset = 0 } = {}) {
    const params = [merchantId];
    let sql = 'SELECT * FROM webhook_logs WHERE merchant_id = ?';
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findByTransaction(transactionId) {
    const [rows] = await db.query(
      'SELECT * FROM webhook_logs WHERE transaction_id = ? ORDER BY id DESC',
      [transactionId]
    );
    return rows;
  },

  async findDueRetries(limit = 20) {
    const [rows] = await db.query(
      `SELECT * FROM webhook_logs
       WHERE status = 'pending' AND attempts > 0 AND next_retry_at <= ?
       ORDER BY next_retry_at ASC LIMIT ?`,
      [new Date(), limit]
    );
    return rows;
  },

  // Atomically mark as 'sending' so two workers never send the same log twice
  async claim(id) {
    const [result] = await db.query(
      "UPDATE webhook_logs SET status = 'sending' WHERE id = ? AND status = 'pending'",
      [id]
    );
    return result.affectedRows === 1;
  },

  async recordAttempt(id, { status, attempts, responseCode, responseBody, errorMessage, nextRetryAt }) {
    await db.query(
      `UPDATE webhook_logs
       SET status = ?, attempts = ?, response_code = ?, response_body = ?,
           error_message = ?, next_retry_at = ?
       WHERE id = ?`,
      [status, attempts, responseCode ?? null, responseBody ?? null, errorMessage ?? null, nextRetryAt ?? null, id]
    );
  },
};

module.exports = WebhookLogs;
