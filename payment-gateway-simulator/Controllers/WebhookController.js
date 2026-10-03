/**
 * OWNER: Person 5 (Webhooks)
 * listLogs: WebhookLogs.listByMerchant(req.user.id, req.query)
 * resend:   make sure the transaction belongs to the merchant, then WebhookService.resend(id)
 */
const WebhookLogs = require("../Models/WebhookLogs");
const WebhookService = require("../Services/WebhookService");
const { success } = require("../Utility/response");
const notImplemented = require("../Utility/notImplemented");

exports.listLogs = async (req, res) => notImplemented("WebhookController.listLogs");
exports.resend = async (req, res) => notImplemented("WebhookController.resend");
