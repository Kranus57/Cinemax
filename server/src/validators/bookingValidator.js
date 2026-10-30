import { body, param } from 'express-validator';

export const lockSeatsValidator = [
  body('showId').isMongoId().withMessage('Valid showId is required'),
  body('seatNumbers')
    .isArray({ min: 1, max: 10 })
    .withMessage('Seat numbers must be an array of 1 to 10 seats'),
];

export const createReservationValidator = [
  body('showId').isMongoId().withMessage('Valid showId is required'),
  body('seatNumbers')
    .isArray({ min: 1, max: 10 })
    .withMessage('Seat numbers must be an array of 1 to 10 seats'),
];

export const confirmBookingValidator = [
  body('bookingId').isMongoId().withMessage('Valid bookingId is required'),
  body('paymentDetails').isObject().withMessage('Payment details object is required'),
];

export const cancelBookingValidator = [
  param('id').isMongoId().withMessage('Valid booking ID is required'),
  body('reason').optional().trim(),
];
