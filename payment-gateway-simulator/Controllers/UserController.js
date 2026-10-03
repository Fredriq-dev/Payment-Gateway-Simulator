/**
 * OWNER: Person 2 (Accounts and Admin)
 *
 * register: hash the password (bcryptjs), generate keys (Utility/generateKeys.js),
 *           save with Users.create, return the user and keys (never the password hash).
 * login:    check the password, return a JWT signed with JWT_SECRET.
 * getProfile, updateWebhookUrl, regenerateKeys: use req.user.id from Middleware/auth.js.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../Models/Users");
const generateKeys = require("../Utility/generateKeys");
const { success } = require("../Utility/response");
const AppError = require("../Utility/AppError");
const notImplemented = require("../Utility/notImplemented");

exports.register = async (req, res) => notImplemented("UserController.register");
exports.login = async (req, res) => notImplemented("UserController.login");
exports.getProfile = async (req, res) => notImplemented("UserController.getProfile");
exports.updateWebhookUrl = async (req, res) => notImplemented("UserController.updateWebhookUrl");
exports.regenerateKeys = async (req, res) => notImplemented("UserController.regenerateKeys");
