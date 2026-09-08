const logger = require('../utils/logger');
const config = require('../config/config');

// Global error handler
const errorHandler = (err, req, res, next) => {
  const requestId = req.id || 'unknown';

  // Log error
  logger.error('Unhandled error', {
    requestId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Don't expose error details in production
  const isProduction = config.isProduction;
  const errorResponse = {
    error: message,
    requestId,
    ...(isProduction ? {} : { stack: err.stack }),
  };

  // Check if client expects JSON
  if (req.xhr || req.accepts('json') === 'json') {
    return res.status(statusCode).json(errorResponse);
  }

  // Render error page
  res.status(statusCode).render('error', {
    title: 'Error',
    statusCode,
    message,
    stack: isProduction ? null : err.stack,
    requestId,
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};
