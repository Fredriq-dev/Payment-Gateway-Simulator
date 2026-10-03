/**
 * OWNER: Person 2 (Accounts and Admin)
 * Generates a public and secret API key pair for a merchant.
 */
const crypto = require("crypto");

const generateKeys = () => ({
  publicKey: `pk_test_${crypto.randomBytes(16).toString("hex")}`,
  secretKey: `sk_test_${crypto.randomBytes(24).toString("hex")}`,
});

module.exports = generateKeys;
