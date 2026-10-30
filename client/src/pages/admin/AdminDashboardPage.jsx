import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { movieApi } from '../../api/movieApi';
import { cinemaApi } from '../../api/cinemaApi';
import { Loader } from '../../components/common/Loader';
import {
  DollarSign,
  Ticket,
  Film,
  Building,
  TrendingUp,
  Plus,
  Calendar,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'movie' | 'cinema' | 'show' | null
  const [moviesList, setMoviesList] = useState([]);
  const [cinemasList, setCinemasList] = useState([]);
  const [screensList, setScreensList] = useState([]);
  const [notification, setNotification] = useState('');

  // Form states
  const [movieForm, setMovieForm] = useState({
    title: '',
    synopsis: '',
    durationInMinutes: 120,
    languages: 'English',
    releaseDate: format(new Date(), 'yyyy-MM-dd'),
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    censorRating: 'PG-13',
  });

  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    city: 'New York',
    street: '',
    contactPhone: '+1 800 555 1234',
    contactEmail: 'theatre@cineverse.com',
  });

  const [showForm, setShowForm] = useState({
    movieId: '',
    cinemaId: '',
    screenId: '',
    showDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), "yyyy-MM-dd'T'18:00"),
    format: '2D',
    regularPrice: 12.5,
    premiumPrice: 16.0,
    reclinerPrice: 21.0,
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, cinemasRes] = await Promise.all([
        adminApi.getStats(),
        movieApi.getAllMovies({ limit: 100 }),
        cinemaApi.getAllCinemas(),
      ]);

      setData(statsRes.data);
      setMoviesList(moviesRes.data?.movies || []);
      setCinemasList(cinemasRes.data?.cinemas || []);

      if (cinemasRes.data?.cinemas?.length > 0) {
        setShowForm((prev) => ({
          ...prev,
          cinemaId: cinemasRes.data.cinemas[0]._id,
        }));
      }
      if (moviesRes.data?.movies?.length > 0) {
        setShowForm((prev) => ({
          ...prev,
          movieId: moviesRes.data.movies[0]._id,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // When selected cinema changes in show form, load its screens
  useEffect(() => {
    if (showForm.cinemaId) {
      cinemaApi.getScreens(showForm.cinemaId).then((res) => {
        const screens = res.data?.screens || [];
        setScreensList(screens);
        if (screens.length > 0) {
          setShowForm((prev) => ({ ...prev, screenId: screens[0]._id }));
        }
      });
    }
  }, [showForm.cinemaId]);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await movieApi.createMovie({
        ...movieForm,
        languages: movieForm.languages.split(',').map((l) => l.trim()),
        genres: [moviesList[0]?.genres[0]?._id || '661fa2b73bc92801b672721a'],
      });
      setNotification('New movie created successfully!');
      setActiveModal(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to create movie');
    }
  };

  const handleCreateCinema = async (e) => {
    e.preventDefault();
    try {
      const res = await cinemaApi.createCinema({
        name: cinemaForm.name,
        address: {
          city: cinemaForm.city,
          street: cinemaForm.street || 'Broadway Blvd',
          state: 'NY',
          zipCode: '10001',
        },
        contactPhone: cinemaForm.contactPhone,
        contactEmail: cinemaForm.contactEmail,
      });

      // Auto-create Screen 1 for this new cinema
      await cinemaApi.createScreen({
        cinemaId: res.data.cinema._id,
        screenNumber: 1,
        screenName: 'Auditorium 1 - Dolby',
        soundSystem: 'Dolby Atmos 7.1',
        projectionType: 'Standard 2D',
      });

      setNotification('New cinema and screen configured successfully!');
      setActiveModal(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to create cinema');
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await cinemaApi.createShow({
        movieId: showForm.movieId,
        cinemaId: showForm.cinemaId,
        screenId: showForm.screenId,
        showDate: showForm.showDate,
        startTime: new Date(showForm.startTime),
        format: showForm.format,
        categoryPricing: [
          { category: 'Regular', price: Number(showForm.regularPrice) },
          { category: 'Premium', price: Number(showForm.premiumPrice) },
          { category: 'Recliner', price: Number(showForm.reclinerPrice) },
        ],
      });
      setNotification('New show scheduled successfully!');
      setActiveModal(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to schedule show');
    }
  };

  if (loading) return <Loader message="Compiling executive theatre analytics..." />;

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const dailyRevenue = data?.dailyRevenue || [];

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 100);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-amber-500" />
            <span>Admin Executive Dashboard</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time revenue metrics, booking ledger, and catalog management
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModal('movie')}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-red-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movie</span>
          </button>

          <button
            onClick={() => setActiveModal('cinema')}
            className="bg-[#181d2e] hover:bg-[#20273d] text-white border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cinema</span>
          </button>

          <button
            onClick={() => setActiveModal('show')}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-600/30 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Show</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">
            ${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
          </span>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">Verified confirmed tickets</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{stats.totalBookings || 0}</span>
          <p className="text-[10px] text-gray-400 mt-1">
            {stats.confirmedBookingsCount || 0} confirmed transactions
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Movies</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{stats.totalMovies || 0}</span>
          <p className="text-[10px] text-gray-400 mt-1">Screening across multiplexes</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cinemas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{stats.totalCinemas || 0}</span>
          <p className="text-[10px] text-gray-400 mt-1">In 3 premier metropolitan hubs</p>
        </div>
      </div>

      {/* Revenue Graph / Bar Trend */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Revenue Performance (Last 7 Days)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Aggregated confirmed booking volume</p>
        </div>

        {dailyRevenue.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No sales recorded in the past 7 days yet. New bookings will automatically plot here.
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 border-b border-gray-800 pb-2">
            {dailyRevenue.map((day) => {
              const heightPct = Math.max(12, Math.round((day.revenue / maxRevenue) * 100));

              return (
                <div key={day._id} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    ${day.revenue.toFixed(0)}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-red-600 to-amber-500 rounded-t-lg shadow-lg shadow-red-600/20 group-hover:brightness-125 transition-all"
                  ></div>
                  <span className="text-[10px] text-gray-500 mt-2 font-mono">
                    {day._id.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Bookings Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Recent Global Transactions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500">
                <th className="pb-3 font-semibold">Booking ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Movie</th>
                <th className="pb-3 font-semibold">Cinema</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-mono font-bold text-cyan-400">{b.bookingNumber}</td>
                  <td className="py-3">{b.userId?.name || 'Customer'}</td>
                  <td className="py-3 font-semibold text-white">{b.movieId?.title}</td>
                  <td className="py-3 text-gray-400">{b.cinemaId?.name}</td>
                  <td className="py-3 font-bold text-emerald-400">${b.totalAmount.toFixed(2)}</td>
                  <td className="py-3">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add Movie */}
      {activeModal === 'movie' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-gray-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Add New Movie</h3>

            <form onSubmit={handleCreateMovie} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  placeholder="e.g. Gladiator II"
                  className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                  placeholder="Plot summary..."
                  className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={movieForm.durationInMinutes}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, durationInMinutes: Number(e.target.value) })
                    }
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Censor Rating</label>
                  <select
                    value={movieForm.censorRating}
                    onChange={(e) => setMovieForm({ ...movieForm, censorRating: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="UA">UA</option>
                    <option value="U">U</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Poster Image URL</label>
                <input
                  type="url"
                  required
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all mt-2"
              >
                Publish Movie to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Cinema */}
      {activeModal === 'cinema' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-gray-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Add Cinema & Screen</h3>

            <form onSubmit={handleCreateCinema} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Cinema Name</label>
                <input
                  type="text"
                  required
                  value={cinemaForm.name}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
                  placeholder="e.g. CineVerse Luxe Promenade"
                  className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={cinemaForm.city}
                    onChange={(e) => setCinemaForm({ ...cinemaForm, city: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={cinemaForm.street}
                    onChange={(e) => setCinemaForm({ ...cinemaForm, street: e.target.value })}
                    placeholder="450 5th Avenue"
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all mt-2"
              >
                Register Cinema
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Schedule Show */}
      {activeModal === 'show' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-gray-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Schedule Movie Showtime</h3>

            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Movie</label>
                <select
                  required
                  value={showForm.movieId}
                  onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                  className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                >
                  {moviesList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Cinema</label>
                  <select
                    required
                    value={showForm.cinemaId}
                    onChange={(e) => setShowForm({ ...showForm, cinemaId: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  >
                    {cinemasList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Auditorium / Screen</label>
                  <select
                    required
                    value={showForm.screenId}
                    onChange={(e) => setShowForm({ ...showForm, screenId: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  >
                    {screensList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.screenName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Show Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={showForm.startTime}
                    onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Screening Format</label>
                  <select
                    value={showForm.format}
                    onChange={(e) => setShowForm({ ...showForm, format: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                  </select>
                </div>
              </div>

              {/* Pricing Tier Overrides */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Regular ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showForm.regularPrice}
                    onChange={(e) => setShowForm({ ...showForm, regularPrice: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-lg p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-amber-400 block mb-1">Premium ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showForm.premiumPrice}
                    onChange={(e) => setShowForm({ ...showForm, premiumPrice: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-lg p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-cyan-400 block mb-1">Recliner ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showForm.reclinerPrice}
                    onChange={(e) => setShowForm({ ...showForm, reclinerPrice: e.target.value })}
                    className="w-full bg-[#181d2e] border border-gray-800 rounded-lg p-1.5 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-600/30 transition-all mt-2"
              >
                Schedule & Initialize Seating Grid
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
