import React from 'react';

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Drama',
  'Animation',
  'Comedy',
  'Horror',
  'Thriller',
];

export const FilterBar = ({ selectedGenre, onSelectGenre }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {GENRES.map((genre) => {
        const isSelected =
          (genre === 'All' && !selectedGenre) ||
          selectedGenre?.toLowerCase() === genre.toLowerCase();

        return (
          <button
            key={genre}
            onClick={() => onSelectGenre(genre === 'All' ? '' : genre)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isSelected
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-[#151926] text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
};
