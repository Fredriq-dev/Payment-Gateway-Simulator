// A fake merchant server that receives webhooks, for demos and testing.
// Mount in app.js:  app.use('/mock-merchant', require('./Routes/MockMerchantRoute'));
// Set the merchant's webhook_url to http://localhost:<PORT>/mock-merchant/webhook
// Put the merchant's secret key in .env as MOCK_MERCHANT_SECRET to enable signature checking.
//
// Test the retry logic by adding query params to the webhook URL:
//   /mock-merchant/webhook?status=500      -> always fails with 500
//   /mock-merchant/webhook?delay=10000     -> responds after 10s (triggers timeout)
const express = require('express');
const { verifySignature } = require('../Utility/signature');

const router = express.Router();
const received = []; // in-memory only

// Capture the exact raw body. (If app.js already ran express.json(), we fall back below.)
router.use(express.raw({ type: '*/*' }));

router.post('/webhook', async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
  const secret = process.env.MOCK_MERCHANT_SECRET;
  const signatureHeader = req.get('X-Gateway-Signature');

  let signatureValid = null; // null = not checked
  if (secret) signatureValid = verifySignature(rawBody, signatureHeader, secret);

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = rawBody;
  }

  received.unshift({
    received_at: new Date().toISOString(),
    event: req.get('X-Gateway-Event'),
    signature_valid: signatureValid,
    body,
  });
  if (received.length > 50) received.pop();

  console.log(`[MockMerchant] ${req.get('X-Gateway-Event')} | signature valid: ${signatureValid}`);

  const delay = Number(req.query.delay);
  if (delay) await new Promise((r) => setTimeout(r, delay));

  if (signatureValid === false) return res.status(401).json({ received: false, error: 'Invalid signature' });

  const forced = Number(req.query.status);
  if (forced) return res.status(forced).json({ received: false, error: 'Forced failure' });

  res.status(200).json({ received: true });
});

router.get('/received', (req, res) => res.json({ count: received.length, data: received }));
router.delete('/received', (req, res) => {
  received.length = 0;
  res.json({ cleared: true });
});

module.exports = router;