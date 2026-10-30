import React from 'react';

export const SeatLegend = ({ pricing = [] }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 bg-[#121522] rounded-2xl border border-gray-800/80 max-w-3xl mx-auto my-6 text-xs">
      {/* Availability Statuses */}
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-[#1f2538] border border-gray-700"></div>
        <span className="text-gray-300">Available</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-red-600 shadow-md shadow-red-600/40 border border-red-500"></div>
        <span className="text-gray-300 font-bold">Selected</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-amber-500/30 border border-amber-500/60 animate-pulse"></div>
        <span className="text-gray-300">Locked / In Cart</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-gray-800 border border-gray-900 opacity-40"></div>
        <span className="text-gray-500">Booked</span>
      </div>

      {/* Category Price Tags */}
      {pricing.length > 0 && (
        <div className="flex items-center space-x-4 pl-4 border-l border-gray-800">
          {pricing.map((p) => (
            <div key={p.category} className="flex items-center space-x-1.5">
              <span className="text-gray-400">{p.category}:</span>
              <span className="font-bold text-white">${p.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
