/**
 * OWNER: Person 4 (Checkout and Simulator)
 *
 * CONTRACT: run(cardNumber) -> { status, reason, brand }
 *   status is "success", "failed" or "pending"
 * The card is looked up with findTestCard from Config/constants.js, which strips
 * spaces and dashes. This is the only place that decides a card's outcome.
 * Unknown cards fail with reason "Invalid test card".
 * A "pending" result means the transaction stays pending, so the caller must
 * not try to change its status.
 */
const { findTestCard, TRANSACTION_STATUS } = require("../Config/constants");

const run = async (cardNumber) => {
  const card = findTestCard(cardNumber);

  if (!card) {
    return {
      status: TRANSACTION_STATUS.FAILED,
      reason: "Invalid test card",
      brand: null,
    };
  }

  return { status: card.outcome, reason: card.reason, brand: card.brand };
};

module.exports = { run };