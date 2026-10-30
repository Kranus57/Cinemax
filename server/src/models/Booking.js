import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';

const bookedSeatItemSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    seats: {
      type: [bookedSeatItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'A booking must have at least one seat',
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: [
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.COMPLETED,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.REFUNDED,
      ],
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: [
        BOOKING_STATUS.RESERVED,
        BOOKING_STATUS.CONFIRMED,
        BOOKING_STATUS.CANCELLED,
      ],
      default: BOOKING_STATUS.RESERVED,
      index: true,
    },
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date, default: null },
      reason: { type: String, default: null },
      refundAmount: { type: Number, default: 0 },
      refundStatus: {
        type: String,
        enum: ['NONE', 'INITIATED', 'COMPLETED'],
        default: 'NONE',
      },
    },
    qrCodeUrl: {
      type: String,
      default: null,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
