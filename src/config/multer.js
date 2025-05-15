const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExt}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept all file types for now
  // In a production environment, you might want to restrict file types
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.UPLOAD_LIMIT || 5 * 1024 * 1024 // Default 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
