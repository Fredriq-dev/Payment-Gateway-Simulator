// Build payload -> sign -> send -> log -> retry.
//
// ASSUMPTIONS about other people's code (adjust the marked lines if they differ):
//   Models/Transactions.js  -> Transactions.findById(id)
//   Models/Users.js         -> Users.findById(id), with columns webhook_url and secret_key
const crypto = require('crypto');
const WebhookLogs = require('../Models/WebhookLogs');
const Transactions = require('../Models/Transactions'); // <-- check method name
const Users = require('../Models/Users');               // <-- check method name
const EmailService = require('./EmailService');
const { signPayload } = require('../Utility/signature');

const EVENTS = {
  CHARGE_SUCCESS: 'charge.success',
  CHARGE_FAILED: 'charge.failed',
  TEST: 'webhook.test',
};

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS_SECONDS = [10, 60, 300, 900]; // wait after attempt 1, 2, 3, 4
const TIMEOUT_MS = 8000;

function buildPayload(transaction, eventType) {
  return {
    id: `evt_${crypto.randomBytes(8).toString('hex')}`,
    event: eventType,
    created_at: new Date().toISOString(),
    data: {
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      customer_email: transaction.customer_email,
      metadata: transaction.metadata || null,
      paid_at: transaction.paid_at || null,
    },
  };
}

function getSigningSecret(merchant) {
  return merchant.secret_key || process.env.WEBHOOK_FALLBACK_SECRET || '';
}

// One delivery attempt for an existing log row
async function attempt(log) {
  const merchant = await Users.findById(log.merchant_id);
  const rawBody = typeof log.payload === 'string' ? log.payload : JSON.stringify(log.payload);
  const { header, timestamp } = signPayload(rawBody, getSigningSecret(merchant || {}));

  const attempts = log.attempts + 1;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let ok = false;
  let responseCode = null;
  let responseBody = null;
  let errorMessage = null;

  try {
    const res = await fetch(log.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Signature': header,
        'X-Gateway-Timestamp': String(timestamp),
        'X-Gateway-Event': log.event_type,
        'User-Agent': 'TestGateway-Webhooks/1.0',
      },
      body: rawBody,
      signal: controller.signal,
    });
    responseCode = res.status;
    responseBody = (await res.text()).slice(0, 1000);
    ok = res.status >= 200 && res.status < 300;
    if (!ok) errorMessage = `Merchant responded with HTTP ${res.status}`;
  } catch (err) {
    errorMessage = err.name === 'AbortError' ? 'Request timed out' : err.message.slice(0, 250);
  } finally {
    clearTimeout(timer);
  }

  let status;
  let nextRetryAt = null;
  if (ok) {
    status = 'success';
  } else if (attempts >= MAX_ATTEMPTS) {
    status = 'failed';
  } else {
    status = 'pending';
    const delay = RETRY_DELAYS_SECONDS[Math.min(attempts - 1, RETRY_DELAYS_SECONDS.length - 1)];
    nextRetryAt = new Date(Date.now() + delay * 1000);
  }

  await WebhookLogs.recordAttempt(log.id, { status, attempts, responseCode, responseBody, errorMessage, nextRetryAt });
  return { ok, status, attempts, responseCode, errorMessage };
}

const WebhookService = {
  EVENTS,
  buildPayload,

  // Person 4's PaymentService calls this after a transaction status changes.
  // Never throws, so a webhook problem can never break a payment.
  async dispatch(transactionId, eventType) {
    try {
      const transaction = await Transactions.findById(transactionId);
      if (!transaction) return null;

      const merchant = await Users.findById(transaction.merchant_id || transaction.user_id);
      if (!merchant) return null;

      if (eventType === EVENTS.CHARGE_SUCCESS) {
        EmailService.sendReceipt(transaction); // fire and forget
      }

      if (!merchant.webhook_url) return null; // merchant hasn't set a webhook URL

      const payload = buildPayload(transaction, eventType);
      const logId = await WebhookLogs.create({
        transactionId,
        merchantId: merchant.id,
        eventType,
        url: merchant.webhook_url,
        payload,
      });

      const log = await WebhookLogs.findById(logId);
      await WebhookLogs.claim(logId);
      await attempt(log);
      return logId;
    } catch (err) {
      console.error('[WebhookService] dispatch failed:', err.message);
      return null;
    }
  },

  // Manual resend: creates a fresh log row copying the old payload, so history is kept
  async resend(logId, merchantId) {
    const old = await WebhookLogs.findById(logId);
    if (!old || old.merchant_id !== merchantId) return null;

    const newId = await WebhookLogs.create({
      transactionId: old.transaction_id,
      merchantId: old.merchant_id,
      eventType: old.event_type,
      url: old.url,
      payload: old.payload,
    });
    const log = await WebhookLogs.findById(newId);
    await WebhookLogs.claim(newId);
    await attempt(log);
    return WebhookLogs.findById(newId);
  },

  // Sends a dummy event so merchants can test their endpoint
  async sendTest(merchant) {
    if (!merchant.webhook_url) return null;
    const payload = buildPayload(
      {
        reference: 'test_' + crypto.randomBytes(4).toString('hex'),
        amount: 1000,
        currency: 'NGN',
        status: 'success',
        customer_email: 'test@example.com',
      },
      EVENTS.TEST
    );
    const logId = await WebhookLogs.create({
      merchantId: merchant.id,
      eventType: EVENTS.TEST,
      url: merchant.webhook_url,
      payload,
    });
    const log = await WebhookLogs.findById(logId);
    await WebhookLogs.claim(logId);
    await attempt(log);
    return WebhookLogs.findById(logId);
  },

  // Picks up pending logs whose retry time has arrived
  async processRetries() {
    const due = await WebhookLogs.findDueRetries();
    for (const log of due) {
      if (await WebhookLogs.claim(log.id)) {
        try {
          await attempt(log);
        } catch (err) {
          console.error('[WebhookService] retry error:', err.message);
        }
      }
    }
  },

  // Person 1 calls this once in app.js after the server starts
  startRetryWorker(intervalMs = 5000) {
    let running = false;
    const timer = setInterval(async () => {
      if (running) return;
      running = true;
      try {
        await WebhookService.processRetries();
      } finally {
        running = false;
      }
    }, intervalMs);
    timer.unref();
    return timer;
  },
};

module.exports = WebhookService;