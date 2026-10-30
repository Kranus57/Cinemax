import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join show room for live seat updates
    socket.on('join:show', (showId) => {
      if (showId) {
        socket.join(`show:${showId}`);
        logger.info(`Client ${socket.id} joined room show:${showId}`);
      }
    });

    // Leave show room
    socket.on('leave:show', (showId) => {
      if (showId) {
        socket.leave(`show:${showId}`);
        logger.info(`Client ${socket.id} left room show:${showId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

// Event broadcasting helpers
export const broadcastSeatLocked = (showId, seatNumbers, userId) => {
  if (!io) return;
  io.to(`show:${showId}`).emit('seat:locked', {
    showId,
    seatNumbers,
    userId,
    timestamp: new Date().toISOString(),
  });
};

export const broadcastSeatReleased = (showId, seatNumbers) => {
  if (!io) return;
  io.to(`show:${showId}`).emit('seat:released', {
    showId,
    seatNumbers,
    timestamp: new Date().toISOString(),
  });
};

export const broadcastSeatBooked = (showId, seatNumbers) => {
  if (!io) return;
  io.to(`show:${showId}`).emit('seat:booked', {
    showId,
    seatNumbers,
    timestamp: new Date().toISOString(),
  });
};
