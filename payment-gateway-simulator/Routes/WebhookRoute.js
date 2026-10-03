/** OWNER: Person 5 (Webhooks) */
const express = require("express");
const catchAsync = require("../Utility/catchAsync");
const controller = require("../Controllers/WebhookController");
const auth = require("../Middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/", catchAsync(controller.listLogs));
router.post("/:transactionId/resend", catchAsync(controller.resend));

module.exports = router;
