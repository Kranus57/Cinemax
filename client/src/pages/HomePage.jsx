import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import { MovieCard } from '../components/movies/MovieCard';
import { FilterBar } from '../components/movies/FilterBar';
import { Loader } from '../components/common/Loader';
import { Sparkles, Film, Play, Ticket } from 'lucide-react';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || '';
  const city = searchParams.get('city') || '';

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await movieApi.getAllMovies({
          search,
          genre,
          city,
        });
        setMovies(response.data?.movies || []);
      } catch (err) {
        setError('Failed to load movies. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, genre, city]);

  const handleSelectGenre = (selectedGenre) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedGenre) {
      newParams.set('genre', selectedGenre.toLowerCase());
    } else {
      newParams.delete('genre');
    }
    setSearchParams(newParams);
  };

  const featuredMovie = movies[0];

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Movie Spotlight */}
      {featuredMovie && !search && !genre && (
        <div className="relative h-[480px] md:h-[560px] w-full overflow-hidden mb-12">
          {/* Backdrop Image */}
          <img
            src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
            alt={featuredMovie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.45] scale-105"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#090b10] via-[#090b10]/70 to-transparent"></div>

          {/* Hero Content */}
          <div className="absolute bottom-12 left-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-red-600/30 border border-red-500/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-red-400 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Premier Experience</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {featuredMovie.title}
              </h1>

              <p className="text-gray-300 text-sm sm:text-base mt-3 line-clamp-3 leading-relaxed">
                {featuredMovie.synopsis}
              </p>

              <div className="flex items-center space-x-4 mt-6">
                <Link
                  to={`/movie/${featuredMovie.slug || featuredMovie._id}`}
                  className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl flex items-center space-x-2 shadow-xl shadow-red-600/30 text-sm transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets Now</span>
                </Link>

                {featuredMovie.trailerUrl && (
                  <a
                    href={featuredMovie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl flex items-center space-x-2 backdrop-blur-md text-sm border border-white/10 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <Film className="w-6 h-6 text-red-500" />
              <span>{search ? `Results for "${search}"` : 'Now Showing in Theatres'}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Select your favorite movie to reserve premier seats
            </p>
          </div>

          {/* Genre Filter Pills */}
          <FilterBar
            selectedGenre={genre}
            onSelectGenre={handleSelectGenre}
          />
        </div>

        {/* Loading & Error States */}
        {loading ? (
          <Loader message="Fetching showtimes and blockbusters..." />
        ) : error ? (
          <div className="text-center py-16 text-rose-400">
            <p className="font-semibold">{error}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-[#121520] rounded-3xl border border-gray-800">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-300">No movies found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search query or selecting a different genre.
            </p>
          </div>
        ) : (
          /* Movie Cards Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
