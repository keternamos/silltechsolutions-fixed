const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Request tracking middleware
const requestTracker = (req, res, next) => {
  // Generate unique request ID
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);

  // Log request
  logger.debug('Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Track response time
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestTracker;
