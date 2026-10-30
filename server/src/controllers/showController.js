import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { Movie } from '../models/Movie.js';
import { Cinema } from '../models/Cinema.js';
import { SEAT_CATEGORIES, SEAT_STATUS } from '../constants/seatStatus.js';
import { releaseExpiredLocksForShow } from '../services/seatLockService.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getShowById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Clean expired locks before returning layout
    await releaseExpiredLocksForShow(id);

    const show = await Show.findById(id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!show) {
      throw ApiError.notFound('Show not found');
    }

    return ApiResponse.success(res, { show });
  } catch (error) {
    next(error);
  }
};

export const createShow = async (req, res, next) => {
  try {
    const {
      movieId,
      cinemaId,
      screenId,
      showDate,
      startTime,
      format,
      language,
      categoryPricing,
    } = req.body;

    const [movie, cinema, screen] = await Promise.all([
      Movie.findById(movieId),
      Cinema.findById(cinemaId),
      Screen.findById(screenId),
    ]);

    if (!movie) throw ApiError.notFound('Movie not found');
    if (!cinema) throw ApiError.notFound('Cinema not found');
    if (!screen) throw ApiError.notFound('Screen not found');

    const start = new Date(startTime);
    // End time is start time + movie duration + 20 minutes buffer for cleaning/trailers
    const end = new Date(start.getTime() + (movie.durationInMinutes + 20) * 60 * 1000);

    // Check for scheduling collision on the same screen
    const collision = await Show.findOne({
      screenId,
      status: { $ne: 'CANCELLED' },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });

    if (collision) {
      throw ApiError.conflict(
        'Screen scheduling collision: Another show is already running in this screen during this time slot.'
      );
    }

    // Default category pricing fallback
    const pricingMap = {
      [SEAT_CATEGORIES.REGULAR]: 12.0,
      [SEAT_CATEGORIES.PREMIUM]: 16.5,
      [SEAT_CATEGORIES.RECLINER]: 22.0,
    };

    if (categoryPricing && Array.isArray(categoryPricing)) {
      categoryPricing.forEach((p) => {
        pricingMap[p.category] = p.price;
      });
    }

    // Instantiate screen blueprint seats into real-time show seats
    const showSeats = screen.layout.seats.map((seat) => ({
      seatNumber: seat.seatNumber,
      row: seat.row,
      column: seat.column,
      category: seat.category,
      price: pricingMap[seat.category] || 12.0,
      status: seat.isActive ? SEAT_STATUS.AVAILABLE : SEAT_STATUS.BOOKED,
      lockedBy: null,
      lockExpiresAt: null,
      bookingId: null,
    }));

    const show = await Show.create({
      movieId,
      cinemaId,
      screenId,
      showDate: new Date(showDate),
      startTime: start,
      endTime: end,
      format: format || '2D',
      language: language || movie.languages[0] || 'English',
      categoryPricing: Object.entries(pricingMap).map(([category, price]) => ({
        category,
        price,
      })),
      seats: showSeats,
      totalSeats: showSeats.length,
      availableSeatsCount: showSeats.filter((s) => s.status === SEAT_STATUS.AVAILABLE).length,
    });

    return ApiResponse.created(res, { show });
  } catch (error) {
    next(error);
  }
};

export const updateShowStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const show = await Show.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!show) {
      throw ApiError.notFound('Show not found');
    }

    return ApiResponse.success(res, { show }, 'Show status updated successfully');
  } catch (error) {
    next(error);
  }
};
