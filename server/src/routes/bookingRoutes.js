import { Router } from 'express';
import {
  lockSeats,
  releaseSeats,
  createReservation,
  confirmBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { seatLockLimiter } from '../middlewares/rateLimiter.js';
import {
  lockSeatsValidator,
  createReservationValidator,
  confirmBookingValidator,
  cancelBookingValidator,
} from '../validators/bookingValidator.js';

const router = Router();

router.post('/lock', protect, seatLockLimiter, lockSeatsValidator, validate, lockSeats);
router.post('/release', protect, releaseSeats);
router.post('/reserve', protect, createReservationValidator, validate, createReservation);
router.post('/confirm', protect, confirmBookingValidator, validate, confirmBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBookingValidator, validate, cancelBooking);

export default router;
