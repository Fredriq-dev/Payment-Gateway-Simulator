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


exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existing = await Users.findByEmail(email);
    if (existing) throw new AppError('Email already registered', 400);

    const passwordHash = await bcrypt.hash(password, 10);
    const { publicKey, secretKey } = generateKeys();

    const user = await Users.createUser(email, passwordHash, publicKey, secretKey);
    res.json({ message: 'Registration successful', user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.regenerateKeys = async (req, res, next) => {
  try {
    const { publicKey, secretKey } = generateKeys();
    const user = await Users.regenerateKeys(req.user.id, publicKey, secretKey);
    res.json({ message: 'Keys regenerated', user });
  } catch (err) {
    next(err);
  }
};


exports.register = async (req, res) => notImplemented("UserController.register");
exports.login = async (req, res) => notImplemented("UserController.login");
exports.getProfile = async (req, res) => notImplemented("UserController.getProfile");
exports.updateWebhookUrl = async (req, res) => notImplemented("UserController.updateWebhookUrl");
exports.regenerateKeys = async (req, res) => notImplemented("UserController.regenerateKeys");
