/**
 * OWNER: Person 2 (Accounts and Admin)
 * Generates a public and secret API key pair for a merchant.
 */

const crypto = require('crypto');

/**
 * Generates random API keys for merchants.
 * Format:
 *   - Public Key: pk_test_<randomstring>
 *   - Secret Key: sk_test_<randomstring>
 */
function generateKeys() {
  const randomString = crypto.randomBytes(16).toString('hex'); // 32-char hex string
  const publicKey = `pk_test_${randomString}`;
  const secretKey = `sk_test_${randomString}`;
  return { publicKey, secretKey };
}

module.exports = generateKeys;

// const generateKeys = () => ({
//   publicKey: `pk_test_${crypto.randomBytes(16).toString("hex")}`,
//   secretKey: `sk_test_${crypto.randomBytes(24).toString("hex")}`,
// });
