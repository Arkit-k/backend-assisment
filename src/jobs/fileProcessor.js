const { Worker } = require('bullmq');
const fs = require('fs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { redisOptions } = require('../config/bull');

// Create worker
const fileProcessingWorker = new Worker('fileProcessing', async (job) => {
  const { fileId, filePath } = job.data;

  try {
    // Update file status to processing
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'processing' }
    });

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Simulate processing - calculate file hash
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Simulate longer processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract file metadata (in a real app, this would be more sophisticated)
    const extractedData = JSON.stringify({
      fileSize: fileBuffer.length,
      fileHash,
      processedAt: new Date().toISOString()
    });

    // Update file status to processed
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'processed',
        extractedData
      }
    });

    return { success: true, fileId };
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);

    // Update file status to failed
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'failed',
        extractedData: JSON.stringify({ error: error.message })
      }
    });

    throw error;
  }
}, { connection: redisOptions });

// Handle worker events
fileProcessingWorker.on('completed', job => {
  console.log(`Job ${job.id} completed for file ${job.data.fileId}`);
});

fileProcessingWorker.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed for file ${job.data.fileId}:`, error);
});

module.exports = fileProcessingWorker;
