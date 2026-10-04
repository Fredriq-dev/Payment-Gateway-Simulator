/**
 * OWNER: Person 2 (Accounts and Admin)
 * listUsers:        every user, without keys or password hashes
 * listTransactions: Transactions.listAll with filters from req.query (status, from, to, page, limit)
 * getStats:         Transactions.stats (totals, success rate, total volume)
 */
const Users = require("../Models/Users");
const Transactions = require("../Models/Transactions");
const { success } = require("../Utility/response");

exports.listUsers = async (req, res) => {
  const users = await Users.listAll();
  return success(res, "Users retrieved", { users, total: users.length });
};

exports.listTransactions = async (req, res) => {
  const { status, from, to } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const result = await Transactions.listAll({ status, from, to, page, limit });

  return success(res, "Transactions retrieved", {
    transactions: result.rows,
    total: result.total,
    page,
    limit,
  });
};

exports.getStats = async (req, res) => {
  const stats = await Transactions.stats();
  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 1000) / 10 : 0;

  return success(res, "Stats retrieved", {
    total: stats.total,
    success: stats.success,
    failed: stats.failed,
    pending: stats.pending,
    success_rate: successRate,
    volume: Number(stats.volume),
  });
};
