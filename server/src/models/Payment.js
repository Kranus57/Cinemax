import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/bookingStatus.js';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount must be greater than or equal to 0'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    provider: {
      type: String,
      enum: ['STRIPE', 'RAZORPAY', 'MOCK'],
      required: true,
    },
    orderId: {
      type: String,
      index: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    signature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        PAYMENT_STATUS.INITIATED,
        PAYMENT_STATUS.SUCCESS,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.REFUNDED,
      ],
      default: PAYMENT_STATUS.INITIATED,
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    rawGatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
