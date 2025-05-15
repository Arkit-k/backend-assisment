require('dotenv').config();
const prisma = require('./src/lib/prisma');

console.log('Starting file processing worker...');

// Function to check Redis availability with retries
const checkRedisAvailability = async (retries = 5, delay = 5000) => {
  let currentTry = 0;

  while (currentTry < retries) {
    try {
      console.log(`Attempt ${currentTry + 1}/${retries} to connect to Redis...`);

      // Dynamically import to allow for retries
      const { isRedisAvailable } = require('./src/config/bull');

      if (isRedisAvailable) {
        console.log('Redis connection successful!');
        return true;
      } else {
        console.log('Redis is not available yet. Retrying...');
        currentTry++;

        if (currentTry < retries) {
          console.log(`Waiting ${delay/1000} seconds before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Error checking Redis availability:', error.message);
      currentTry++;

      if (currentTry < retries) {
        console.log(`Waiting ${delay/1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.log('Max retries reached. Redis is not available.');
  return false;
};

// Check Redis availability before starting
(async () => {
  const isRedisAvailable = await checkRedisAvailability();

  if (!isRedisAvailable) {
    console.log('Redis is not available. Background processing will be simulated in the main application.');
    console.log('Worker is not needed in this mode. Exiting...');
    process.exit(0);
  }
})();

// If Redis is available (which it won't be in this implementation), continue with worker setup
const startWorker = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection established successfully');

    // Import worker
    const fileProcessingWorker = require('./src/jobs/fileProcessor');

    // Handle process termination
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing worker...');
      await fileProcessingWorker.close();
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, closing worker...');
      await fileProcessingWorker.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startWorker();
