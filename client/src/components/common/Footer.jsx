import React from 'react';
import { Film, ShieldCheck, Clock, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#07080c] border-t border-gray-800/80 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-gray-800/60 text-center md:text-left">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Guaranteed Zero Double-Booking</h4>
              <p className="text-xs text-gray-400 mt-0.5">Real-time seat locking with atomic concurrency defense.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant E-Tickets & QR Gate Entry</h4>
              <p className="text-xs text-gray-400 mt-0.5">Instant digital ticket delivery to your account and inbox.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">IMAX & Dolby Atmos Certification</h4>
              <p className="text-xs text-gray-400 mt-0.5">World-class cinematic sound and laser projection quality.</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-800/60">
          <div>
            <div className="flex items-center space-x-2 text-white font-black text-lg mb-4">
              <Film className="w-5 h-5 text-red-500" />
              <span>CINEVERSE</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              The premier destination for cinematic storytelling, luxury comfort, and seamless ticketing experiences.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Explore</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/" className="hover:text-red-400 transition-colors">Now Showing</Link></li>
              <li><Link to="/?genre=sci-fi" className="hover:text-red-400 transition-colors">IMAX Experience</Link></li>
              <li><Link to="/?genre=action" className="hover:text-red-400 transition-colors">Upcoming Releases</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/my-bookings" className="hover:text-red-400 transition-colors">My E-Tickets</Link></li>
              <li><span className="hover:text-red-400 cursor-pointer transition-colors">Cancellation & Refund Policy</span></li>
              <li><span className="hover:text-red-400 cursor-pointer transition-colors">FAQs & Help Center</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">Cinemas</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><span>New York - Times Square</span></li>
              <li><span>Los Angeles - Hollywood Blvd</span></li>
              <li><span>Chicago - Navy Pier</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CineVerse Inc. All rights reserved.</p>
          <p className="flex items-center mt-2 md:mt-0">
            Crafted for pure cinematic immersion.
          </p>
        </div>
      </div>
    </footer>
  );
};
