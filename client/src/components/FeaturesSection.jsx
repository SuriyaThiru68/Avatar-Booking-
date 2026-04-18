import React from 'react';
import { Mic, Calendar, Brain, Zap, ShieldCheck, Clock } from 'lucide-react';

const FEATURES = [
  { icon: Mic,         title: 'Voice Booking',    desc: 'Speak naturally to Aura. Real-time speech-to-text converts your words into booking actions instantly.',    color: '#6366f1' },
  { icon: Brain,       title: 'AI Conversation',  desc: 'Powered by Gemini AI, Aura understands context, remembers your session, and suggests the best slots.',      color: '#8b5cf6' },
  { icon: Calendar,    title: 'Smart Calendar',   desc: 'Interactive calendar view with real-time availability and automatic conflict detection.',                     color: '#10b981' },
  { icon: Zap,         title: 'Instant Confirm',  desc: 'Book, confirm, and receive an instant summary — all without leaving the chat interface.',                   color: '#f59e0b' },
  { icon: ShieldCheck, title: 'Secure & Private', desc: 'End-to-end encrypted sessions. Your data is stored safely in MongoDB Atlas.',                               color: '#ef4444' },
  { icon: Clock,       title: '24/7 Availability',desc: 'Aura never sleeps. Book appointments any time of day, from any device.',                                    color: '#06b6d4' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-[0.3em] mb-4">Features</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Everything you need to book smarter
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Aura combines voice AI, smart scheduling, and instant confirmations into one seamless experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all hover:-translate-y-1 cursor-default"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: `${f.color}12`, border: `1px solid ${f.color}22` }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="text-gray-900 font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
