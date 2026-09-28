/**
 * OWNER: Person 4 (Checkout and Simulator)
 *
 * CONTRACT: run(cardNumber) -> { status, reason, brand }
 *   status is "success", "failed" or "pending"
 * Look the card up in TEST_CARDS (Config/constants.js). Strip spaces first.
 * Unknown cards should fail with reason "Invalid test card".
 * Optional stretch: add a random delay of 1 to 3 seconds to feel realistic.
 */
const { TEST_CARDS } = require("../Config/constants");
const notImplemented = require("../Utility/notImplemented");

const run = (cardNumber) => notImplemented("SimulatorService.run");

module.exports = { run };
