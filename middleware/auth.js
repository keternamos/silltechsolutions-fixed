const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

// Verify JWT token from HTTP-only cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid token attempt', { error: err.message });
    // Clear invalid token
    res.clearCookie('authToken');
    req.user = null;
    next();
  }
};

// Require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    if (req.xhr || req.accepts('json') === 'json') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.flash('error', 'Please log in first');
    return res.redirect('/auth/login');
  }
  next();
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', {
      userId: req.user?.id,
      ip: req.ip,
    });
    if (req.xhr || req.accepts('json') === 'json') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.flash('error', 'Admin access required');
    return res.redirect('/');
  }
  next();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

module.exports = {
  verifyToken,
  requireAuth,
  requireAdmin,
  generateToken,
};
