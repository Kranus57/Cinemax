import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { Loader } from '../components/common/Loader';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  Film,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

export const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const fetchBooking = async () => {
      try {
        const res = await bookingApi.getBookingById(bookingId);
        setBooking(res.data.booking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) return <Loader message="Generating your verified digital e-ticket..." />;
  if (!booking) {
    return <div className="text-center py-20 text-gray-400">Booking details not found</div>;
  }

  const handlePrintTicket = () => {
    window.print();
  };

  const showDateStr = booking.showId?.startTime
    ? format(new Date(booking.showId.startTime), 'EEEE, MMMM d, yyyy')
    : 'Upcoming Show';

  const showTimeStr = booking.showId?.startTime
    ? format(new Date(booking.showId.startTime), 'hh:mm a')
    : '';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Booking Confirmed!</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Your e-ticket has been issued. A copy was also dispatched to your registered email.
        </p>
      </div>

      {/* Luxury E-Ticket Card */}
      <div className="bg-[#121522] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl relative">
        {/* Ticket Header Ribbon */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-6 h-6" />
            <span className="font-black text-lg tracking-wider">CINEVERSE E-TICKET</span>
          </div>
          <span className="text-xs font-mono font-bold bg-black/40 px-3 py-1 rounded-full border border-white/20">
            {booking.bookingNumber}
          </span>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block">
                Movie
              </span>
              <h2 className="text-2xl font-black text-white">{booking.movieId?.title}</h2>
              <p className="text-xs text-gray-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>
                  {booking.cinemaId?.name} • {booking.screenId?.screenName}
                </span>
              </p>
            </div>

            {/* Poster Thumbnail */}
            {booking.movieId?.posterUrl && (
              <img
                src={booking.movieId.posterUrl}
                alt={booking.movieId.title}
                className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0 hidden sm:block"
              />
            )}
          </div>

          {/* Schedule & Seats Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6 border-b border-gray-800 text-xs">
            <div>
              <span className="text-gray-500 block mb-1">Date</span>
              <div className="flex items-center space-x-1.5 font-bold text-gray-200">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                <span>{showDateStr}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 block mb-1">Showtime</span>
              <div className="flex items-center space-x-1.5 font-bold text-gray-200">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showTimeStr}</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-500 block mb-1">Seats</span>
              <div className="flex flex-wrap gap-1">
                {booking.seats?.map((seat) => (
                  <span
                    key={seat.seatNumber}
                    className="bg-red-600/20 text-red-400 border border-red-500/40 text-[11px] font-black px-2 py-0.5 rounded"
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* QR Code & Total Paid */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div>
              <span className="text-xs text-gray-500 block">Total Amount Paid</span>
              <span className="text-3xl font-black text-emerald-400">
                ${booking.totalAmount.toFixed(2)}
              </span>
              <p className="text-[11px] text-gray-500 mt-1">Payment Method: Test Card • Verified</p>
            </div>

            {/* QR Code Display */}
            <div className="text-center">
              {booking.qrCodeUrl ? (
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-200 inline-block">
                  <img
                    src={booking.qrCodeUrl}
                    alt="Ticket QR Code"
                    className="w-28 h-28 object-contain"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 bg-gray-800 rounded-2xl flex items-center justify-center text-xs text-gray-500">
                  QR Generated
                </div>
              )}
              <span className="text-[10px] text-gray-400 block mt-1 uppercase font-bold tracking-wider">
                Scan at Gate
              </span>
            </div>
          </div>
        </div>

        {/* Notched perforated ticket divider */}
        <div className="bg-[#090b10] p-4 text-center border-t border-dashed border-gray-800 text-[11px] text-gray-500">
          Please arrive at least 15 minutes prior to showtime. Outside food & beverages strictly prohibited.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <button
          onClick={handlePrintTicket}
          className="w-full sm:w-auto bg-[#181d2e] hover:bg-[#20273d] text-white border border-gray-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 text-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Print / Save Ticket</span>
        </button>

        <Link
          to="/my-bookings"
          className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 text-xs shadow-lg shadow-red-600/30 transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>View My Bookings</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto text-gray-400 hover:text-white px-4 py-3 text-xs font-semibold text-center transition-colors"
        >
          Explore More Movies
        </Link>
      </div>
    </div>
  );
};
