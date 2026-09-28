/**
 * OWNER: Person 3 (Payments). Person 4 calls add() whenever a status changes.
 */
const pool = require("../Config/databaseConfig");
const notImplemented = require("../Utility/notImplemented");

/** add(client, { transactionId, fromStatus, toStatus, note }) -> event row */
const add = async (client, data) => notImplemented("TransactionEvents.add");

/** listByTransaction(transactionId) -> array of event rows, oldest first */
const listByTransaction = async (transactionId) =>
  notImplemented("TransactionEvents.listByTransaction");

module.exports = { add, listByTransaction };
