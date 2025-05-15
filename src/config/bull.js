// Initialize variables
let fileProcessingQueue = null;
let redisOptions = null;
let isRedisAvailable = false;

// Check if we're running in Docker
const isDocker = process.env.RUNNING_IN_DOCKER === 'true';

// Only try to connect to Redis if we're running in Docker
if (isDocker) {
  // Redis connection options for Docker
  redisOptions = {
    host: process.env.REDIS_HOST || 'redis',
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
} else {
  console.log('Running in local mode. Redis connection disabled. Background processing will be simulated.');
}

module.exports = {
  fileProcessingQueue,
  redisOptions,
  isRedisAvailable
};
