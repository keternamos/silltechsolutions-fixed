const { Pool } = require('pg');
const config = require('./config');
const logger = require('../utils/logger');

// Create pool with configuration
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.dbPoolMax,
  idleTimeoutMillis: config.dbPoolIdleTimeout,
  connectionTimeoutMillis: config.dbConnectionTimeout,
});

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

// Query with error handling
pool.query = (function (query) {
  return function (text, values, callback) {
    const start = Date.now();
    return query.call(pool, text, values, (err, result) => {
      const duration = Date.now() - start;
      if (err) {
        logger.error('Database error', {
          query: text,
          duration,
          error: err.message,
        });
      } else if (duration > 1000) {
        logger.warn('Slow database query', {
          query: text.substring(0, 100),
          duration,
        });
      }
      callback(err, result);
    });
  };
}(pool.query));

// Test connection with retry
const connectWithRetry = async (retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      logger.info('Database connected successfully');
      return;
    } catch (err) {
      if (i === retries - 1) {
        logger.error('Failed to connect to database after retries', err);
        throw err;
      }
      const waitTime = delay * Math.pow(2, i);
      logger.warn(`Database connection failed, retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = {
  pool,
  query: (text, values) => pool.query(text, values),
  connectWithRetry,
};
