/**
 * OWNER: Person 3 (Payments)
 * Generates a unique transaction reference such as TXN_8F3K2LQ9X1AB
 */
const crypto = require("crypto");

const generateReference = () =>
  `TXN_${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

module.exports = generateReference;
