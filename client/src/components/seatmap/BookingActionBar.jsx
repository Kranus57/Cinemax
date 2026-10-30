import React from 'react';
import { ArrowRight, Ticket, Clock } from 'lucide-react';

export const BookingActionBar = ({
  selectedSeats = [],
  totalAmount = 0,
  remainingSeconds = 0,
  onProceed,
  loading = false,
}) => {
  if (selectedSeats.length === 0) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0d101a]/95 backdrop-blur-xl border-t border-gray-800 py-4 px-6 shadow-2xl transition-all duration-300">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Selected seats chips */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-400">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected:
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedSeats.map((s) => (
                  <span
                    key={s.seatNumber}
                    className="bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  >
                    {s.seatNumber}
                  </span>
                ))}
              </div>
            </div>

            {remainingSeconds > 0 && (
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Locked for checkout: <strong>{timeFormatted}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Subtotal & Action CTA */}
        <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Est.</span>
            <span className="text-xl font-black text-white">${totalAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={onProceed}
            disabled={loading}
            className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 active:scale-95 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 text-sm transition-all"
          >
            <span>{loading ? 'Locking Seats...' : 'Proceed to Checkout'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
