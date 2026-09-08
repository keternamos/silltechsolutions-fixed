const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const logger = require('../utils/logger');

// Store for rate limit tracking (use Redis in production)
const store = new Map();

// Custom store for rate limiting
class MemoryStore {
  constructor() {
    this.hits = new Map();
    this.resets = new Map();
  }

  async increment(key) {
    if (!this.hits.has(key)) {
      this.hits.set(key, 0);
      this.resets.set(key, Date.now() + config.rateLimitWindowMs);
    }

    const reset = this.resets.get(key);
    if (Date.now() > reset) {
      this.hits.set(key, 0);
      this.resets.set(key, Date.now() + config.rateLimitWindowMs);
    }

    const hits = this.hits.get(key) + 1;
    this.hits.set(key, hits);
    return hits;
  }

  async decrement(key) {
    // Not used in basic implementation
  }

  async resetKey(key) {
    this.hits.delete(key);
    this.resets.delete(key);
  }
}

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isDevelopment,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Auth routes rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.authRateLimitMax,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isDevelopment,
  keyGenerator: (req) => {
    // Rate limit by email + IP combination
    return `${req.body?.email || req.ip}`;
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      email: req.body?.email,
      ip: req.ip,
    });
    res.status(429).json({
      error: 'Too many login attempts',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Checkout rate limiter (very strict)
const checkoutLimiter = rateLimit({
  windowMs: config.checkoutRateLimitWindow,
  max: config.checkoutRateLimitMax,
  message: 'Too many checkout attempts',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isDevelopment,
  keyGenerator: (req) => {
    // Rate limit by user ID or session ID
    return req.user?.id || req.sessionID;
  },
  handler: (req, res) => {
    logger.warn('Checkout rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
    });
    res.status(429).json({
      error: 'Too many checkout attempts. Please wait before trying again.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  checkoutLimiter,
};
