import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api/bookingApi';
import { Loader } from '../components/common/Loader';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    setMessage('');

    try {
      const res = await bookingApi.cancelBooking(cancelModalBooking._id, cancelReason);
      setMessage(`Booking cancelled successfully. Refund of $${res.data.refundAmount.toFixed(2)} processed.`);
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader message="Retrieving your cinema tickets..." />;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-3">
            <Ticket className="w-7 h-7 text-red-500" />
            <span>My Bookings & E-Tickets</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Access your active cinema reservations, QR gate passes, and cancellation requests
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center space-x-3 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-gray-400">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-bold text-gray-300">No bookings yet</h3>
          <p className="text-xs text-gray-500 mt-1">
            Browse our now showing movies and book your first experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isCancelled = b.bookingStatus === 'CANCELLED';
            const showTime = b.showId?.startTime ? new Date(b.showId.startTime) : null;
            const hoursUntilShow = showTime ? (showTime - new Date()) / (1000 * 60 * 60) : 0;
            const canCancel = !isCancelled && hoursUntilShow > 2;

            return (
              <div
                key={b._id}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isCancelled
                    ? 'border-gray-800/40 opacity-70'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                  <div className="flex items-center space-x-4">
                    {b.movieId?.posterUrl && (
                      <img
                        src={b.movieId.posterUrl}
                        alt={b.movieId.title}
                        className="w-12 h-16 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-white">{b.movieId?.title}</h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            isCancelled
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Code: <strong className="text-gray-200 font-mono">{b.bookingNumber}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-white">
                      ${b.totalAmount?.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {b.seats?.length} {b.seats?.length === 1 ? 'Ticket' : 'Tickets'}
                    </span>
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Cinema</span>
                    <p className="font-semibold text-gray-200 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">{b.cinemaId?.name}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 block mb-0.5">Date & Time</span>
                    <p className="font-semibold text-gray-200">
                      {showTime ? format(showTime, 'MMM d, yyyy • hh:mm a') : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 block mb-0.5">Auditorium</span>
                    <p className="font-semibold text-gray-200">{b.screenId?.screenName || 'Audi 1'}</p>
                  </div>

                  <div>
                    <span className="text-gray-500 block mb-0.5">Seats</span>
                    <div className="flex flex-wrap gap-1">
                      {b.seats?.map((s) => (
                        <span
                          key={s.seatNumber}
                          className="bg-red-600/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        >
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                  {isCancelled ? (
                    <span className="text-xs text-rose-400">
                      Cancelled • Refund of ${b.cancellation?.refundAmount?.toFixed(2)} issued
                    </span>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedTicket(b)}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-2 text-xs transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View QR Ticket</span>
                      </button>

                      {canCancel && (
                        <button
                          onClick={() => setCancelModalBooking(b)}
                          className="text-xs text-gray-400 hover:text-rose-400 px-3 py-2 transition-colors font-medium"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] text-gray-500">
                    Booked on {format(new Date(b.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-gray-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
              Digital Gate Pass
            </span>
            <h3 className="text-lg font-black text-white">{selectedTicket.movieId?.title}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {selectedTicket.cinemaId?.name} • {selectedTicket.screenId?.screenName}
            </p>

            <div className="my-6 bg-white p-3 rounded-2xl inline-block shadow-lg">
              {selectedTicket.qrCodeUrl ? (
                <img
                  src={selectedTicket.qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-500">
                  QR Not Loaded
                </div>
              )}
            </div>

            <p className="text-xs font-mono font-bold text-cyan-400 mb-2">
              {selectedTicket.bookingNumber}
            </p>

            <div className="flex justify-center gap-1.5 mb-4">
              {selectedTicket.seats?.map((s) => (
                <span
                  key={s.seatNumber}
                  className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold px-2 py-0.5 rounded"
                >
                  {s.seatNumber}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-gray-500">
              Present this QR code to the usher at the auditorium entrance.
            </p>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-gray-800 max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setCancelModalBooking(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Cancel Booking & Refund</h3>
            <p className="text-xs text-gray-400 mt-1">
              Cancellation is subject to the CineVerse refund policy.
            </p>

            <div className="my-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800 text-xs space-y-1.5">
              <p className="text-gray-300 font-semibold">Refund Policy Terms:</p>
              <p className="text-gray-400">• Over 24 hours prior: 100% ticket subtotal refund.</p>
              <p className="text-gray-400">• 2 to 24 hours prior: 75% ticket subtotal refund.</p>
              <p className="text-gray-400">• Convenience fees & taxes are non-refundable.</p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#181d2e] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Accidental booking">Accidental booking</option>
                <option value="Scheduling conflict">Scheduling conflict</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl text-xs transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
