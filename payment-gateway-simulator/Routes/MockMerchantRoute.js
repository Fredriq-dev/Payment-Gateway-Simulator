/**
 * OWNER: Person 5 (Webhooks)
 * A fake merchant server. Point a merchant's webhook_url here to test callbacks locally:
 *   http://localhost:5000/api/v1/mock-merchant/webhook
 * Stretch: verify the x-gateway-signature header with Utility/signature.js.
 */
const express = require("express");

const router = express.Router();

router.post("/webhook", (req, res) => {
  console.log("[MOCK MERCHANT] Webhook received");
  console.log("Signature:", req.headers["x-gateway-signature"]);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  res.status(200).json({ received: true });
});

module.exports = router;
