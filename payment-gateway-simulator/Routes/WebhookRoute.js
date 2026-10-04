// Mount in app.js:  app.use('/api/webhooks', require('./Routes/WebhookRoute'));
const express = require('express');
const WebhookController = require('../Controllers/WebhookController');

// Person 2's JWT middleware - tolerant of how they exported it
const authModule = require('../Middleware/auth');
const auth =
  typeof authModule === 'function'
    ? authModule
    : authModule.authenticate || authModule.protect || authModule.auth;

const router = express.Router();

router.use(auth); // sets req.user (needs req.user.id)

router.get('/logs', WebhookController.listLogs);
router.get('/logs/:id', WebhookController.getLog);
router.post('/logs/:id/retry', WebhookController.retryLog);
router.post('/test', WebhookController.sendTest);

module.exports = router;