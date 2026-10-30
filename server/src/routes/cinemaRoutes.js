import { Router } from 'express';
import {
  getAllCinemas,
  getCinemaById,
  getDistinctCities,
  createCinema,
  updateCinema,
  deleteCinema,
} from '../controllers/cinemaController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', getAllCinemas);
router.get('/cities', getDistinctCities);
router.get('/:id', getCinemaById);

// Admin endpoints
router.post('/', protect, requireAdmin, createCinema);
router.put('/:id', protect, requireAdmin, updateCinema);
router.delete('/:id', protect, requireAdmin, deleteCinema);

export default router;
