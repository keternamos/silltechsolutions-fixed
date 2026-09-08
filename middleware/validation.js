const logger = require('../utils/logger');
const config = require('../config/config');

// Input validation helpers
const validators = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  // Password validation (min 8 chars, at least 1 uppercase, 1 number, 1 special char)
  isValidPassword: (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Phone validation (Kenya format)
  isValidPhone: (phone) => {
    const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Alphanumeric validation
  isAlphanumeric: (str) => /^[a-zA-Z0-9\s-_]+$/.test(str),

  // URL validation
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Sanitize HTML input
  sanitizeHTML: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Trim and validate string
  sanitizeString: (str, maxLength = 255) => {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength);
  },

  // Validate integer
  isValidInteger: (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
  },

  // Validate pagination params
  validatePagination: (page, limit, maxLimit = 100) => {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(Math.max(1, parseInt(limit, 10) || 10), maxLimit);
    return { page: p, limit: l };
  },
};

// Middleware to validate and sanitize request body
const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = sanitizeObject(req.body, schema);
    next();
  } catch (err) {
    logger.warn('Request validation failed', {
      path: req.path,
      error: err.message,
      requestId: req.id,
    });
    res.status(400).json({ error: 'Invalid request data' });
  }
};

// Sanitize object based on schema
const sanitizeObject = (obj, schema) => {
  const sanitized = {};
  for (const [key, rules] of Object.entries(schema)) {
    if (!(key in obj)) {
      if (rules.required) {
        throw new Error(`Missing required field: ${key}`);
      }
      continue;
    }

    let value = obj[key];

    // Type conversion
    if (rules.type === 'number') {
      value = Number(value);
      if (isNaN(value)) throw new Error(`Invalid number: ${key}`);
    } else if (rules.type === 'boolean') {
      value = value === true || value === 'true';
    } else if (rules.type === 'string') {
      value = validators.sanitizeString(value, rules.maxLength);
    } else if (rules.type === 'email') {
      value = validators.sanitizeString(value.toLowerCase(), 255);
      if (!validators.isValidEmail(value)) throw new Error(`Invalid email: ${key}`);
    } else if (rules.type === 'password') {
      if (!validators.isValidPassword(value)) {
        throw new Error(
          'Password must be at least 8 characters with uppercase, number, and special character'
        );
      }
    }

    // Custom validation
    if (rules.validate && !rules.validate(value)) {
      throw new Error(`Validation failed: ${key}`);
    }

    sanitized[key] = value;
  }
  return sanitized;
};

module.exports = {
  validators,
  validateRequest,
  sanitizeObject,
};
