/**
 * OWNER: Person 1 (Foundation)
 * Placeholder used inside stubs. Delete the call when you implement the function.
 */
const AppError = require("./AppError");

module.exports = (name) => {
  throw new AppError(`${name} is not implemented yet`, 501);
};
