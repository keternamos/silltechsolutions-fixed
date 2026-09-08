require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'NODE_ENV',
  'APP_URL',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Validate secret lengths
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters long');
}

// Validate NODE_ENV
const validNodeEnvs = ['development', 'staging', 'production', 'test'];
if (!validNodeEnvs.includes(process.env.NODE_ENV)) {
  throw new Error(`NODE_ENV must be one of: ${validNodeEnvs.join(', ')}`);
}

module.exports = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV,
  appUrl: process.env.APP_URL,

  // Database
  databaseUrl: process.env.DATABASE_URL,
  dbPoolMax: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  dbPoolIdleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 30000,
  dbConnectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 2000,

  // Security
  jwtSecret: process.env.JWT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
  cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE, 10) || 7 * 24 * 60 * 60 * 1000,

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  checkoutRateLimitWindow: parseInt(process.env.CHECKOUT_RATE_LIMIT_WINDOW, 10) || 60000,
  checkoutRateLimitMax: parseInt(process.env.CHECKOUT_RATE_LIMIT_MAX, 10) || 5,

  // File Upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),

  // Payment (M-Pesa)
  mpesaEnabled: process.env.MPESA_ENABLED === 'true',
  mpesaEnvironment: process.env.MPESA_ENVIRONMENT || 'sandbox',
  mpesaConsumerKey: process.env.MPESA_CONSUMER_KEY,
  mpesaConsumerSecret: process.env.MPESA_CONSUMER_SECRET,
  mpesaShortcode: process.env.MPESA_SHORTCODE,
  mpesaTillNumber: process.env.MPESA_TILL_NUMBER,
  mpesaPasskey: process.env.MPESA_PASSKEY,
  mpesaCallbackUrl: process.env.MPESA_CALLBACK_URL,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_DIR || './logs',

  // Email
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM,

  // Site
  siteName: process.env.SITE_NAME || 'SillTech Solutions',
  siteTagline: process.env.SITE_TAGLINE || "Kenya's Electronics Components Store",
  currency: process.env.CURRENCY || 'KES',

  // Admin
  adminEmail: process.env.ADMIN_EMAIL || 'admin@silltechsolutions.co.ke',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@1234',

  // Utility
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
