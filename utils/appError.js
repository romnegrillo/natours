class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constuctor);
  }
}

module.exports = AppError;
