import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import { useBooking } from '../context/BookingContext';
import { Loader } from '../components/common/Loader';
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  Play,
  Film,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { format, addDays } from 'date-fns';

export const MovieDetailsPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { setActiveShow, setActiveMovie, setActiveCinema } = useBooking();

  const [movie, setMovie] = useState(null);
  const [cinemasWithShows, setCinemasWithShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // 1. Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await movieApi.getMovieByIdOrSlug(identifier);
        setMovie(res.data.movie);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [identifier]);

  // 2. Fetch available shows for selected date
  useEffect(() => {
    if (!movie?._id) return;

    const fetchShows = async () => {
      setShowsLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const res = await movieApi.getMovieShows(movie._id, { date: formattedDate });
        setCinemasWithShows(res.data.cinemasWithShows || []);
      } catch (err) {
        console.error(err);
      } finally {
        setShowsLoading(false);
      }
    };

    fetchShows();
  }, [movie, selectedDate]);

  const handleSelectShowtime = (show, cinema) => {
    setActiveShow(show);
    setActiveMovie(movie);
    setActiveCinema(cinema);
    navigate(`/seat-selection/${show._id}`);
  };

  if (loading) return <Loader message="Loading movie details..." />;
  if (!movie) return <div className="text-center py-20 text-gray-400">Movie not found</div>;

  const durationStr = `${Math.floor(movie.durationInMinutes / 60)}h ${movie.durationInMinutes % 60}m`;

  // Generate 5 dates starting from today
  const dates = Array.from({ length: 5 }).map((_, i) => addDays(new Date(), i));

  // Extract YouTube embed URL if applicable
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : url;
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Movie Hero Header with Backdrop */}
      <div className="relative w-full h-[450px] md:h-[500px] overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/60 to-transparent"></div>

        {/* Floating Content Banner */}
        <div className="absolute bottom-8 left-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Poster Thumbnail */}
            <div className="w-36 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 hidden sm:block">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Key Meta */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-red-600/30 text-red-400 border border-red-500/50 text-xs font-black px-2.5 py-0.5 rounded uppercase">
                  {movie.censorRating || 'PG-13'}
                </span>
                <div className="flex items-center space-x-1 bg-black/60 px-2.5 py-0.5 rounded text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{movie.ratingAverage?.toFixed(1) || '8.5'}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{durationStr}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {movie.genres?.map((genre) => (
                  <span
                    key={typeof genre === 'object' ? genre._id : genre}
                    className="text-xs bg-gray-800/80 backdrop-blur-md text-gray-200 px-3 py-1 rounded-full border border-gray-700/60"
                  >
                    {typeof genre === 'object' ? genre.name : genre}
                  </span>
                ))}
                <span className="text-xs text-gray-400 ml-2">
                  Languages: {movie.languages?.join(', ')}
                </span>
              </div>
            </div>

            {/* Trailer Action */}
            {movie.trailerUrl && (
              <button
                onClick={() => setShowTrailer(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white font-bold px-5 py-3 rounded-xl flex items-center space-x-2 text-xs transition-colors shrink-0"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content & Showtime Picker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Synopsis, Cast & Crew */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                Synopsis
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {movie.synopsis}
              </p>
            </div>

            {movie.cast?.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Starring Cast
                </h3>
                <div className="space-y-3">
                  {movie.cast.map((actor, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                        {actor.name.charAt(0)}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-gray-200">{actor.name}</p>
                        <p className="text-gray-500">{actor.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Date Tabs & Cinema Showtimes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selector Tabs */}
            <div className="glass-panel p-4 rounded-2xl flex items-center space-x-3 overflow-x-auto scrollbar-none">
              {dates.map((d, index) => {
                const isSelected =
                  format(selectedDate, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-3 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-[#151926] text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {index === 0 ? 'Today' : format(d, 'EEE')}
                    </span>
                    <span className="text-base font-black mt-0.5">{format(d, 'd')}</span>
                    <span className="text-[10px]">{format(d, 'MMM')}</span>
                  </button>
                );
              })}
            </div>

            {/* Cinema Shows Listing */}
            <div>
              <h2 className="text-lg font-black text-white flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-red-500" />
                <span>Available Theatres & Showtimes</span>
              </h2>

              {showsLoading ? (
                <Loader message="Loading screen schedules..." />
              ) : cinemasWithShows.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-gray-400">
                  <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm">No shows scheduled for this date</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try selecting another day from the calendar above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cinemasWithShows.map(({ cinema, shows }) => (
                    <div
                      key={cinema._id}
                      className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800/80 gap-2">
                        <div>
                          <h4 className="font-bold text-base text-white">{cinema.name}</h4>
                          <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>
                              {cinema.address?.street}, {cinema.address?.city}
                            </span>
                          </div>
                        </div>

                        {/* Cinema Amenities */}
                        <div className="flex flex-wrap gap-1.5">
                          {cinema.amenities?.slice(0, 3).map((amenity, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-gray-800/60 text-gray-400 px-2 py-0.5 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Showtime Buttons Grid */}
                      <div className="pt-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-2">
                          Available Times
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {shows.map((show) => {
                            const showTimeStr = format(new Date(show.startTime), 'hh:mm a');

                            return (
                              <button
                                key={show._id}
                                onClick={() => handleSelectShowtime(show, cinema)}
                                className="group flex flex-col items-center bg-[#181d2e] hover:bg-red-600 border border-gray-700/80 hover:border-red-500 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 text-left"
                              >
                                <span className="text-xs font-black text-white group-hover:text-white">
                                  {showTimeStr}
                                </span>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <span className="text-[9px] uppercase font-bold text-cyan-400 group-hover:text-white">
                                    {show.format || '2D'}
                                  </span>
                                  <span className="text-[9px] text-gray-400 group-hover:text-red-200">
                                    • {show.screenName || 'Audi'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white font-bold flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
            <iframe
              src={getEmbedUrl(movie.trailerUrl)}
              title={movie.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};
