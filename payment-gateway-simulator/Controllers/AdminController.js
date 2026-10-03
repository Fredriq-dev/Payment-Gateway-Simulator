/**
 * OWNER: Person 2 (Accounts and Admin)
 * listTransactions: Transactions.listAll with filters from req.query
 * getStats: Transactions.stats (totals, success rate, total volume)
 */
const Transactions = require("../Models/Transactions");
const { success } = require("../Utility/response");
const notImplemented = require("../Utility/notImplemented");
const pool = require('../Config/databaseConfig');
const AppError = require('../Utility/AppError');

// List all users (merchants + admins)
exports.listUsers = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, public_key, secret_key, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};

// List all transactions
exports.listTransactions = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM transactions ORDER BY created_at DESC'
    );
    res.json({ transactions: rows });
  } catch (err) {
    next(err);
  }
};

// Get system stats (counts, totals)
exports.getStats = async (req, res, next) => {
  try {
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const txCountResult = await pool.query('SELECT COUNT(*) FROM transactions');
    const txSumResult = await pool.query('SELECT COALESCE(SUM(amount),0) AS total_amount FROM transactions');

    const stats = {
      totalUsers: parseInt(userCountResult.rows[0].count, 10),
      totalTransactions: parseInt(txCountResult.rows[0].count, 10),
      totalVolume: parseFloat(txSumResult.rows[0].total_amount)
    };

    res.json({ stats });
  } catch (err) {
    next(err);
  }
};


exports.listTransactions = async (req, res) => {notImplemented("AdminController.listTransactions")};
exports.getStats = async (req, res) => { notImplemented("AdminController.getStats")};
