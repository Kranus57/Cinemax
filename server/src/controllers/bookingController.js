import {
  lockSeats as lockSeatsService,
  releaseSeats as releaseSeatsService,
} from '../services/seatLockService.js';
import {
  createBookingReservation,
  confirmBooking as confirmBookingService,
  cancelBooking as cancelBookingService,
} from '../services/bookingService.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const lockSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;
    const result = await lockSeatsService(showId, seatNumbers, req.user._id);
    return ApiResponse.success(res, result, 'Seats locked successfully for 10 minutes');
  } catch (error) {
    next(error);
  }
};

export const releaseSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;
    await releaseSeatsService(showId, seatNumbers, req.user._id);
    return ApiResponse.success(res, null, 'Seats released successfully');
  } catch (error) {
    next(error);
  }
};

export const createReservation = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;
    const result = await createBookingReservation({
      showId,
      seatNumbers,
      userId: req.user._id,
    });
    return ApiResponse.created(res, result, 'Booking reservation created');
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const { bookingId, paymentDetails } = req.body;
    const booking = await confirmBookingService({
      bookingId,
      paymentDetails,
      userId: req.user._id,
    });
    return ApiResponse.success(res, { booking }, 'Booking confirmed successfully!');
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find({ userId: req.user._id })
        .populate('movieId', 'title posterUrl durationInMinutes censorRating')
        .populate('cinemaId', 'name address')
        .populate('screenId', 'screenName soundSystem')
        .populate('showId', 'startTime endTime format language')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments({ userId: req.user._id }),
    ]);

    return ApiResponse.success(res, {
      bookings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      ...(req.user.role !== 'admin' && { userId: req.user._id }),
    })
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId')
      .populate('showId')
      .populate('userId', 'name email phone');

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    return ApiResponse.success(res, { booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await cancelBookingService({
      bookingId: id,
      userId: req.user._id,
      reason,
    });

    return ApiResponse.success(res, result, 'Booking cancelled and refund processed.');
  } catch (error) {
    next(error);
  }
};
