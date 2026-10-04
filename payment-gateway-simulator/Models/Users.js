/**
 * OWNER: Person 2 (Accounts and Admin)
 * Every function returns a user row (or undefined). Keep these names, others depend on them.
 */

const pool = require('../Config/databaseConfig');
const notImplemented = require("../Utility/notImplemented");

// Create a new user
const createUser = async (email, passwordHash, publicKey, secretKey, businessName, role) => {
  const query = `
    INSERT INTO users (email, password_hash, public_key, secret_key, business_name, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`;
  const values = [email, passwordHash, publicKey, secretKey, businessName, role];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
// Find user by email
const findByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows[0];
};

// Find user by ID
const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
};

// 🔑 Find user by secret key (used in apiKeyAuth.js)
const findBySecretKey = async (secretKey) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE secret_key = $1',
    [secretKey]
  );
  return rows[0];
};

// 🌐 Update webhook URL for a merchant
const updateWebhookUrl = async (id, url) => {
  const query = `
    UPDATE users SET webhook_url = $2 WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(query, [id, url]);
  return rows[0];
};

// 🔄 Update API keys for a merchant
const updateKeys = async (id, publicKey, secretKey) => {
  const query = `
    UPDATE users SET public_key=$2, secret_key=$3 WHERE id=$1 RETURNING *`;
  const { rows } = await pool.query(query, [id, publicKey, secretKey]);
  return rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  findBySecretKey,
  updateWebhookUrl,
  updateKeys
};


// /** create({ businessName, email, passwordHash, role, publicKey, secretKey }) -> user row */
// const create = async (data) => notImplemented("Users.create");

// /** findByEmail(email) -> user row or undefined */
// const findByEmail = async (email) => notImplemented("Users.findByEmail");

// /** findById(id) -> user row or undefined */
// const findById = async (id) => notImplemented("Users.findById");

// /** findBySecretKey(secretKey) -> user row or undefined. Used by apiKeyAuth.js */
// const findBySecretKey = async (secretKey) => notImplemented("Users.findBySecretKey");

// /** updateWebhookUrl(id, url) -> updated user row */
// const updateWebhookUrl = async (id, url) => notImplemented("Users.updateWebhookUrl");

// /** updateKeys(id, publicKey, secretKey) -> updated user row */
// const updateKeys = async (id, publicKey, secretKey) => notImplemented("Users.updateKeys");

// module.exports = { create, findByEmail, findById, findBySecretKey, updateWebhookUrl, updateKeys };
