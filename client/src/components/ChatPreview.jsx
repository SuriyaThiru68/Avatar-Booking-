import React, { useState, useEffect } from 'react';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { SoundWave } from './AvatarEngine';

const DEMO_MESSAGES = [
  { role: 'ai',   text: "Hi! I'm Aura 👋 Would you like to book an appointment today?" },
  { role: 'user', text: "Yes, I'd like to see a doctor tomorrow if possible." },
  { role: 'ai',   text: "Great! I found 3 slots for tomorrow — 10:00 AM, 2:00 PM, and 4:30 PM. Which works?" },
  { role: 'user', text: "10 AM works perfectly!" },
  { role: 'ai',   text: "🎉 Confirmed! Your Doctor Visit is booked for tomorrow at 10:00 AM." },
];

export default function ChatPreview() {
  const [visible, setVisible] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (visible >= DEMO_MESSAGES.length) return;
    const delay = DEMO_MESSAGES[visible]?.role === 'ai' ? 1800 : 1200;
    const t = setTimeout(() => {
      setIsSpeaking(DEMO_MESSAGES[visible]?.role === 'ai');
      setVisible(v => v + 1);
      setTimeout(() => setIsSpeaking(false), 1200);
    }, delay);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-6">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-[0.3em]">Live Demo</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              See Aura in action
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Watch a real booking conversation unfold. From "hello" to confirmed appointment — in under 60 seconds.
            </p>
            <div className="space-y-3">
              {['Speaks your language', 'Finds the best slot', 'Confirms instantly'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <span className="text-gray-600 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat demo card */}
          <div className="relative">
            <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-100 bg-white">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-sm">Aura Assistant</p>
                    <p className="text-emerald-600 text-[9px] font-bold uppercase tracking-widest">Online</p>
                  </div>
                </div>
                <SoundWave active={isSpeaking} color="#6366f1" />
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[340px]">
                {DEMO_MESSAGES.slice(0, visible).map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animation: 'slideIn 0.3s ease forwards' }}>
                    <div className="max-w-[82%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed"
                      style={msg.role === 'user' ? {
                        background: '#6366f1',
                        color: '#fff',
                        borderRadius: '18px 4px 18px 18px',
                      } : {
                        background: '#f9fafb',
                        color: '#1f2937',
                        border: '1px solid #f3f4f6',
                        borderRadius: '4px 18px 18px 18px',
                      }}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {visible < DEMO_MESSAGES.length && DEMO_MESSAGES[visible]?.role === 'ai' && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-gray-100 border border-gray-100">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
                          style={{ animation: `typingBounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <style>{`
                @keyframes slideIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
                @keyframes typingBounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
