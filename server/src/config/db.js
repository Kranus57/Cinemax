import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cineverse';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Fast timeout to fallback if local mongod is absent
    });
    logger.success(`MongoDB Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (initialErr) {
    logger.warn(`Could not connect to external MongoDB at ${uri}. Launching isolated in-memory MongoDB engine...`);

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'cineverse',
        },
      });
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      logger.success(`Zero-Config In-Memory MongoDB running at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      logger.error('Failed to initialize both external and in-memory MongoDB engines:', memErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
