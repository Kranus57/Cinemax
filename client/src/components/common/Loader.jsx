import React from 'react';
import { Film } from 'lucide-react';

export const Loader = ({ message = 'Loading cinema experience...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="relative">
        {/* Glowing Spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin"></div>
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {message}
      </p>
    </div>
  );
};
