import { Router } from 'express';
import {
  getScreensByCinema,
  getScreenById,
  createScreen,
  updateScreen,
} from '../controllers/screenController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/cinema/:cinemaId', getScreensByCinema);
router.get('/:id', getScreenById);

// Admin-only routes
router.post('/', protect, requireAdmin, createScreen);
router.put('/:id', protect, requireAdmin, updateScreen);

export default router;
