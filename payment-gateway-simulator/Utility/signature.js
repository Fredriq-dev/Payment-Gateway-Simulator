/**
 * OWNER: Person 5 (Webhooks)
 * HMAC SHA256 signing so merchants can verify a webhook came from the gateway.
 */
const crypto = require("crypto");

const sign = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");

const verify = (payload, secret, signature) => {
  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(String(signature || ""));
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

module.exports = { sign, verify };
