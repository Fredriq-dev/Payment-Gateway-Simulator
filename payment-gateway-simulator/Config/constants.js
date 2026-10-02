/**
 * OWNER: Person 1 (Foundation). Person 4 may edit TEST_CARDS.
 */
const TRANSACTION_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
  ABANDONED: "abandoned",
  REFUNDED: "refunded",
});

const ROLES = Object.freeze({ ADMIN: "admin", MERCHANT: "merchant" });

const CURRENCIES = Object.freeze(["NGN", "USD", "GBP", "EUR"]);

/**
 * Which status changes are legal. Services should check this
 * before updating a transaction.
 */
const ALLOWED_TRANSITIONS = Object.freeze({
  [TRANSACTION_STATUS.PENDING]: [
    TRANSACTION_STATUS.PROCESSING,
    TRANSACTION_STATUS.SUCCESS,
    TRANSACTION_STATUS.FAILED,
    TRANSACTION_STATUS.ABANDONED,
  ],
  [TRANSACTION_STATUS.PROCESSING]: [
    TRANSACTION_STATUS.SUCCESS,
    TRANSACTION_STATUS.FAILED,
  ],
  [TRANSACTION_STATUS.SUCCESS]: [TRANSACTION_STATUS.REFUNDED],
  [TRANSACTION_STATUS.FAILED]: [],
  [TRANSACTION_STATUS.ABANDONED]: [],
  [TRANSACTION_STATUS.REFUNDED]: [],
});

/**
 * Simulated test cards. Keys are card numbers with no spaces.
 * outcome is the final status, reason is stored in failure_reason.
 */
const TEST_CARDS = Object.freeze({
  "4242424242424242": { outcome: TRANSACTION_STATUS.SUCCESS, reason: null, brand: "visa" },
  "4000000000000002": { outcome: TRANSACTION_STATUS.FAILED, reason: "Card declined", brand: "visa" },
  "4000000000009995": { outcome: TRANSACTION_STATUS.FAILED, reason: "Insufficient funds", brand: "visa" },
  "4000000000000069": { outcome: TRANSACTION_STATUS.FAILED, reason: "Expired card", brand: "visa" },
  "4000000000000119": { outcome: TRANSACTION_STATUS.PENDING, reason: "Processing error", brand: "visa" },
});

const WEBHOOK_EVENTS = Object.freeze({
  SUCCESS: "payment.success",
  FAILED: "payment.failed",
  ABANDONED: "payment.abandoned",
  REFUNDED: "payment.refunded",
});

/** Look up which webhook event to send for a given status. */
const WEBHOOK_EVENT_BY_STATUS = Object.freeze({
  [TRANSACTION_STATUS.SUCCESS]: WEBHOOK_EVENTS.SUCCESS,
  [TRANSACTION_STATUS.FAILED]: WEBHOOK_EVENTS.FAILED,
  [TRANSACTION_STATUS.ABANDONED]: WEBHOOK_EVENTS.ABANDONED,
  [TRANSACTION_STATUS.REFUNDED]: WEBHOOK_EVENTS.REFUNDED,
});

/** Strips spaces and dashes so "4242 4242 4242 4242" still matches. */
const findTestCard = (cardNumber) => {
  const cleaned = String(cardNumber).replace(/[\s-]/g, "");
  return TEST_CARDS[cleaned] || null;
};

/** True if moving from one status to another is allowed. */
const canTransition = (from, to) =>
  (ALLOWED_TRANSITIONS[from] || []).includes(to);

module.exports = {
  TRANSACTION_STATUS,
  ROLES,
  CURRENCIES,
  ALLOWED_TRANSITIONS,
  TEST_CARDS,
  WEBHOOK_EVENTS,
  WEBHOOK_EVENT_BY_STATUS,
  findTestCard,
  canTransition,
};