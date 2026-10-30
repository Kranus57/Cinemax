import mongoose from 'mongoose';
import { SEAT_CATEGORIES, SEAT_STATUS } from '../constants/seatStatus.js';

const showSeatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    row: {
      type: String,
      required: true,
    },
    column: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [SEAT_CATEGORIES.REGULAR, SEAT_CATEGORIES.PREMIUM, SEAT_CATEGORIES.RECLINER],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Seat price cannot be negative'],
    },
    status: {
      type: String,
      enum: [SEAT_STATUS.AVAILABLE, SEAT_STATUS.LOCKED, SEAT_STATUS.BOOKED],
      default: SEAT_STATUS.AVAILABLE,
      required: true,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required'],
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required'],
      index: true,
    },
    showDate: {
      type: Date,
      required: [true, 'Show date is required'],
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Show start timestamp is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'Show end timestamp is required'],
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'],
      default: '2D',
    },
    language: {
      type: String,
      required: true,
    },
    categoryPricing: [
      {
        category: {
          type: String,
          enum: [SEAT_CATEGORIES.REGULAR, SEAT_CATEGORIES.PREMIUM, SEAT_CATEGORIES.RECLINER],
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    seats: [showSeatSchema],
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeatsCount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

showSchema.index({ cinemaId: 1, showDate: 1, movieId: 1 });
showSchema.index({ movieId: 1, showDate: 1 });
showSchema.index({ screenId: 1, startTime: 1, endTime: 1 });
showSchema.index({ 'seats.seatNumber': 1, 'seats.status': 1 });

export const Show = mongoose.model('Show', showSchema);
