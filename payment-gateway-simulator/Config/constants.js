/**
 * OWNER: Person 1 (Foundation). Person 4 may edit TEST_CARDS.
 */
const TRANSACTION_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
  ABANDONED: "abandoned",
  REFUNDED: "refunded",
};

const ROLES = { ADMIN: "admin", MERCHANT: "merchant" };

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

/**
 * Simulated test cards. Keys are card numbers with no spaces.
 * outcome is the final status, reason is stored in failure_reason.
 */
const TEST_CARDS = {
  "4242424242424242": { outcome: "success", reason: null, brand: "visa" },
  "4000000000000002": { outcome: "failed", reason: "Card declined", brand: "visa" },
  "4000000000009995": { outcome: "failed", reason: "Insufficient funds", brand: "visa" },
  "4000000000000069": { outcome: "failed", reason: "Expired card", brand: "visa" },
  "4000000000000119": { outcome: "pending", reason: "Processing error", brand: "visa" },
};

const WEBHOOK_EVENTS = {
  SUCCESS: "payment.success",
  FAILED: "payment.failed",
  ABANDONED: "payment.abandoned",
  REFUNDED: "payment.refunded",
};

module.exports = { TRANSACTION_STATUS, ROLES, CURRENCIES, TEST_CARDS, WEBHOOK_EVENTS };
