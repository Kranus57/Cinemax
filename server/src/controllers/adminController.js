import { Booking } from '../models/Booking.js';
import { Movie } from '../models/Movie.js';
import { Cinema } from '../models/Cinema.js';
import { User } from '../models/User.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBookings,
      confirmedBookings,
      totalMovies,
      totalCinemas,
      totalUsers,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.find({ bookingStatus: BOOKING_STATUS.CONFIRMED }),
      Movie.countDocuments({ isActive: true }),
      Cinema.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Booking.find()
        .populate('userId', 'name email')
        .populate('movieId', 'title posterUrl')
        .populate('cinemaId', 'name')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Calculate daily revenue for the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenueAggregation = await Booking.aggregate([
      {
        $match: {
          bookingStatus: BOOKING_STATUS.CONFIRMED,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return ApiResponse.success(res, {
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalBookings,
        confirmedBookingsCount: confirmedBookings.length,
        totalMovies,
        totalCinemas,
        totalUsers,
      },
      dailyRevenue: dailyRevenueAggregation,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) {
      query.bookingStatus = status.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name email')
        .populate('movieId', 'title')
        .populate('cinemaId', 'name')
        .populate('screenId', 'screenName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query),
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
