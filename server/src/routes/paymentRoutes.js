import { Router } from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/create-intent', protect, createPaymentIntent);

export default router;
