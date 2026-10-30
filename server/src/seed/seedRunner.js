import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    logger.success('Seeder completed successfully. Disconnecting...');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to run seeder:', error);
    process.exit(1);
  }
};

run();
