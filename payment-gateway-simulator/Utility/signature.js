// HMAC-SHA256 signing for outgoing webhooks (Stripe-style header: t=<unix>,v1=<hex>)
const crypto = require('crypto');

const TOLERANCE_SECONDS = 300; // reject signatures older than 5 minutes (replay protection)

function computeSignature(timestamp, rawBody, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
}

// rawBody MUST be the exact string you send as the HTTP body
function signPayload(rawBody, secret, timestamp = Math.floor(Date.now() / 1000)) {
  const signature = computeSignature(timestamp, rawBody, secret);
  return { timestamp, signature, header: `t=${timestamp},v1=${signature}` };
}

// Used by the mock merchant (and by real merchants) to verify a webhook
function verifySignature(rawBody, header, secret, tolerance = TOLERANCE_SECONDS) {
  if (!header || !secret) return false;

  const parts = {};
  header.split(',').forEach((p) => {
    const [k, v] = p.split('=');
    parts[k.trim()] = (v || '').trim();
  });

  const timestamp = Number(parts.t);
  const received = parts.v1;
  if (!timestamp || !received) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > tolerance) return false;

  const expected = computeSignature(timestamp, rawBody, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { signPayload, verifySignature, computeSignature };