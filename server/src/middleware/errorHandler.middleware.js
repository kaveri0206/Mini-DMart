const logger = require('../config/logger');
const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid resource identifier format', 'INVALID_ID_FORMAT');
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `An entity with this ${field} already exists`, 'DUPLICATE_ENTRY');
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, `Validation failed: ${messages.join(', ')}`, 'SCHEMA_VALIDATION_ERROR');
  }

  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.isOperational ? error.message : 'An unexpected error occurred. Please try again later.';

  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?._id,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code: errorCode,
  });
};

module.exports = errorHandler;