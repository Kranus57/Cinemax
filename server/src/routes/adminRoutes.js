import { Router } from 'express';
import {
  getDashboardStats,
  getAllBookings,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(protect, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/bookings', getAllBookings);

export default router;
