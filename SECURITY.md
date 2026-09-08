# Security Best Practices Guide

## 🔒 Input Validation

### Email Validation
```javascript
const { validators } = require('./middleware/validation');

if (!validators.isValidEmail(email)) {
  throw new Error('Invalid email format');
}
```

### Password Validation
```javascript
// Requirements: 8+ chars, 1 uppercase, 1 number, 1 special char
if (!validators.isValidPassword(password)) {
  throw new Error('Password does not meet security requirements');
}
```

### HTML Sanitization
```javascript
// Prevent XSS attacks
const safe = validators.sanitizeHTML(userInput);
```

### String Sanitization
```javascript
// Trim and limit length
const name = validators.sanitizeString(req.body.name, 100);
```

---

## 🛡️ Database Security

### Parameterized Queries (SQL Injection Prevention)
```javascript
// ✅ GOOD - Uses parameterized queries
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ BAD - String concatenation
await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Transaction Handling
```javascript
const { withTransaction } = require('./utils/transaction');

await withTransaction(async (trx) => {
  // Both queries succeed or both rollback
  await trx.query('INSERT INTO orders ...');
  await trx.query('UPDATE inventory ...');
});
```

---

## 🔐 Authentication & Authorization

### Protect Routes
```javascript
const { requireAuth, requireAdmin } = require('./middleware/auth');

// Require login
router.get('/profile', requireAuth, controller);

// Require admin role
router.delete('/user/:id', requireAdmin, controller);
```

### JWT Token Generation
```javascript
const { generateToken } = require('./middleware/auth');

const token = generateToken({
  id: user.id,
  email: user.email,
  role: user.role,
});

// Set as HTTP-only cookie
res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

---

## 📤 File Upload Security

### Configure Multer
```javascript
const { upload, handleUploadError } = require('./middleware/fileUpload');

// Validate and upload
router.post('/upload',
  upload.single('image'),
  handleUploadError,
  controller
);
```

### Allowed File Types
Configured in `.env`:
```env
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
MAX_FILE_SIZE=5242880  # 5MB
```

---

## ⏱️ Rate Limiting

### Apply Rate Limiters
```javascript
const { authLimiter, checkoutLimiter } = require('./middleware/rateLimiter');

// Strict limit on auth routes
router.post('/login', authLimiter, controller);

// Very strict limit on checkout
router.post('/checkout', checkoutLimiter, controller);
```

### Limits per Endpoint
- **General API**: 200 requests / 15 minutes
- **Auth Routes**: 20 requests / 15 minutes
- **Checkout**: 5 requests / 60 seconds

---

## 🌐 CORS Configuration

### Whitelist Origins
```env
ALLOWED_ORIGINS=http://localhost:3000,https://silltechsolutions.co.ke,https://www.silltechsolutions.co.ke
```

### Only allowed origins can access API
```javascript
// Middleware automatically validates
app.use(corsMiddleware);
```

---

## 🔍 Logging & Monitoring

### Log Security Events
```javascript
const logger = require('./utils/logger');

logger.warn('Suspicious activity', {
  userId: user.id,
  action: 'failed_login_attempt',
  ip: req.ip,
});

logger.error('Critical error', {
  error: err.message,
  requestId: req.id,
});
```

### Request Tracking
Every request gets a unique ID:
```javascript
res.setHeader('X-Request-ID', req.id);
// Use in logs for debugging
```

---

## 💳 Payment Security

### M-Pesa Webhook Validation
```javascript
const MpesaPayment = require('./utils/mpesa');
const mpesa = new MpesaPayment(config);

// ALWAYS validate signature
if (!mpesa.validateCallback(body, signature)) {
  logger.warn('Invalid payment callback signature');
  return res.status(400).json({ error: 'Invalid signature' });
}

// Extract payment details safely
const details = mpesa.extractPaymentDetails(body);
```

---

## 🚀 Security Checklist for Deployment

### Before Going Live
- [ ] All environment variables set (no defaults in production)
- [ ] JWT_SECRET is 32+ random characters
- [ ] SESSION_SECRET is 32+ random characters
- [ ] ALLOWED_ORIGINS configured (no wildcard)
- [ ] NODE_ENV set to 'production'
- [ ] COOKIE_SECURE set to 'true'
- [ ] SSL/TLS certificates installed
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Admin default password changed
- [ ] Nginx reverse proxy configured
- [ ] Rate limiting enabled
- [ ] Security headers verified
- [ ] HTTPS redirect enforced
- [ ] File upload restrictions active

### During Development
- [ ] Use `.env.example` for configuration
- [ ] Never commit `.env` to git
- [ ] Test rate limiting
- [ ] Validate all user inputs
- [ ] Use parameterized queries
- [ ] Handle errors securely
- [ ] Log security events
- [ ] Run security audit: `npm run security`

---

## 🐛 Common Vulnerabilities & Fixes

### SQL Injection
```javascript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Fixed
const query = 'SELECT * FROM users WHERE id = $1';
db.query(query, [userId]);
```

### Cross-Site Scripting (XSS)
```javascript
// ❌ Vulnerable (in EJS template)
<%- userInput %>

// ✅ Fixed (auto-escapes)
<%= userInput %>

// ✅ Also use sanitizer
const safe = validators.sanitizeHTML(userInput);
<%= safe %>
```

### Cross-Site Request Forgery (CSRF)
```javascript
// ✅ Protected by session + sameSite cookie
// No action needed - framework handles it
```

### Insecure Deserialization
```javascript
// ❌ Never do this
eval(userInput);
JSON.parse(userInput);  // if untrusted

// ✅ Safe parsing
JSON.parse(userInput);  // with try-catch
```

### Broken Authentication
```javascript
// ✅ Use provided middleware
const { requireAuth, requireAdmin } = require('./middleware/auth');

router.get('/admin', requireAdmin, (req, res) => {
  // Only admins reach here
});
```

### Sensitive Data Exposure
```javascript
// ✅ Use HTTPS
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(`https://${req.headers.host}${req.url}`);
}

// ✅ Use HTTP-only cookies
res.cookie('authToken', token, { httpOnly: true });

// ✅ Don't log sensitive data
logger.error('Error', { error: message });  // Good
logger.error('Error', { password });  // Bad!
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Rate Limiting](https://www.npmjs.com/package/express-rate-limit)

