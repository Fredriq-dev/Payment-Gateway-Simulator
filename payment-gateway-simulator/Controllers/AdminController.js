/**
 * OWNER: Person 2 (Accounts and Admin)
 * listTransactions: Transactions.listAll with filters from req.query
 * getStats: Transactions.stats (totals, success rate, total volume)
 */
const Transactions = require("../Models/Transactions");
const { success } = require("../Utility/response");
const notImplemented = require("../Utility/notImplemented");

exports.listTransactions = async (req, res) => notImplemented("AdminController.listTransactions");
exports.getStats = async (req, res) => notImplemented("AdminController.getStats");
