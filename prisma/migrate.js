const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Pushing Prisma schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('Database schema updated successfully');
    
    // Test connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Close connection
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error migrating database:', error);
    process.exit(1);
  }
}

main();
