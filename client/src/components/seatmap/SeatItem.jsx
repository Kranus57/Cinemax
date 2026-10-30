import React from 'react';
import { Armchair, Lock } from 'lucide-react';

export const SeatItem = ({ seat, isSelected, onToggle }) => {
  const isBooked = seat.status === 'BOOKED';
  const isLocked = seat.status === 'LOCKED';
  const isAvailable = seat.status === 'AVAILABLE';

  // Determine styling
  let buttonClasses = 'relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-[10px] font-bold ';

  if (isBooked) {
    buttonClasses += 'bg-gray-900 border border-gray-950 text-gray-600 cursor-not-allowed opacity-30';
  } else if (isSelected) {
    buttonClasses += 'bg-red-600 border border-red-500 text-white shadow-lg shadow-red-600/50 scale-110 z-10';
  } else if (isLocked) {
    buttonClasses += 'bg-amber-500/20 border border-amber-500/50 text-amber-400 cursor-not-allowed animate-pulse';
  } else {
    // Available - differentiate category styling
    if (seat.category === 'Recliner') {
      buttonClasses += 'bg-[#1a233a] border border-cyan-500/50 text-cyan-300 hover:border-cyan-400 hover:scale-105';
    } else if (seat.category === 'Premium') {
      buttonClasses += 'bg-[#1b2030] border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:scale-105';
    } else {
      buttonClasses += 'bg-[#161a29] border border-gray-700/80 text-gray-300 hover:border-gray-500 hover:scale-105';
    }
  }

  const handleClick = () => {
    if (isAvailable || isSelected) {
      onToggle(seat);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isBooked || isLocked}
      title={`${seat.seatNumber} • ${seat.category} • $${seat.price}`}
      className={buttonClasses}
    >
      {isLocked ? (
        <Lock className="w-3 h-3 text-amber-400" />
      ) : (
        <span>{seat.column}</span>
      )}
    </button>
  );
};
