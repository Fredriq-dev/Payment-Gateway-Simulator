/**
 * OWNER: Person 5 (Webhooks)
 */
const pool = require("../Config/databaseConfig");
const notImplemented = require("../Utility/notImplemented");

/**
 * create({ transactionId, url, event, payload, responseStatus, responseBody, attempt, success })
 * -> log row
 */
const create = async (data) => notImplemented("WebhookLogs.create");

/** listByMerchant(merchantId, { page, limit }) -> { rows, total }. Join with transactions. */
const listByMerchant = async (merchantId, filters) => notImplemented("WebhookLogs.listByMerchant");

/** listByTransaction(transactionId) -> array of log rows */
const listByTransaction = async (transactionId) => notImplemented("WebhookLogs.listByTransaction");

module.exports = { create, listByMerchant, listByTransaction };
