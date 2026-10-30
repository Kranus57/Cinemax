import { Show } from '../models/Show.js';
import { SEAT_STATUS } from '../constants/seatStatus.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { broadcastSeatLocked, broadcastSeatReleased } from '../config/socket.js';

const LOCK_DURATION_MS = Number(process.env.SEAT_LOCK_DURATION_MS) || 10 * 60 * 1000; // 10 minutes

/**
 * Reclaims expired locked seats across a specific show
 */
export const releaseExpiredLocksForShow = async (showId) => {
  const now = new Date();
  const show = await Show.findById(showId);
  if (!show) return [];

  const expiredSeats = show.seats.filter(
    (s) => s.status === SEAT_STATUS.LOCKED && s.lockExpiresAt && s.lockExpiresAt < now
  );

  if (expiredSeats.length === 0) return [];

  const expiredSeatNumbers = expiredSeats.map((s) => s.seatNumber);

  await Show.updateOne(
    { _id: showId },
    {
      $set: {
        'seats.$[elem].status': SEAT_STATUS.AVAILABLE,
        'seats.$[elem].lockedBy': null,
        'seats.$[elem].lockExpiresAt': null,
      },
    },
    {
      arrayFilters: [
        {
          'elem.seatNumber': { $in: expiredSeatNumbers },
          'elem.status': SEAT_STATUS.LOCKED,
        },
      ],
    }
  );

  broadcastSeatReleased(showId, expiredSeatNumbers);
  logger.info(`Auto-released ${expiredSeatNumbers.length} expired seats for show: ${showId}`);
  return expiredSeatNumbers;
};

/**
 * Concurrency-Safe Atomic Seat Locking
 */
export const lockSeats = async (showId, seatNumbers, userId) => {
  if (!seatNumbers || !seatNumbers.length) {
    throw ApiError.badRequest('At least one seat must be selected');
  }

  // 1. First reclaim any expired locks in this show
  await releaseExpiredLocksForShow(showId);

  // 2. Fetch current show
  const show = await Show.findById(showId);
  if (!show) {
    throw ApiError.notFound('Show not found');
  }

  if (show.status === 'CANCELLED' || show.status === 'COMPLETED') {
    throw ApiError.badRequest('This show is no longer accepting bookings');
  }

  // 3. Inspect requested seats
  const selectedSeats = show.seats.filter((s) => seatNumbers.includes(s.seatNumber));
  if (selectedSeats.length !== seatNumbers.length) {
    throw ApiError.badRequest('One or more requested seats do not exist in this auditorium');
  }

  // 4. Verify each seat is AVAILABLE or already locked by the SAME user
  for (const seat of selectedSeats) {
    if (seat.status === SEAT_STATUS.BOOKED) {
      throw ApiError.conflict(`Seat ${seat.seatNumber} has already been booked`);
    }
    if (
      seat.status === SEAT_STATUS.LOCKED &&
      seat.lockedBy &&
      seat.lockedBy.toString() !== userId.toString()
    ) {
      throw ApiError.conflict(
        `Seat ${seat.seatNumber} is currently selected by another customer. Please choose other seats.`
      );
    }
  }

  const lockExpiresAt = new Date(Date.now() + LOCK_DURATION_MS);

  // 5. Atomic Update
  const updatedShow = await Show.findOneAndUpdate(
    {
      _id: showId,
      // Ensure all requested seats are still available or held by this user
      seats: {
        $all: seatNumbers.map((seatNum) => ({
          $elemMatch: {
            seatNumber: seatNum,
            $or: [
              { status: SEAT_STATUS.AVAILABLE },
              { status: SEAT_STATUS.LOCKED, lockedBy: userId },
            ],
          },
        })),
      },
    },
    {
      $set: {
        'seats.$[elem].status': SEAT_STATUS.LOCKED,
        'seats.$[elem].lockedBy': userId,
        'seats.$[elem].lockExpiresAt': lockExpiresAt,
      },
    },
    {
      arrayFilters: [{ 'elem.seatNumber': { $in: seatNumbers } }],
      new: true,
    }
  );

  if (!updatedShow) {
    throw ApiError.conflict(
      'Could not secure requested seats due to a concurrency conflict. Please re-select.'
    );
  }

  // Broadcast real-time lock update to all active browsers in the show room
  broadcastSeatLocked(showId, seatNumbers, userId);

  const lockedSeatDetails = updatedShow.seats
    .filter((s) => seatNumbers.includes(s.seatNumber))
    .map((s) => ({
      seatNumber: s.seatNumber,
      category: s.category,
      price: s.price,
    }));

  const subtotal = lockedSeatDetails.reduce((acc, s) => acc + s.price, 0);

  return {
    showId,
    seats: lockedSeatDetails,
    subtotal,
    lockExpiresAt,
    remainingSeconds: Math.floor(LOCK_DURATION_MS / 1000),
  };
};

/**
 * Release Locked Seats Explicitly
 */
export const releaseSeats = async (showId, seatNumbers, userId) => {
  const query = {
    _id: showId,
  };

  const filterCondition = {
    'elem.seatNumber': { $in: seatNumbers },
    'elem.status': SEAT_STATUS.LOCKED,
  };

  // If userId provided, make sure only the locking user or an admin can unlock
  if (userId) {
    filterCondition['elem.lockedBy'] = userId;
  }

  const updatedShow = await Show.findOneAndUpdate(
    query,
    {
      $set: {
        'seats.$[elem].status': SEAT_STATUS.AVAILABLE,
        'seats.$[elem].lockedBy': null,
        'seats.$[elem].lockExpiresAt': null,
      },
    },
    {
      arrayFilters: [filterCondition],
      new: true,
    }
  );

  if (updatedShow) {
    broadcastSeatReleased(showId, seatNumbers);
  }

  return true;
};

/**
 * Periodic Background Lock Sweeper
 */
export const startLockCleanupWorker = (intervalMs = 30000) => {
  setInterval(async () => {
    try {
      const now = new Date();
      const showsWithExpiredSeats = await Show.find({
        'seats.status': SEAT_STATUS.LOCKED,
        'seats.lockExpiresAt': { $lt: now },
      }).select('_id');

      for (const show of showsWithExpiredSeats) {
        await releaseExpiredLocksForShow(show._id);
      }
    } catch (err) {
      logger.error('Error in seat lock cleanup worker:', err);
    }
  }, intervalMs);
};
