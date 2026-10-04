const WebhookLogs = require('../Models/WebhookLogs');
const WebhookService = require('../Services/WebhookService');
const Users = require('../Models/Users');
const AppError = require('../Utility/AppError'); // assumed signature: new AppError(message, statusCode)

const WebhookController = {
  // GET /api/webhooks/logs?status=failed&page=1&limit=20
  async listLogs(req, res, next) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const logs = await WebhookLogs.findByMerchant(req.user.id, {
        status: req.query.status,
        limit,
        offset: (page - 1) * limit,
      });
      res.json({ success: true, page, count: logs.length, data: logs });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/webhooks/logs/:id
  async getLog(req, res, next) {
    try {
      const log = await WebhookLogs.findById(req.params.id);
      if (!log || log.merchant_id !== req.user.id) throw new AppError('Webhook log not found', 404);
      res.json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/webhooks/logs/:id/retry
  async retryLog(req, res, next) {
    try {
      const result = await WebhookService.resend(req.params.id, req.user.id);
      if (!result) throw new AppError('Webhook log not found', 404);
      res.json({ success: true, message: 'Webhook resent', data: result });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/webhooks/test
  async sendTest(req, res, next) {
    try {
      const merchant = await Users.findById(req.user.id);
      if (!merchant || !merchant.webhook_url) {
        throw new AppError('Set a webhook URL on your account first', 400);
      }
      const result = await WebhookService.sendTest(merchant);
      res.json({ success: true, message: 'Test webhook sent', data: result });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = WebhookController;
