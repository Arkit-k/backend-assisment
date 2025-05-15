const express = require('express');
const { uploadFile, getFileById, getAllFiles } = require('../controllers/fileController');
const authenticate = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

/**
 * @route POST /upload
 * @desc Upload a file
 * @access Private
 */
router.post('/upload', authenticate, upload.single('file'), uploadFile);

/**
 * @route GET /files/:id
 * @desc Get file by ID
 * @access Private
 */
router.get('/files/:id', authenticate, getFileById);

/**
 * @route GET /files
 * @desc Get all files for the authenticated user
 * @access Private
 */
router.get('/files', authenticate, getAllFiles);

module.exports = router;
