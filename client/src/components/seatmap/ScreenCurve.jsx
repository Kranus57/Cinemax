import React from 'react';

export const ScreenCurve = () => {
  return (
    <div className="w-full flex flex-col items-center mb-10">
      {/* Light Projection Trapazoid */}
      <div className="w-3/4 max-w-2xl h-14 cinema-screen-glow rounded-t-[100px] border-t-4 border-sky-400 opacity-80 mb-2"></div>
      
      {/* Label */}
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">
        Curved Cinema Projection Screen
      </span>
    </div>
  );
};
