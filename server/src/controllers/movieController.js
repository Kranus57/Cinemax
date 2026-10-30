import { Movie } from '../models/Movie.js';
import { Genre } from '../models/Genre.js';
import { Show } from '../models/Show.js';
import { Cinema } from '../models/Cinema.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      city,
      limit = 20,
      page = 1,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { synopsis: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre) {
      // Find genre by slug or id
      const genreDoc = await Genre.findOne({
        $or: [{ slug: genre.toLowerCase() }, { name: { $regex: genre, $options: 'i' } }],
      });
      if (genreDoc) {
        query.genres = genreDoc._id;
      }
    }

    if (language) {
      query.languages = { $in: [language] };
    }

    // Filter movies playing in a specific city
    if (city) {
      const cinemasInCity = await Cinema.find({
        'address.city': { $regex: new RegExp(`^${city}$`, 'i') },
        isActive: true,
      }).select('_id');

      const cinemaIds = cinemasInCity.map((c) => c._id);
      const activeMovieIds = await Show.distinct('movieId', {
        cinemaId: { $in: cinemaIds },
        startTime: { $gte: new Date() },
        status: 'SCHEDULED',
      });

      query._id = { $in: activeMovieIds };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [movies, total] = await Promise.all([
      Movie.find(query)
        .populate('genres', 'name slug')
        .sort({ releaseDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Movie.countDocuments(query),
    ]);

    return ApiResponse.success(res, {
      movies,
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

export const getMovieBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const query = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier }
      : { slug: identifier };

    const movie = await Movie.findOne(query).populate('genres', 'name slug description');
    if (!movie) {
      throw ApiError.notFound('Movie not found');
    }

    return ApiResponse.success(res, { movie });
  } catch (error) {
    next(error);
  }
};

export const getMovieShows = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, city } = req.query;

    const filter = {
      movieId: id,
      status: 'SCHEDULED',
      startTime: { $gte: new Date() },
    };

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    if (city) {
      const cinemas = await Cinema.find({
        'address.city': { $regex: new RegExp(`^${city}$`, 'i') },
      }).select('_id');
      filter.cinemaId = { $in: cinemas.map((c) => c._id) };
    }

    const shows = await Show.find(filter)
      .populate('cinemaId', 'name address amenities')
      .populate('screenId', 'screenName soundSystem projectionType')
      .sort({ startTime: 1 });

    // Group shows by Cinema
    const cinemaMap = {};
    shows.forEach((show) => {
      const cinema = show.cinemaId;
      if (!cinema) return;
      if (!cinemaMap[cinema._id]) {
        cinemaMap[cinema._id] = {
          cinema,
          shows: [],
        };
      }
      cinemaMap[cinema._id].shows.push({
        _id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        format: show.format,
        language: show.language,
        categoryPricing: show.categoryPricing,
        availableSeatsCount: show.availableSeatsCount,
        totalSeats: show.totalSeats,
        screenName: show.screenId?.screenName,
      });
    });

    return ApiResponse.success(res, {
      cinemasWithShows: Object.values(cinemaMap),
    });
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      synopsis,
      genres,
      languages,
      durationInMinutes,
      releaseDate,
      endDate,
      posterUrl,
      backdropUrl,
      trailerUrl,
      censorRating,
      cast,
      crew,
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const movie = await Movie.create({
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      synopsis,
      genres,
      languages: languages || ['English'],
      durationInMinutes,
      releaseDate,
      endDate: endDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      posterUrl,
      backdropUrl: backdropUrl || '',
      trailerUrl: trailerUrl || '',
      censorRating: censorRating || 'UA',
      cast: cast || [],
      crew: crew || [],
    });

    return ApiResponse.created(res, { movie });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      throw ApiError.notFound('Movie not found');
    }

    return ApiResponse.success(res, { movie }, 'Movie updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      throw ApiError.notFound('Movie not found');
    }

    return ApiResponse.success(res, null, 'Movie deactivated successfully');
  } catch (error) {
    next(error);
  }
};
