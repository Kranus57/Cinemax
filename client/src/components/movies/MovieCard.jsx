import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  const formattedDuration = `${Math.floor(movie.durationInMinutes / 60)}h ${
    movie.durationInMinutes % 60
  }m`;

  return (
    <Link
      to={`/movie/${movie.slug || movie._id}`}
      className="group relative flex flex-col bg-[#111420] rounded-2xl overflow-hidden border border-gray-800/80 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5"
    >
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Censor Rating Badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider text-gray-200 border border-white/10 uppercase">
          {movie.censorRating || 'PG-13'}
        </div>

        {/* Rating Pill */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.ratingAverage ? movie.ratingAverage.toFixed(1) : '8.5'}</span>
        </div>

        {/* Overlay CTA on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-600/40 text-xs">
            <Ticket className="w-4 h-4" />
            <span>Select Showtime</span>
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {movie.genres?.slice(0, 2).map((genre) => (
              <span
                key={typeof genre === 'object' ? genre._id : genre}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-800 text-gray-300"
              >
                {typeof genre === 'object' ? genre.name : genre}
              </span>
            ))}
          </div>
        </div>

        {/* Duration and Languages */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{formattedDuration}</span>
          </div>
          <span className="truncate max-w-[100px]">
            {movie.languages?.slice(0, 2).join(', ')}
          </span>
        </div>
      </div>
    </Link>
  );
};
