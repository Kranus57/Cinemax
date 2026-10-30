import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../api/bookingApi';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  Ticket,
  Film,
  MapPin,
  Calendar,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeShow,
    activeMovie,
    activeCinema,
    selectedSeats,
    subtotal,
    convenienceFee,
    taxes,
    totalAmount,
    remainingSeconds,
    reservation,
    setReservation,
    clearBooking,
  } = useBooking();

  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Payment form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [cardName, setCardName] = useState(user?.name || 'Alexander Cross');

  // If user directly visits without seats, redirect to home
  useEffect(() => {
    if (!activeShow || selectedSeats.length === 0) {
      navigate('/');
    }
  }, [activeShow, selectedSeats, navigate]);

  // Create booking reservation session on first load
  useEffect(() => {
    const initReservation = async () => {
      if (activeShow && selectedSeats.length > 0 && !reservation) {
        try {
          const seatNumbers = selectedSeats.map((s) => s.seatNumber);
          const res = await bookingApi.createReservation(activeShow._id, seatNumbers);
          setReservation(res.data.booking);
        } catch (err) {
          setErrorMessage(err.message || 'Failed to initialize booking session');
        }
      }
    };

    initReservation();
  }, [activeShow, selectedSeats, reservation, setReservation]);

  const handleAutofillTestCard = () => {
    setCardNumber('4000 1234 5678 9010');
    setExpiry('08/29');
    setCvc('321');
    setCardName(user?.name || 'Verified Tester');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!reservation?._id) {
      setErrorMessage('Booking reservation expired or missing. Please select seats again.');
      return;
    }

    setBookingLoading(true);
    setErrorMessage('');

    try {
      const paymentDetails = {
        provider: 'MOCK',
        orderId: `ORD_${Date.now()}`,
        transactionId: `TXN_${Date.now()}_MOCK`,
        paymentMethod: 'card',
        cardLast4: cardNumber.slice(-4),
      };

      const res = await bookingApi.confirmBooking(reservation._id, paymentDetails);
      const confirmedBooking = res.data.booking;

      // Clear lock session and redirect to success
      clearBooking();
      navigate(`/booking-success/${confirmedBooking._id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Timer Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300">Seats Temporarily Reserved</h4>
            <p className="text-[11px] text-gray-400">
              Please complete checkout before timer expires to avoid seats being released.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Time Left</span>
          <span className="text-xl font-black text-amber-400 font-mono">{timeFormatted}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/40 p-4 rounded-xl flex items-center space-x-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800">
            <div className="flex items-center justify-between pb-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Payment Method</h2>
                  <p className="text-xs text-gray-400">Simulated Safe Test Mode Gateway</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutofillTestCard}
                className="text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold transition-colors"
              >
                Autofill Test Details
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Name on Card
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#121522] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 tracking-wider font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-[#121522] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-[#121522] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={bookingLoading || remainingSeconds <= 0}
                  className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-black py-4 rounded-xl shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 text-sm transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {bookingLoading
                      ? 'Confirming Transaction...'
                      : `Pay $${totalAmount.toFixed(2)} & Confirm Tickets`}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center flex items-center justify-center space-x-1 mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted & PCI-DSS Compliant Gateway</span>
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Booking Summary
            </h3>

            {/* Movie Info Card */}
            <div className="flex items-start space-x-4 pb-6 border-b border-gray-800">
              <img
                src={activeMovie?.posterUrl}
                alt={activeMovie?.title}
                className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0"
              />
              <div className="text-xs">
                <h4 className="font-black text-sm text-white">{activeMovie?.title}</h4>
                <p className="text-gray-400 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{activeCinema?.name}</span>
                </p>
                <p className="text-gray-400 mt-0.5 flex items-center space-x-1">
                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeShow?.screenName || 'Audi 1'} • {activeShow?.format || '2D'}</span>
                </p>
                <p className="text-gray-400 mt-0.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {activeShow?.startTime
                      ? format(new Date(activeShow.startTime), 'EEE, MMM d • hh:mm a')
                      : ''}
                  </span>
                </p>
              </div>
            </div>

            {/* Selected Seats Itemized */}
            <div>
              <span className="text-xs font-bold text-gray-300 block mb-2">
                Seats ({selectedSeats.length})
              </span>
              <div className="space-y-1.5">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.seatNumber}
                    className="flex items-center justify-between text-xs py-1 text-gray-300"
                  >
                    <span>
                      Seat <strong>{seat.seatNumber}</strong> ({seat.category})
                    </span>
                    <span className="font-bold text-white">${seat.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 pt-4 border-t border-gray-800 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>Ticket Subtotal</span>
                <span className="text-gray-200 font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Convenience Fee ($1.50/seat)</span>
                <span className="text-gray-200 font-semibold">${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Estimated Taxes (8%)</span>
                <span className="text-gray-200 font-semibold">${taxes.toFixed(2)}</span>
              </div>
            </div>

            {/* Final Total */}
            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Total Amount</span>
                <span className="text-2xl font-black text-white">${totalAmount.toFixed(2)}</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase">
                Ready to Book
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
