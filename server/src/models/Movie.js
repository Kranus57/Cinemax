import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required'],
      trim: true,
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true,
      },
    ],
    languages: {
      type: [String],
      required: [true, 'At least one language must be specified'],
      default: ['English'],
    },
    durationInMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'Screening end date is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Movie poster URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    censorRating: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA',
    },
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, default: 'Actor' },
        profileUrl: { type: String, default: '' },
      },
    ],
    crew: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
      },
    ],
    ratingAverage: {
      type: Number,
      default: 8.5,
      min: [0, 'Rating cannot be negative'],
      max: [10, 'Rating cannot exceed 10'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

movieSchema.index({ title: 'text', synopsis: 'text' });
movieSchema.index({ isActive: 1, releaseDate: -1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ languages: 1 });

export const Movie = mongoose.model('Movie', movieSchema);
