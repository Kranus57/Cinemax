import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cinemaApi } from '../../api/cinemaApi';
import {
  Film,
  MapPin,
  Search,
  User,
  Ticket,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cities, setCities] = useState(['New York', 'Los Angeles', 'Chicago']);
  const [selectedCity, setSelectedCity] = useState('New York');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    cinemaApi
      .getCities()
      .then((res) => {
        if (res.data?.cities?.length) {
          setCities(res.data.cities);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    navigate(`/?city=${encodeURIComponent(city)}`);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                CINE<span className="text-red-500">VERSE</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block -mt-1">
                Premier Theatres
              </span>
            </div>
          </Link>

          {/* Search & City Filter Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-xl mx-8">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies, genres, cinemas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121520] text-gray-200 text-sm pl-10 pr-4 py-2.5 rounded-full border border-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </form>

            {/* City Selector */}
            <div className="relative group">
              <div className="flex items-center space-x-1.5 bg-[#121520] border border-gray-800 px-3.5 py-2.5 rounded-full text-xs font-semibold text-gray-300 hover:text-white cursor-pointer transition-colors">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <div className="absolute right-0 mt-2 w-40 bg-[#161a28] border border-gray-800 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCityChange(city)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-red-500/10 hover:text-red-400 transition-colors ${
                      selectedCity === city ? 'text-red-500 font-bold' : 'text-gray-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Nav Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-800/60 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-red-500/40"
                  />
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <p className="font-semibold text-gray-200">{user.name}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#161a29] border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-800/60">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/my-bookings"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-red-500" />
                      <span>My Bookings & E-Tickets</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-gray-800/40 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Account Profile</span>
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left border-t border-gray-800/60 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-full shadow-lg shadow-red-600/30 hover:brightness-110 active:scale-95 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
