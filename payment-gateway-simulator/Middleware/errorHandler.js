/**
 * OWNER: Person 1 (Foundation)
 * Central error handler. Anything thrown or passed to next(err) ends up here.
 */
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // PostgreSQL error codes
  if (err.code === "23505") {
    statusCode = 409;
    message = "A record with these details already exists";
  } else if (err.code === "23503") {
    statusCode = 400;
    message = "Related record does not exist";
  } else if (err.code === "22P02") {
    statusCode = 400;
    message = "Invalid value format";
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message,
    errors: null,
  });
};
