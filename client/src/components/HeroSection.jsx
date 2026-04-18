import React from 'react';
import { ArrowRight, Sparkles, Mic, Calendar, Bot, CheckCircle, Zap } from 'lucide-react';

const STAT_ITEMS = [
  { value: '< 1s', label: 'Response Time' },
  { value: '99%', label: 'Uptime' },
  { value: '24/7', label: 'Availability' },
];

export default function HeroSection({ onStartChat, onViewBookings }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden bg-white">

      {/* Subtle indigo glow top-center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />

      {/* Light grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-600">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          AI-Powered Appointment Booking
          <Sparkles size={11} />
        </div>

        {/* Headline */}
        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
          Book Smarter.{' '}
          <span className="text-indigo-600">Talk to Aura.</span>
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12 font-medium">
          The world's first voice-driven AI concierge that sees, hears, and books your appointments in seconds. Just say what you need.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartChat}
            className="group px-8 py-4 rounded-2xl font-bold text-white text-base flex items-center gap-3 transition-all hover:scale-105 active:scale-95 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Mic size={20} />
            Start Talking to Aura
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onViewBookings}
            className="px-8 py-4 rounded-2xl font-bold text-gray-600 text-base flex items-center gap-3 transition-all hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
          >
            <Calendar size={18} />
            View My Bookings
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-16 mb-16">
          {STAT_ITEMS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{s.value}</div>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { icon: Mic,         text: 'Voice Input' },
            { icon: Bot,         text: 'AI Assistant' },
            { icon: Calendar,    text: 'Smart Calendar' },
            { icon: CheckCircle, text: 'Auto Confirm' },
            { icon: Zap,         text: 'Instant Booking' },
          ].map(({ icon: Icon, text }) => (
            <div key={text}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gray-50 border border-gray-100 text-gray-500">
              <Icon size={12} className="text-indigo-500" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
