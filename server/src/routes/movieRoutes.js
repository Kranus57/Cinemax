import { Router } from 'express';
import {
  getAllMovies,
  getMovieBySlugOrId,
  getMovieShows,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', getAllMovies);
router.get('/:identifier', getMovieBySlugOrId);
router.get('/:id/shows', getMovieShows);

// Admin-only routes
router.post('/', protect, requireAdmin, createMovie);
router.put('/:id', protect, requireAdmin, updateMovie);
router.delete('/:id', protect, requireAdmin, deleteMovie);

export default router;
