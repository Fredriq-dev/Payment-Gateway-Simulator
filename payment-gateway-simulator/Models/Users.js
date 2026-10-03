/**
 * OWNER: Person 2 (Accounts and Admin)
 * Every function returns a user row (or undefined). Keep these names, others depend on them.
 */
const pool = require("../Config/databaseConfig");
const notImplemented = require("../Utility/notImplemented");

/** create({ businessName, email, passwordHash, role, publicKey, secretKey }) -> user row */
const create = async (data) => notImplemented("Users.create");

/** findByEmail(email) -> user row or undefined */
const findByEmail = async (email) => notImplemented("Users.findByEmail");

/** findById(id) -> user row or undefined */
const findById = async (id) => notImplemented("Users.findById");

/** findBySecretKey(secretKey) -> user row or undefined. Used by apiKeyAuth.js */
const findBySecretKey = async (secretKey) => notImplemented("Users.findBySecretKey");

/** updateWebhookUrl(id, url) -> updated user row */
const updateWebhookUrl = async (id, url) => notImplemented("Users.updateWebhookUrl");

/** updateKeys(id, publicKey, secretKey) -> updated user row */
const updateKeys = async (id, publicKey, secretKey) => notImplemented("Users.updateKeys");

module.exports = { create, findByEmail, findById, findBySecretKey, updateWebhookUrl, updateKeys };
