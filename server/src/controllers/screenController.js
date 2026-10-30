import { Screen } from '../models/Screen.js';
import { Cinema } from '../models/Cinema.js';
import { SEAT_CATEGORIES } from '../constants/seatStatus.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getScreensByCinema = async (req, res, next) => {
  try {
    const { cinemaId } = req.params;
    const screens = await Screen.find({ cinemaId, isActive: true }).sort({ screenNumber: 1 });
    return ApiResponse.success(res, { screens });
  } catch (error) {
    next(error);
  }
};

export const getScreenById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findById(id).populate('cinemaId', 'name address');
    if (!screen) {
      throw ApiError.notFound('Screen not found');
    }
    return ApiResponse.success(res, { screen });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to generate seat grid automatically if manual layout not supplied
 */
const generateDefaultSeats = (totalRows = 8, totalCols = 10) => {
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const seats = [];

  for (let r = 0; r < totalRows; r++) {
    const row = rowLetters[r] || `R${r + 1}`;
    // Assign categories: Front 3 rows Regular, next 3 rows Premium, top 2 rows Recliner
    let category = SEAT_CATEGORIES.REGULAR;
    if (r >= totalRows - 2) {
      category = SEAT_CATEGORIES.RECLINER;
    } else if (r >= 3) {
      category = SEAT_CATEGORIES.PREMIUM;
    }

    for (let c = 1; c <= totalCols; c++) {
      seats.push({
        seatNumber: `${row}${c}`,
        row,
        column: c,
        category,
        isActive: true,
      });
    }
  }

  return seats;
};

export const createScreen = async (req, res, next) => {
  try {
    const {
      cinemaId,
      screenNumber,
      screenName,
      soundSystem,
      projectionType,
      layout,
    } = req.body;

    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      throw ApiError.notFound('Cinema not found');
    }

    const existingScreen = await Screen.findOne({ cinemaId, screenNumber });
    if (existingScreen) {
      throw ApiError.conflict(`Screen number ${screenNumber} already exists in this cinema.`);
    }

    const totalRows = layout?.totalRows || 8;
    const totalColumns = layout?.totalColumns || 10;
    const seats = layout?.seats?.length
      ? layout.seats
      : generateDefaultSeats(totalRows, totalColumns);

    const screen = await Screen.create({
      cinemaId,
      screenNumber,
      screenName,
      soundSystem: soundSystem || 'Dolby Atmos 7.1',
      projectionType: projectionType || 'Standard 2D',
      layout: {
        totalRows,
        totalColumns,
        seats,
      },
      totalCapacity: seats.length,
    });

    return ApiResponse.created(res, { screen });
  } catch (error) {
    next(error);
  }
};

export const updateScreen = async (req, res, next) => {
  try {
    const { id } = req.params;

    const screen = await Screen.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!screen) {
      throw ApiError.notFound('Screen not found');
    }

    return ApiResponse.success(res, { screen }, 'Screen updated successfully');
  } catch (error) {
    next(error);
  }
};
