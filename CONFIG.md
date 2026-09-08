# Environment Configuration Guide

## Overview

All environment-specific configuration is managed through `.env` file. Never commit this file to version control.

## Getting Started

```bash
cp .env.example .env
nano .env  # Edit with your values
```

## Configuration Variables

### Server Settings

```env
# Port the application listens on
PORT=3000

# Environment: development, staging, or production
NODE_ENV=development

# Base URL for the application (used in emails, redirects, etc)
APP_URL=http://localhost:3000
```

### Database Configuration

```env
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:password@localhost:5432/silltechdb

# Connection pool settings (tune for your load)
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

### Security Settings

```env
# JWT Secret (minimum 32 characters, generate with: openssl rand -base64 32)
# Used to sign and verify authentication tokens
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars

# Session Secret (minimum 32 characters, generate with: openssl rand -base64 32)
# Used to sign session cookies
SESSION_SECRET=your-super-secret-session-key-minimum-32-chars

# Cookie security settings
COOKIE_SECURE=false           # Set to true in production (requires HTTPS)
COOKIE_SAME_SITE=lax          # lax or strict
COOKIE_MAX_AGE=604800000      # 7 days in milliseconds
```

### CORS (Cross-Origin Resource Sharing)

```env
# Comma-separated list of allowed origins
# Only these domains can access the API
# Leave empty to restrict to same origin
ALLOWED_ORIGINS=http://localhost:3000,https://silltechsolutions.co.ke
```

### Rate Limiting

```env
# General API rate limit (requests per 15 minutes)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

# Auth routes rate limit (stricter)
AUTH_RATE_LIMIT_MAX=20

# Checkout rate limit (very strict, per 60 seconds)
CHECKOUT_RATE_LIMIT_WINDOW=60000
CHECKOUT_RATE_LIMIT_MAX=5
```

### File Upload Settings

```env
# Directory where uploaded files are stored
UPLOAD_DIR=./uploads

# Maximum file size in bytes (5MB default)
MAX_FILE_SIZE=5242880

# Allowed MIME types (comma-separated)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### Payment Integration (M-Pesa)

```env
# Enable M-Pesa payment integration
MPESA_ENABLED=true

# Environment: sandbox or production
MPESA_ENVIRONMENT=sandbox

# Get from https://developer.safaricom.co.ke/
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret

# Your business details
MPESA_SHORTCODE=174379
MPESA_TILL_NUMBER=your-till-number

# For STK Push authentication
MPESA_PASSKEY=your-mpesa-passkey

# Webhook callback URL (must be publicly accessible)
MPESA_CALLBACK_URL=https://your-domain.com/payments/mpesa/callback
```

### Logging Configuration

```env
# Log level: error, warn, info, debug
LOG_LEVEL=info

# Directory where log files are stored
LOG_DIR=./logs
```

### Email Configuration (SMTP)

```env
# For order confirmations and newsletters
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@silltechsolutions.co.ke
```

### Site Configuration

```env
# Site information (displayed in templates)
SITE_NAME=SillTech Solutions
SITE_TAGLINE=Kenya's Electronics Components Store
CURRENCY=KES
```

### Admin Settings

```env
# Default admin credentials (for seeding database)
# CHANGE IMMEDIATELY AFTER FIRST LOGIN IN PRODUCTION
ADMIN_EMAIL=admin@silltechsolutions.co.ke
ADMIN_PASSWORD=Admin@1234
```

## Environment-Specific Examples

### Development
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/silltechdb
JWT_SECRET=dev-secret-key-minimum-32-characters-change-me
SESSION_SECRET=dev-session-key-minimum-32-characters-change-me
COOKIE_SECURE=false
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
MPESA_ENVIRONMENT=sandbox
```

### Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://dbuser:strong_password@db.internal:5432/silltechdb
JWT_SECRET=prod-super-secret-key-minimum-32-random-characters
SESSION_SECRET=prod-super-secret-session-key-minimum-32-random-characters
COOKIE_SECURE=true
ALLOWED_ORIGINS=https://silltechsolutions.co.ke,https://www.silltechsolutions.co.ke
LOG_LEVEL=info
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=production-consumer-key
MPESA_CONSUMER_SECRET=production-consumer-secret
MPESA_PASSKEY=production-passkey
MPESA_CALLBACK_URL=https://silltechsolutions.co.ke/payments/mpesa/callback
```

## Generating Secrets

### Generate Strong JWT Secret
```bash
openssl rand -base64 32
# Output: AbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFf=
```

### Generate Strong Session Secret
```bash
openssl rand -base64 32
# Output: XyZaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRr=
```

## Validation

The application validates all required environment variables on startup. If any are missing or invalid:

```
Error: Missing required environment variable: JWT_SECRET
Error: JWT_SECRET must be at least 32 characters long
```

## Security Best Practices

✅ **DO:**
- Generate new secrets for each environment
- Keep secrets strong and random (32+ characters)
- Use different credentials for staging and production
- Store `.env` in secure location (never in git)
- Rotate secrets periodically
- Use environment-specific configuration

❌ **DON'T:**
- Commit `.env` to version control
- Use simple or predictable secrets
- Share secrets via email or chat
- Reuse secrets across environments
- Leave default admin credentials unchanged
- Log sensitive configuration values

## Troubleshooting

### "Cannot find module: .env"
Make sure `.env` file exists:
```bash
cp .env.example .env
```

### "Invalid environment variable"
Check that all required variables are set and properly formatted.

### "Database connection failed"
Verify DATABASE_URL is correct:
```bash
psql $DATABASE_URL
```

### "CORS error"
Make sure your origin is in ALLOWED_ORIGINS:
```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

