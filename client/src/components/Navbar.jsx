import React, { useState } from 'react';
import { Sparkles, Menu, X, Calendar } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Services', href: '#services' },
];

export default function Navbar({ onStartChat, onViewBookings }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">Aura AI</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onViewBookings}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
            <Calendar size={15} />
            My Bookings
          </button>
          <button onClick={onStartChat}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200">
            <Sparkles size={14} />
            Start Booking
          </button>
        </div>

        {/* Mobile burger */}
        <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-neutral-100 px-6 py-4 space-y-2">
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href}
              className="block text-gray-600 hover:text-gray-900 font-medium py-2 text-sm"
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <button onClick={() => { onViewBookings(); setMobileOpen(false); }}
            className="block w-full text-left text-gray-600 hover:text-gray-900 font-medium py-2 text-sm">
            My Bookings
          </button>
          <button onClick={() => { onStartChat(); setMobileOpen(false); }}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-indigo-600 hover:bg-indigo-700 mt-2 transition-colors">
            Start Booking
          </button>
        </div>
      )}
    </nav>
  );
}
