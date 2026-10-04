/**
 * OWNER: Person 2 (Accounts and Admin)
 * Every function returns a user row (or undefined). Keep these names, others depend on them.
 */
const pool = require("../Config/databaseConfig");

/** create({ businessName, email, passwordHash, role, publicKey, secretKey }) -> user row */
const create = async ({ businessName, email, passwordHash, role = "merchant", publicKey, secretKey }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (business_name, email, password_hash, role, public_key, secret_key)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [businessName, email, passwordHash, role, publicKey, secretKey]
  );
  return rows[0];
};

/** findByEmail(email) -> user row or undefined */
const findByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0];
};

/** findById(id) -> user row or undefined */
const findById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0];
};

/** findBySecretKey(secretKey) -> user row or undefined. Used by apiKeyAuth.js */
const findBySecretKey = async (secretKey) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE secret_key = $1", [secretKey]);
  return rows[0];
};

/** updateWebhookUrl(id, url) -> updated user row */
const updateWebhookUrl = async (id, url) => {
  const { rows } = await pool.query(
    "UPDATE users SET webhook_url = $2 WHERE id = $1 RETURNING *",
    [id, url]
  );
  return rows[0];
};

/** updateKeys(id, publicKey, secretKey) -> updated user row */
const updateKeys = async (id, publicKey, secretKey) => {
  const { rows } = await pool.query(
    "UPDATE users SET public_key = $2, secret_key = $3 WHERE id = $1 RETURNING *",
    [id, publicKey, secretKey]
  );
  return rows[0];
};

/** listAll() -> every user, newest first. Used by the admin. No keys or password hashes. */
const listAll = async () => {
  const { rows } = await pool.query(
    `SELECT id, business_name, email, role, webhook_url, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  return rows;
};

module.exports = {
  create,
  createUser: create,
  findByEmail,
  findById,
  findBySecretKey,
  updateWebhookUrl,
  updateKeys,
  listAll,
};
