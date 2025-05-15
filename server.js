require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/lib/prisma');

const PORT = process.env.PORT || 3000;

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
