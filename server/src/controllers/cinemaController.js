import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllCinemas = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city) {
      query['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const cinemas = await Cinema.find(query).sort({ name: 1 });
    return ApiResponse.success(res, { cinemas });
  } catch (error) {
    next(error);
  }
};

export const getCinemaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cinema = await Cinema.findById(id);
    if (!cinema) {
      throw ApiError.notFound('Cinema not found');
    }

    const screens = await Screen.find({ cinemaId: cinema._id, isActive: true });

    return ApiResponse.success(res, { cinema, screens });
  } catch (error) {
    next(error);
  }
};

export const getDistinctCities = async (req, res, next) => {
  try {
    const cities = await Cinema.distinct('address.city', { isActive: true });
    return ApiResponse.success(res, { cities });
  } catch (error) {
    next(error);
  }
};

export const createCinema = async (req, res, next) => {
  try {
    const { name, address, amenities, contactPhone, contactEmail } = req.body;

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${address.city.toLowerCase()}`;

    const cinema = await Cinema.create({
      name,
      slug,
      address,
      amenities: amenities || ['Dolby Atmos', 'Recliner Seats', 'Food Court', 'Parking'],
      contactPhone,
      contactEmail,
    });

    return ApiResponse.created(res, { cinema });
  } catch (error) {
    next(error);
  }
};

export const updateCinema = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cinema = await Cinema.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!cinema) {
      throw ApiError.notFound('Cinema not found');
    }

    return ApiResponse.success(res, { cinema }, 'Cinema updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCinema = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cinema = await Cinema.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!cinema) {
      throw ApiError.notFound('Cinema not found');
    }

    return ApiResponse.success(res, null, 'Cinema deactivated successfully');
  } catch (error) {
    next(error);
  }
};
