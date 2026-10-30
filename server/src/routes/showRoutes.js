import { Router } from 'express';
import {
  getShowById,
  createShow,
  updateShowStatus,
} from '../controllers/showController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/:id', getShowById);

// Admin-only routes
router.post('/', protect, requireAdmin, createShow);
router.patch('/:id/status', protect, requireAdmin, updateShowStatus);

export default router;
