const config = require('../config/config');
const logger = require('../utils/logger');

// CORS middleware with whitelisting
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  if (config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};

module.exports = corsMiddleware;
