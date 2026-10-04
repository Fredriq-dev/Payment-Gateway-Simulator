// Optional receipts. Does nothing (and never throws) unless email is configured.
// Needs: npm install nodemailer
const config = require('../Config/emailConfig');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const nodemailer = require('nodemailer'); // lazy so the app runs without it installed
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
  return transporter;
}

const EmailService = {
  async sendReceipt(transaction) {
    try {
      if (!config.enabled || !transaction || !transaction.customer_email) return false;

      const amount = Number(transaction.amount).toLocaleString();
      await getTransporter().sendMail({
        from: config.from,
        to: transaction.customer_email,
        subject: `Payment receipt - ${transaction.reference}`,
        text:
          `Your payment was successful.\n\n` +
          `Reference: ${transaction.reference}\n` +
          `Amount: ${transaction.currency} ${amount}\n` +
          `Status: ${transaction.status}\n\n` +
          `This is a test-mode receipt.`,
      });
      return true;
    } catch (err) {
      console.error('[EmailService] failed to send receipt:', err.message);
      return false;
    }
  },
};

module.exports = EmailService;

