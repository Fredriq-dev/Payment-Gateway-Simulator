
const pool = require("../Config/databaseConfig");
const notImplemented = require("../Utility/notImplemented");

/** add(client, { transactionId, fromStatus, toStatus, note }) -> event row */
const add = async (
  client,
  { transactionId, fromStatus, toStatus, note }
) => {
  const result = await client.query(
    `
      INSERT INTO transaction_events (
        transaction_id,
        from_status,
        to_status,
        note
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    [transactionId, fromStatus, toStatus, note]
  );

  return result.rows[0];
};

/** listByTransaction(transactionId) -> array of event rows, oldest first */
const listByTransaction = async (transactionId) => {
  const result = await pool.query(
    `
      SELECT *
      FROM transaction_events
      WHERE transaction_id = $1
      ORDER BY created_at ASC;
    `,
    [transactionId]
  );

  return result.rows;
};

module.exports = { add, listByTransaction };