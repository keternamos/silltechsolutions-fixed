const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', config.logDir);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLogLevel = logLevels[config.logLevel] || logLevels.info;

const getTimestamp = () => new Date().toISOString();

const formatMessage = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: getTimestamp(),
    level,
    message,
    ...meta,
  });
};

const writeLog = (level, message, meta = {}) => {
  const formattedMessage = formatMessage(level, message, meta);
  const logFile = path.join(logsDir, `${level}.log`);

  // Write to file
  fs.appendFileSync(logFile, formattedMessage + '\n', 'utf8');

  // Also write to combined log
  fs.appendFileSync(path.join(logsDir, 'combined.log'), formattedMessage + '\n', 'utf8');

  // Console output in development
  if (config.isDevelopment) {
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[35m',
      reset: '\x1b[0m',
    };
    const color = colors[level] || colors.reset;
    console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`, meta);
  }
};

module.exports = {
  error: (message, meta) => {
    if (currentLogLevel >= logLevels.error) writeLog('error', message, meta);
  },
  warn: (message, meta) => {
    if (currentLogLevel >= logLevels.warn) writeLog('warn', message, meta);
  },
  info: (message, meta) => {
    if (currentLogLevel >= logLevels.info) writeLog('info', message, meta);
  },
  debug: (message, meta) => {
    if (currentLogLevel >= logLevels.debug) writeLog('debug', message, meta);
  },
};
