// Optional. Set EMAIL_ENABLED=true plus the SMTP_* values in .env to turn receipts on.
module.exports = {
  enabled: process.env.EMAIL_ENABLED === 'true',
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM || 'Test Gateway <no-reply@example.com>',
};