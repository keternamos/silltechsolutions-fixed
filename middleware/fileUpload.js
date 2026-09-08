const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const logger = require('../utils/logger');

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-uuid.ext
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!config.allowedFileTypes.includes(file.mimetype)) {
    logger.warn('Invalid file type attempt', {
      mimetype: file.mimetype,
      fieldname: file.fieldname,
      userId: req.user?.id,
    });
    return cb(
      new Error(
        `File type not allowed. Allowed types: ${config.allowedFileTypes.join(', ')}`
      )
    );
  }

  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        error: `File too large. Maximum size: ${config.maxFileSize / 1024 / 1024}MB`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
    logger.error('Multer error', { error: err.message });
    return res.status(400).json({ error: 'File upload failed' });
  }

  if (err) {
    logger.error('File upload error', { error: err.message });
    return res.status(400).json({ error: err.message });
  }

  next();
};

module.exports = {
  upload,
  handleUploadError,
};
