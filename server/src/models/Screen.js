import mongoose from 'mongoose';
import { SEAT_CATEGORIES } from '../constants/seatStatus.js';

const seatBlueprintSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
      uppercase: true,
    },
    column: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [SEAT_CATEGORIES.REGULAR, SEAT_CATEGORIES.PREMIUM, SEAT_CATEGORIES.RECLINER],
      default: SEAT_CATEGORIES.REGULAR,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required'],
      index: true,
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
    },
    screenName: {
      type: String,
      required: [true, 'Screen name is required (e.g. Audi 1 - IMAX)'],
      trim: true,
    },
    soundSystem: {
      type: String,
      default: 'Dolby Atmos 7.1',
    },
    projectionType: {
      type: String,
      enum: ['Standard 2D', 'RealD 3D', 'IMAX 2D', 'IMAX 3D', '4K Laser'],
      default: 'Standard 2D',
    },
    layout: {
      totalRows: { type: Number, required: true },
      totalColumns: { type: Number, required: true },
      seats: [seatBlueprintSchema],
    },
    totalCapacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1 seat'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

screenSchema.index({ cinemaId: 1, screenNumber: 1 }, { unique: true });

export const Screen = mongoose.model('Screen', screenSchema);
