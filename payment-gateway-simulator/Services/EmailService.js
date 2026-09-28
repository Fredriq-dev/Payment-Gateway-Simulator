/**
 * OWNER: Person 5 (Webhooks). Optional stretch goal.
 * sendReceipt(transaction) -> emails the customer after a successful payment.
 */
const transporter = require("../Config/emailConfig");

const sendReceipt = async (transaction) => {
  console.log(`[STUB] EmailService.sendReceipt for ${transaction && transaction.reference}`);
};

module.exports = { sendReceipt };
