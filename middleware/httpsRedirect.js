const logger = require('../utils/logger');

// HTTPS redirect for production
const httpsRedirect = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    logger.warn('Non-HTTPS request redirected', { url: req.originalUrl });
    return res.redirect(`https://${req.headers.host}${req.originalUrl}`);
  }
  next();
};

module.exports = httpsRedirect;
