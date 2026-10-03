/** OWNER: Person 2 (Accounts and Admin) */
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const controller = require("../Controllers/AdminController");
const auth = require("../Middleware/auth");
const role = require("../Middleware/role");

const router = express.Router();
const AdminController = require('../Controllers/AdminController');

router.use(auth, role("admin"));

// Admin-only routes
router.get('/users', auth, role('admin'), AdminController.listUsers);
router.get('/transactions', auth, role('admin'), AdminController.listTransactions);
router.get('/stats', auth, role('admin'), AdminController.getStats);

// router.get("/transactions", catchAsync(controller.listTransactions));
router.get("/stats", catchAsync(controller.getStats));

module.exports = router;
