import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { startLockCleanupWorker } from './services/seatLockService.js';
import { seedDatabase } from './seed/seedData.js';
import { Movie } from './models/Movie.js';
import { logger } from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Auto-seed if database is currently empty
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      logger.info('Database is empty. Automatically triggering initial seeder...');
      await seedDatabase();
    }

    // 3. Create HTTP server & bind Socket.io
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    // 4. Start periodic background seat lock cleanup worker (runs every 30s)
    startLockCleanupWorker(30000);
    logger.info('Periodic seat lock cleanup worker started (30s interval)');

    // 5. Start listening
    const server = httpServer.listen(PORT, () => {
      logger.success(`🚀 CineVerse API Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
      logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logger.warn(`Received ${signal}. Gracefully shutting down CineVerse server...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Server closed and database connections terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Critical failure during server startup:', error);
    process.exit(1);
  }
};

startServer();
