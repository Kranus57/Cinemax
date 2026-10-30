import { ApiResponse } from '../utils/apiResponse.js';

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    // For test and demonstration mode, provide instant mock order ID
    const orderId = `PAY_ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return ApiResponse.success(res, {
      orderId,
      amount,
      currency: 'USD',
      provider: 'MOCK',
      clientSecret: `mock_secret_${orderId}`,
    });
  } catch (error) {
    next(error);
  }
};
