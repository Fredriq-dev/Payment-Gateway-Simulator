/**
 * OWNER: Person 2 (Accounts and Admin)
 *
 * register:          hash the password, generate keys, save, return the user and keys.
 * login:             check the password, return a JWT signed with JWT_SECRET.
 * getProfile, updateWebhookUrl, regenerateKeys: use req.user.id from Middleware/auth.js.
 *
 * The route file wraps these in catchAsync, so throwing an AppError is enough.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../Models/Users");
const generateKeys = require("../Utility/generateKeys");
const { success } = require("../Utility/response");
const AppError = require("../Utility/AppError");

/** Never send the password hash to the client. */
const publicUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
};

exports.register = async (req, res) => {
  const { business_name, password } = req.body;
  const email = req.body.email.trim().toLowerCase();

  if (await Users.findByEmail(email)) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { publicKey, secretKey } = generateKeys();

  const user = await Users.create({
    businessName: business_name,
    email,
    passwordHash,
    role: "merchant",
    publicKey,
    secretKey,
  });

  return success(res, "Registration successful", { user: publicUser(user) }, 201);
};

exports.login = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.trim().toLowerCase();

  const user = await Users.findByEmail(email);
  const valid = user && (await bcrypt.compare(password, user.password_hash));
  if (!valid) throw new AppError("Invalid email or password", 401);

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  return success(res, "Login successful", { token, user: publicUser(user) });
};

exports.getProfile = async (req, res) => {
  const user = await Users.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);

  return success(res, "Profile retrieved", { user: publicUser(user) });
};

exports.updateWebhookUrl = async (req, res) => {
  const user = await Users.updateWebhookUrl(req.user.id, req.body.webhook_url);
  if (!user) throw new AppError("User not found", 404);

  return success(res, "Webhook URL updated", { user: publicUser(user) });
};

exports.regenerateKeys = async (req, res) => {
  const { publicKey, secretKey } = generateKeys();
  const user = await Users.updateKeys(req.user.id, publicKey, secretKey);
  if (!user) throw new AppError("User not found", 404);

  return success(res, "Keys regenerated", { user: publicUser(user) });
};
