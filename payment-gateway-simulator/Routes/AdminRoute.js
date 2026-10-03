/** OWNER: Person 2 (Accounts and Admin) */
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const controller = require("../Controllers/AdminController");
const auth = require("../Middleware/auth");
const role = require("../Middleware/role");

const router = express.Router();

router.use(auth, role("admin"));

router.get("/transactions", catchAsync(controller.listTransactions));
router.get("/stats", catchAsync(controller.getStats));

module.exports = router;
