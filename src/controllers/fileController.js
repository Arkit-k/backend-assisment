const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { fileProcessingQueue, isRedisAvailable } = require('../config/bull');

/**
 * Upload a file
 * @route POST /upload
 */
const uploadFile = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description } = req.body;

    // Create file record in database
    const file = await prisma.file.create({
      data: {
        userId: req.user.id,
        originalFilename: req.file.originalname,
        storagePath: req.file.path,
        title: title || req.file.originalname,
        description,
        status: 'uploaded'
      }
    });

    // Add job to processing queue if Redis is available
    if (isRedisAvailable && fileProcessingQueue) {
      await fileProcessingQueue.add('processFile', {
        fileId: file.id,
        filePath: file.storagePath
      });
    } else {
      // Simulate processing directly if Redis is not available
      console.log('Simulating file processing for file ID:', file.id);

      // Update file status to processing
      await prisma.file.update({
        where: { id: file.id },
        data: { status: 'processing' }
      });

      // Process in the background using setTimeout
      setTimeout(async () => {
        try {
          // Read file
          const fileBuffer = fs.readFileSync(file.storagePath);

          // Calculate file hash
          const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

          // Extract file metadata
          const extractedData = JSON.stringify({
            fileSize: fileBuffer.length,
            fileHash,
            processedAt: new Date().toISOString()
          });

          // Update file status to processed
          await prisma.file.update({
            where: { id: file.id },
            data: {
              status: 'processed',
              extractedData
            }
          });

          console.log(`File ${file.id} processed successfully`);
        } catch (error) {
          console.error(`Error processing file ${file.id}:`, error);

          // Update file status to failed
          await prisma.file.update({
            where: { id: file.id },
            data: {
              status: 'failed',
              extractedData: JSON.stringify({ error: error.message })
            }
          });
        }
      }, 2000); // Simulate 2 second processing time
    }

    // Return file info
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file.id,
        originalFilename: file.originalFilename,
        title: file.title,
        status: file.status,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get file by ID
 * @route GET /files/:id
 */
const getFileById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find file
    const file = await prisma.file.findUnique({
      where: { id: parseInt(id) }
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Return file info
    res.status(200).json({
      file: {
        id: file.id,
        originalFilename: file.originalFilename,
        title: file.title,
        description: file.description,
        status: file.status,
        extractedData: file.extractedData,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all files for the authenticated user
 * @route GET /files
 */
const getAllFiles = async (req, res, next) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Find files
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
      take: limit,
      skip: offset,
      orderBy: { uploadedAt: 'desc' }
    });

    // Get total count
    const count = await prisma.file.count({
      where: { userId: req.user.id }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    // Return files
    res.status(200).json({
      files: files.map(file => ({
        id: file.id,
        originalFilename: file.originalFilename,
        title: file.title,
        status: file.status,
        uploadedAt: file.uploadedAt
      })),
      pagination: {
        totalFiles: count,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFileById,
  getAllFiles
};
