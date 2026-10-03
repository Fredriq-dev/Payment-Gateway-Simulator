/**
 * OWNER: Person 5 (Webhooks). Optional, only needed for email receipts.
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

module.exports = transporter;