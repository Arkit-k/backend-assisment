// Initialize BullMQ if Redis is available
let fileProcessingQueue = null;
let redisOptions = null;
let isRedisAvailable = false;

// Redis connection options
redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  connectTimeout: 5000
};

// Try to initialize BullMQ
try {
  const { Queue } = require('bullmq');

  // Create file processing queue
  fileProcessingQueue = new Queue('fileProcessing', {
    connection: redisOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });

  isRedisAvailable = true;
  console.log('BullMQ initialized successfully with Redis at', redisOptions.host, redisOptions.port);
} catch (error) {
  console.warn('Failed to initialize BullMQ. Background processing will be simulated:', error.message);
}

module.exports = {
  fileProcessingQueue,
  redisOptions,
  isRedisAvailable
};
