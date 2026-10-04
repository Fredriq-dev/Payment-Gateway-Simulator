/**
 * OWNER: Person 2 (Accounts and Admin)
 * Generates a public and secret API key pair for a merchant.
 *   Public key: pk_test_ + 32 random hex characters (safe to share)
 *   Secret key: sk_test_ + 48 random hex characters (server side only)
 * Each key gets its own random value, so one cannot be worked out from the other.
 */
const crypto = require("crypto");

function generateKeys() {
  const publicKey = `pk_test_${crypto.randomBytes(16).toString("hex")}`;
  const secretKey = `sk_test_${crypto.randomBytes(24).toString("hex")}`;
  return { publicKey, secretKey };
}

module.exports = generateKeys;


// const generateKeys = () => ({
//   publicKey: `pk_test_${crypto.randomBytes(16).toString("hex")}`,
//   secretKey: `sk_test_${crypto.randomBytes(24).toString("hex")}`,
// });
