import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cinemaApi } from '../api/cinemaApi';
import { useBooking } from '../context/BookingContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { ScreenCurve } from '../components/seatmap/ScreenCurve';
import { SeatLegend } from '../components/seatmap/SeatLegend';
import { SeatItem } from '../components/seatmap/SeatItem';
import { BookingActionBar } from '../components/seatmap/BookingActionBar';
import { Loader } from '../components/common/Loader';
import { ArrowLeft, AlertCircle, Film } from 'lucide-react';
import { format } from 'date-fns';

export const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinShow, leaveShow } = useSocket();

  const {
    selectedSeats,
    toggleSeat,
    lockSeatsAction,
    setActiveShow,
    setActiveMovie,
    setActiveCinema,
    subtotal,
    remainingSeconds,
    totalAmount,
    clearBooking,
  } = useBooking();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch initial show & seat availability data
  useEffect(() => {
    const fetchShowDetails = async () => {
      setLoading(true);
      try {
        const res = await cinemaApi.getShowById(showId);
        const showData = res.data.show;
        setShow(showData);
        setSeats(showData.seats || []);
        setActiveShow(showData);
        if (showData.movieId) setActiveMovie(showData.movieId);
        if (showData.cinemaId) setActiveCinema(showData.cinemaId);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load seating map');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
    clearBooking();
  }, [showId]);

  // 2. Real-time Socket.IO synchronization for live seat updates
  useEffect(() => {
    if (!showId) return;

    joinShow(showId);

    if (socket) {
      // Listen for other users locking seats
      const handleSeatLocked = ({ seatNumbers, userId }) => {
        // If locked by someone else, update their status to LOCKED
        if (userId !== user?._id) {
          setSeats((prevSeats) =>
            prevSeats.map((s) =>
              seatNumbers.includes(s.seatNumber) ? { ...s, status: 'LOCKED' } : s
            )
          );
        }
      };

      // Listen for seats released
      const handleSeatReleased = ({ seatNumbers }) => {
        setSeats((prevSeats) =>
          prevSeats.map((s) =>
            seatNumbers.includes(s.seatNumber) && s.status !== 'BOOKED'
              ? { ...s, status: 'AVAILABLE' }
              : s
          )
        );
      };

      // Listen for seats permanently booked
      const handleSeatBooked = ({ seatNumbers }) => {
        setSeats((prevSeats) =>
          prevSeats.map((s) =>
            seatNumbers.includes(s.seatNumber) ? { ...s, status: 'BOOKED' } : s
          )
        );
      };

      socket.on('seat:locked', handleSeatLocked);
      socket.on('seat:released', handleSeatReleased);
      socket.on('seat:booked', handleSeatBooked);

      return () => {
        socket.off('seat:locked', handleSeatLocked);
        socket.off('seat:released', handleSeatReleased);
        socket.off('seat:booked', handleSeatBooked);
        leaveShow(showId);
      };
    }
  }, [showId, socket, user]);

  const handleProceedToCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/seat-selection/${showId}` } });
      return;
    }

    setLocking(true);
    setErrorMessage('');
    try {
      await lockSeatsAction(showId);
      navigate('/checkout');
    } catch (err) {
      setErrorMessage(
        err.message || 'Selected seats could not be secured. Please select other seats.'
      );
      // Refresh latest seat map
      const res = await cinemaApi.getShowById(showId);
      setSeats(res.data.show?.seats || []);
    } finally {
      setLocking(false);
    }
  };

  if (loading) return <Loader message="Rendering interactive auditorium..." />;
  if (!show) return <div className="text-center py-20 text-gray-400">Show not found</div>;

  // Group seats by Row letter ('A', 'B', 'C'...)
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const rowsSorted = Object.keys(seatsByRow).sort();

  const formattedDate = format(new Date(show.startTime), 'EEEE, MMMM d, yyyy • hh:mm a');

  return (
    <div className="min-h-screen pb-32">
      {/* Top Header Bar */}
      <div className="border-b border-gray-800 bg-[#0c0e16]/80 backdrop-blur-md sticky top-20 z-30 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-white flex items-center space-x-2">
                <span>{show.movieId?.title}</span>
                <span className="text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded border border-red-500/40">
                  {show.format || '2D'}
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                {show.cinemaId?.name} • {show.screenId?.screenName} • {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seating Layout Canvas */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/40 p-4 rounded-xl flex items-center space-x-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Curved Screen Element */}
        <ScreenCurve />

        {/* Interactive Seat Rows */}
        <div className="flex flex-col items-center space-y-3.5 my-8 overflow-x-auto pb-4">
          {rowsSorted.map((rowLetter) => {
            const rowSeats = seatsByRow[rowLetter].sort((a, b) => a.column - b.column);

            return (
              <div key={rowLetter} className="flex items-center space-x-4">
                {/* Left Row Indicator */}
                <span className="w-6 text-center text-xs font-bold text-gray-400 select-none">
                  {rowLetter}
                </span>

                {/* Seat Buttons in Row */}
                <div className="flex items-center space-x-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeats.some(
                      (s) => s.seatNumber === seat.seatNumber
                    );

                    return (
                      <SeatItem
                        key={seat.seatNumber}
                        seat={seat}
                        isSelected={isSelected}
                        onToggle={toggleSeat}
                      />
                    );
                  })}
                </div>

                {/* Right Row Indicator */}
                <span className="w-6 text-center text-xs font-bold text-gray-400 select-none">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <SeatLegend pricing={show.categoryPricing || []} />
      </div>

      {/* Floating Action Drawer */}
      <BookingActionBar
        selectedSeats={selectedSeats}
        totalAmount={totalAmount}
        remainingSeconds={remainingSeconds}
        onProceed={handleProceedToCheckout}
        loading={locking}
      />
    </div>
  );
};
