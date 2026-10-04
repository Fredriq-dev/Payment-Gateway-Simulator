/** OWNER: Person 2 (Accounts and Admin) */
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const controller = require("../Controllers/AdminController");
const auth = require("../Middleware/auth");
const role = require("../Middleware/role");

const router = express.Router();

// Every admin route needs a valid JWT and the admin role.
router.use(auth, role("admin"));

router.get("/users", catchAsync(controller.listUsers));
router.get("/transactions", catchAsync(controller.listTransactions));
router.get("/stats", catchAsync(controller.getStats));

module.exports = router;
