import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Show } from '../models/Show.js';
import { Movie } from '../models/Movie.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';
import { SEAT_STATUS } from '../constants/seatStatus.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { broadcastSeatBooked, broadcastSeatReleased } from '../config/socket.js';
import { generateTicketQR } from './qrService.js';
import { sendBookingConfirmationEmail } from './emailService.js';

const CONVENIENCE_FEE_PER_SEAT = 1.5;
const TAX_RATE = 0.08; // 8% tax

const generateBookingNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CV-${dateStr}-${randomHex}`;
};

/**
 * Initialize Booking / Checkout Reservation
 */
export const createBookingReservation = async ({ showId, seatNumbers, userId }) => {
  const show = await Show.findById(showId)
    .populate('movieId')
    .populate('cinemaId')
    .populate('screenId');

  if (!show) {
    throw ApiError.notFound('Show not found');
  }

  // Verify that the requested seats are locked by THIS user
  const lockedSeats = show.seats.filter(
    (s) =>
      seatNumbers.includes(s.seatNumber) &&
      s.status === SEAT_STATUS.LOCKED &&
      s.lockedBy &&
      s.lockedBy.toString() === userId.toString()
  );

  if (lockedSeats.length !== seatNumbers.length) {
    throw ApiError.badRequest(
      'Seats are not currently locked by you or session has expired. Please select seats again.'
    );
  }

  const bookedSeats = lockedSeats.map((s) => ({
    seatNumber: s.seatNumber,
    category: s.category,
    price: s.price,
  }));

  const subtotal = bookedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = bookedSeats.length * CONVENIENCE_FEE_PER_SEAT;
  const taxes = Math.round((subtotal + convenienceFee) * TAX_RATE * 100) / 100;
  const totalAmount = Math.round((subtotal + convenienceFee + taxes) * 100) / 100;

  const bookingNumber = generateBookingNumber();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const booking = await Booking.create({
    bookingNumber,
    userId,
    showId: show._id,
    movieId: show.movieId._id,
    cinemaId: show.cinemaId._id,
    screenId: show.screenId._id,
    seats: bookedSeats,
    subtotal,
    convenienceFee,
    taxes,
    totalAmount,
    bookingStatus: BOOKING_STATUS.RESERVED,
    paymentStatus: PAYMENT_STATUS.PENDING,
    expiresAt,
  });

  return {
    booking,
    movie: show.movieId,
    cinema: show.cinemaId,
    screen: show.screenId,
    showTime: show.startTime,
  };
};

/**
 * Confirm Booking after Successful Payment
 */
export const confirmBooking = async ({ bookingId, paymentDetails, userId }) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) {
    throw ApiError.notFound('Booking reservation not found');
  }

  if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
    return booking;
  }

  const show = await Show.findById(booking.showId)
    .populate('movieId')
    .populate('cinemaId')
    .populate('screenId');

  if (!show) {
    throw ApiError.notFound('Show associated with booking not found');
  }

  const seatNumbers = booking.seats.map((s) => s.seatNumber);

  // 1. Create Payment record
  const payment = await Payment.create({
    bookingId: booking._id,
    userId,
    amount: booking.totalAmount,
    currency: 'USD',
    provider: paymentDetails.provider || 'MOCK',
    orderId: paymentDetails.orderId || `ORD-${Date.now()}`,
    transactionId: paymentDetails.transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    status: PAYMENT_STATUS.SUCCESS,
    paymentMethod: paymentDetails.paymentMethod || 'card',
    rawGatewayResponse: paymentDetails,
  });

  // 2. Transition show seats to BOOKED
  await Show.updateOne(
    { _id: show._id },
    {
      $set: {
        'seats.$[elem].status': SEAT_STATUS.BOOKED,
        'seats.$[elem].lockedBy': null,
        'seats.$[elem].lockExpiresAt': null,
        'seats.$[elem].bookingId': booking._id,
      },
      $inc: {
        availableSeatsCount: -seatNumbers.length,
      },
    },
    {
      arrayFilters: [{ 'elem.seatNumber': { $in: seatNumbers } }],
    }
  );

  // 3. Generate QR code
  const qrCodeUrl = await generateTicketQR({
    bookingNumber: booking.bookingNumber,
    movieTitle: show.movieId.title,
    cinemaName: show.cinemaId.name,
    screenName: show.screenId.screenName,
    startTime: show.startTime,
    endTime: show.endTime,
    seats: booking.seats,
    totalAmount: booking.totalAmount,
  });

  // 4. Update Booking
  booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
  booking.paymentStatus = PAYMENT_STATUS.COMPLETED;
  booking.paymentId = payment._id;
  booking.qrCodeUrl = qrCodeUrl;
  await booking.save();

  // 5. Broadcast to active clients viewing seat map
  broadcastSeatBooked(show._id, seatNumbers);

  // 6. Send email confirmation asynchronously
  User.findById(userId)
    .then((user) => {
      if (user && user.email) {
        sendBookingConfirmationEmail({
          to: user.email,
          userName: user.name,
          bookingNumber: booking.bookingNumber,
          movieTitle: show.movieId.title,
          cinemaName: show.cinemaId.name,
          screenName: show.screenId.screenName,
          startTime: show.startTime,
          seats: booking.seats,
          totalAmount: booking.totalAmount,
        });
      }
    })
    .catch((err) => logger.error('Failed to trigger confirmation email:', err));

  return booking;
};

/**
 * Cancel Booking and Handle Refund Policy
 */
export const cancelBooking = async ({ bookingId, userId, reason = 'User requested cancellation' }) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
    throw ApiError.badRequest('Booking has already been cancelled');
  }

  const show = await Show.findById(booking.showId);
  if (!show) {
    throw ApiError.notFound('Show not found');
  }

  const now = new Date();
  const showTime = new Date(show.startTime);
  const hoursUntilShow = (showTime - now) / (1000 * 60 * 60);

  if (hoursUntilShow < 2) {
    throw ApiError.badRequest(
      'Tickets cannot be cancelled within 2 hours of the show start time.'
    );
  }

  // Refund policy:
  // > 24 hours: 100% of ticket subtotal
  // 2 - 24 hours: 75% of ticket subtotal
  // (Convenience fee & taxes are non-refundable)
  let refundPercentage = hoursUntilShow >= 24 ? 1.0 : 0.75;
  const refundAmount = Math.round(booking.subtotal * refundPercentage * 100) / 100;

  const seatNumbers = booking.seats.map((s) => s.seatNumber);

  // 1. Release seats back to AVAILABLE in Show
  await Show.updateOne(
    { _id: show._id },
    {
      $set: {
        'seats.$[elem].status': SEAT_STATUS.AVAILABLE,
        'seats.$[elem].lockedBy': null,
        'seats.$[elem].lockExpiresAt': null,
        'seats.$[elem].bookingId': null,
      },
      $inc: {
        availableSeatsCount: seatNumbers.length,
      },
    },
    {
      arrayFilters: [{ 'elem.seatNumber': { $in: seatNumbers } }],
    }
  );

  // 2. Update Booking
  booking.bookingStatus = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
  booking.cancellation = {
    isCancelled: true,
    cancelledAt: new Date(),
    reason,
    refundAmount,
    refundStatus: 'COMPLETED',
  };
  await booking.save();

  // 3. Update Payment record
  if (booking.paymentId) {
    await Payment.findByIdAndUpdate(booking.paymentId, {
      status: PAYMENT_STATUS.REFUNDED,
    });
  }

  // 4. Broadcast released seats
  broadcastSeatReleased(show._id, seatNumbers);

  return {
    booking,
    refundAmount,
    refundPercentage: `${refundPercentage * 100}%`,
  };
};
