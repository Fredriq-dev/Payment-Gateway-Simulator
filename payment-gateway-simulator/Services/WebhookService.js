/**
 * OWNER: Person 5 (Webhooks)
 *
 * CONTRACT: dispatch(transactionId) -> Promise<void>
 * Person 4 calls this after a payment finishes and does NOT wait for it.
 *
 * Steps:
 *   1. Load the transaction (Transactions.findById) and its merchant (Users.findById)
 *   2. Use transaction.callback_url, falling back to merchant.webhook_url. Stop if neither exists.
 *   3. Build payload: { event, data: { reference, amount, currency, status, paid_at, metadata } }
 *      Event names are in Config/constants.js (WEBHOOK_EVENTS).
 *   4. Sign it: sign(payload, merchant.secret_key) from Utility/signature.js
 *   5. POST with axios, header "x-gateway-signature", timeout 5 seconds
 *   6. Log every attempt with WebhookLogs.create
 *   7. On failure, retry up to WEBHOOK_MAX_ATTEMPTS using setTimeout (0s, 30s, 2min)
 *
 * resend(transactionId) -> triggers a fresh delivery manually.
 */
const axios = require("axios");
const { sign } = require("../Utility/signature");
const Transactions = require("../Models/Transactions");
const Users = require("../Models/Users");
const WebhookLogs = require("../Models/WebhookLogs");
const { WEBHOOK_EVENTS } = require("../Config/constants");

const dispatch = async (transactionId) => {
  // STUB: Person 5 replaces this. It only logs so Person 4 can keep working.
  console.log(`[STUB] WebhookService.dispatch called for transaction ${transactionId}`);
};

const resend = async (transactionId) => {
  console.log(`[STUB] WebhookService.resend called for transaction ${transactionId}`);
};

module.exports = { dispatch, resend };
