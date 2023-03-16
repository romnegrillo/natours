const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error/trusted error: send message to client.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or unknown error: don't leak to client.
  else {
    console.error("ERROR", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong...",
    });
  }
};

const errorController = (err, req, res, next) => {
  // Add defaults.
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const mode = process.env.NODE_ENV;

  if (mode === "development") {
    sendErrorDev(err, res);
  } else if (mode === "production") {
    let modifiedError = { ...err };

    // Add a condition for a specific error that you expect.
    // Modify it using the AppError class then send it back
    // to the client in a graceful way.
    if (err.name === "CastError") {
      modifiedError = handleCastErrorDB(err);
    } else if (err.code === 11000) {
      modifiedError = handleDuplicateFieldsDB(err);
    } else if (err.name === "ValidationError") {
      modifiedError = handleValidationErrorDB(err);
    }

    sendErrorProd(modifiedError, res);
  }
};

module.exports = errorController;
