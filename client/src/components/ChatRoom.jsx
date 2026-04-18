import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Mic, MicOff, ChevronLeft,
  Loader2, Calendar, Volume2, VolumeX, Sparkles, Radio
} from 'lucide-react';
import AvatarEngine from './AvatarEngine';
import { BookingFlow } from './BookingFlow';

/* ─── Typing dots ─────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-gray-100 border border-gray-100 w-fit">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
          style={{ animation: `typingBounce 1s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

/* ─── Chat bubble ─────────────────────────────────────────── */
function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slideIn`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-1 bg-indigo-600 flex items-center justify-center">
          <Sparkles size={11} className="text-white" />
        </div>
      )}
      <div className="max-w-[78%] space-y-1">
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium"
          style={isUser ? {
            background: '#6366f1', color: '#fff',
            borderRadius: '18px 4px 18px 18px',
          } : {
            background: '#f9fafb', color: '#1f2937',
            border: '1px solid #f3f4f6',
            borderRadius: '4px 18px 18px 18px',
          }}>
          {msg.text}
        </div>
        <div className={`text-[9px] text-gray-300 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Actions ────────────────────────────────────────── */
function QuickActions({ onAction }) {
  const actions = [
    { id: 'book',       label: '📅 Book',       color: '#6366f1' },
    { id: 'slots',      label: '🕐 Slots',       color: '#10b981' },
    { id: 'reschedule', label: '🔄 Reschedule',  color: '#f59e0b' },
    { id: 'cancel',     label: '❌ Cancel',      color: '#ef4444' },
  ];
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {actions.map(a => (
        <button key={a.id} onClick={() => onAction(a.id)}
          className="text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95"
          style={{ borderColor: `${a.color}33`, color: a.color, background: `${a.color}08` }}>
          {a.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Greeting ─────────────────────────────────────────────── */
const GREETINGS = {
  morning:   "Good morning! ☀️ I'm Aura, your AI assistant. How can I help you today?",
  afternoon: "Good afternoon! 🌤️ I'm Aura. Ready to schedule something for you?",
  evening:   "Good evening! 🌙 I'm Aura. How can I assist you?",
};
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? GREETINGS.morning : h < 17 ? GREETINGS.afternoon : GREETINGS.evening;
}

/* ─── Main Component ───────────────────────────────────────── */
export default function ChatRoom({ onBack }) {
  const [messages,       setMessages]     = useState([{ role: 'ai', text: getGreeting(), timestamp: Date.now() }]);
  const [input,          setInput]        = useState('');
  const [liveTranscript, setLive]         = useState('');
  const [isRecording,    setIsRecording]  = useState(false);
  const [isBotSpeaking,  setBotSpeaking]  = useState(false);
  const [isThinking,     setIsThinking]   = useState(false);
  const [avatarEmotion,  setEmotion]      = useState('idle');
  const [caption,        setCaption]      = useState('');
  const [audioEnabled,   setAudio]        = useState(true);
  const [showBookingFlow,setBookingFlow]  = useState(false);
  const [voiceReady,     setVoiceReady]   = useState(false);
  const [voiceError,     setVoiceError]   = useState(''); // friendly SR error message

  const scrollRef      = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);

  // Keep latest values accessible from SR callbacks without stale closures
  const messagesRef    = useRef(messages);
  const isThinkingRef  = useRef(isThinking);
  useEffect(() => { messagesRef.current  = messages;   }, [messages]);
  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);

  /* Auto-scroll */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking, liveTranscript]);

  /* ─── Send to AI (uses ref for fresh messages) ──────────── */
  const sendToAI = useCallback(async (text) => {
    if (!text || isThinkingRef.current) return;

    const userMsg  = { role: 'user', text, timestamp: Date.now() };
    const snapshot = [...messagesRef.current, userMsg];
    setMessages(snapshot);
    setInput('');
    setLive('');
    setIsThinking(true);
    setEmotion('thinking');

    const lower = text.toLowerCase();
    if (lower.includes('book') || lower.includes('schedule') || lower.includes('appointment') || lower.includes('slot')) {
      setBookingFlow(true);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: snapshot.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      
      const data = await res.json();
      setIsThinking(false);
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply, timestamp: Date.now() }]);
        const rl = data.reply.toLowerCase();
        if (rl.includes('confirm') || rl.includes('great') || rl.includes('book')) {
          setEmotion('happy'); setTimeout(() => setEmotion('idle'), 3000);
        } else {
          setEmotion('idle');
        }
        speakText(data.reply);
      } else if (data.error) {
         throw new Error(data.error);
      }
    } catch (err) {
      setIsThinking(false);
      setEmotion('idle');
      const fb = err.message.includes('Server returned') 
        ? "The server is having trouble. Please check if it is running."
        : "I'm having trouble connecting to my AI brain. Please try again.";
      setMessages(prev => [...prev, { role: 'ai', text: fb, timestamp: Date.now() }]);
      speakText(fb);
      console.error('Chat error:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Speech synthesis ─────────────────────────────────── */
  const speakText = useCallback((text) => {
    if (!audioEnabled) return;
    synthRef.current?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.05; u.volume = 1;
    const voices = synthRef.current?.getVoices() || [];
    const pref = voices.find(v =>
      v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google US English Female')
    );
    if (pref) u.voice = pref;
    u.onstart = () => { setBotSpeaking(true); setEmotion('speaking'); };
    u.onend   = () => { setBotSpeaking(false); setEmotion('idle'); setCaption(''); };
    u.onerror = () => { setBotSpeaking(false); setEmotion('idle'); setCaption(''); };
    setCaption(text.length > 110 ? text.slice(0, 107) + '…' : text);
    synthRef.current?.speak(u);
  }, [audioEnabled]);

  /* ─── Speech Recognition setup ─────────────────────────── */
  const pendingFinalRef = useRef(''); // guards against onend firing before onresult

  useEffect(() => {
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SR) { setVoiceReady(false); return; }
    setVoiceReady(true);
    recognitionRef.current = SR; // store constructor, not instance
  }, [sendToAI]);

  /* Build a fresh SR instance each time mic is pressed (avoids "already started" errors) */
  const startRecording = useCallback(() => {
    const SR = recognitionRef.current;
    if (!SR || typeof SR !== 'function') return;

    const r = new SR();
    r.continuous      = false;
    r.interimResults  = true;
    r.lang            = 'en-US';
    r.maxAlternatives = 1;
    pendingFinalRef.current = '';

    r.onstart = () => setIsRecording(true);

    r.onresult = (e) => {
      let interim = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else                      interim   += e.results[i][0].transcript;
      }
      if (interim) setLive(interim);
      if (finalText) {
        pendingFinalRef.current = finalText.trim(); // save for onend fallback
        setLive('');
        setInput(finalText.trim());
      }
    };

    r.onend = () => {
      setIsRecording(false);
      setLive('');
      // Send whatever was captured — handles both normal and early-onend cases
      const toSend = pendingFinalRef.current;
      pendingFinalRef.current = '';
      if (toSend) sendToAI(toSend); // ✅ no stale closure — reads messagesRef
    };

    r.onerror = (e) => {
      setIsRecording(false);
      setLive('');
      pendingFinalRef.current = '';
      // Map browser SR error codes to friendly messages
      const errorMessages = {
        'no-speech':    "No speech detected. Tap the mic and speak clearly.",
        'not-allowed':  "Microphone access denied. Please allow mic permission in your browser.",
        'aborted':      '', // user cancelled — silent
        'audio-capture':"No microphone found. Please connect one and try again.",
        'network':      "Network error during voice recognition. Check your connection.",
        'service-not-allowed': "Voice service blocked. Try allowing mic access.",
      };
      const msg = errorMessages[e.error] ?? `Voice error: ${e.error}. Please try again.`;
      if (msg) {
        setVoiceError(msg);
        setTimeout(() => setVoiceError(''), 4000); // auto-dismiss after 4 s
      }
    };

    recognitionRef.current = r;
    try { r.start(); } catch (err) { console.warn('SR start:', err); }
  }, [sendToAI]);

  /* ─── Toggle mic ────────────────────────────────────────── */
  const toggleRecording = () => {
    if (isRecording) {
      // Stop: the onend handler will fire and send whatever was spoken
      const r = recognitionRef.current;
      if (r && typeof r.stop === 'function') {
        try { r.stop(); } catch (_) {}
      }
      setIsRecording(false);
      setLive('');
    } else {
      setInput('');
      startRecording(); // creates fresh SR instance and starts it
    }
  };

  /* ─── Type & send ───────────────────────────────────────── */
  const handleTypedSend = () => {
    const text = input.trim();
    if (!text || isThinking) return;
    sendToAI(text);
  };

  const handleQuickAction = (id) => {
    const map = {
      book:       'I would like to book an appointment.',
      slots:      'What available slots do you have?',
      reschedule: 'I need to reschedule my appointment.',
      cancel:     'I want to cancel my appointment.',
    };
    sendToAI(map[id]);
  };

  /* ─── Render ────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[200] font-sans overflow-hidden flex flex-col bg-white">
      <style>{`
        @keyframes typingBounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-5px);opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes recordingPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 14px rgba(239,68,68,0)}}
        @keyframes micRing{0%{transform:scale(1);opacity:1}70%{transform:scale(1.8);opacity:0}100%{transform:scale(1.8);opacity:0}}
        .animate-slideIn{animation:slideIn .3s ease forwards}
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-bold text-gray-900 text-base">Aura AI</h2>
            </div>
            <p className="text-gray-400 text-[10px] font-medium mt-0.5">
              {isThinking ? '✦ Thinking…' : isBotSpeaking ? '🔊 Speaking…' : isRecording ? '🎤 Listening…' : 'Your AI Booking Assistant'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBotSpeaking && (
            <button
              onClick={() => { synthRef.current?.cancel(); setBotSpeaking(false); setEmotion('idle'); setCaption(''); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all">
              <VolumeX size={14} />
            </button>
          )}
          <button onClick={() => setAudio(a => !a)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all">
            {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button onClick={() => setBookingFlow(f => !f)}
            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-all text-[10px] font-bold">
            <Calendar size={12} />
            {showBookingFlow ? 'Chat' : 'Book'}
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Avatar panel */}
        <div className="hidden lg:flex w-[260px] flex-col items-center justify-center py-8 px-4 border-r border-gray-100 bg-gray-50/50">
          <AvatarEngine emotion={avatarEmotion} isThinking={isThinking} isSpeaking={isBotSpeaking} caption={caption} />
        </div>

        {/* Chat */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-6 space-y-5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>

            {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}

            {/* Live interim transcript */}
            {liveTranscript && (
              <div className="flex justify-end animate-slideIn">
                <div className="max-w-[78%] px-4 py-3 rounded-2xl text-sm font-medium italic text-indigo-500 bg-indigo-50 border border-indigo-100"
                  style={{ borderRadius: '18px 4px 18px 18px' }}>
                  🎤 {liveTranscript}
                </div>
              </div>
            )}

            {/* AI thinking */}
            {isThinking && (
              <div className="flex justify-start animate-slideIn">
                <div className="flex items-center gap-2 mr-2 mt-1 w-7 h-7 rounded-full bg-indigo-600 flex-shrink-0 justify-center">
                  <Sparkles size={11} className="text-white" />
                </div>
                <TypingIndicator />
              </div>
            )}
          </div>

          {/* Quick actions */}
          <QuickActions onAction={handleQuickAction} />

          {/* ── Input bar ── */}
          <div className="px-4 pb-5 pt-2 border-t border-gray-100">

            {/* Recording status banner */}
            {isRecording && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl mb-3 bg-red-50 border border-red-100">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <div className="absolute w-4 h-4 rounded-full bg-red-400 opacity-60"
                    style={{ animation: 'micRing 1.2s ease-out infinite' }} />
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <span className="text-red-500 text-xs font-bold">Listening… speak your question</span>
                {liveTranscript && (
                  <span className="ml-auto text-red-400 text-xs italic truncate max-w-[50%]">
                    "{liveTranscript}"
                  </span>
                )}
                <button onClick={toggleRecording}
                  className="ml-auto text-red-400 hover:text-red-600 text-[10px] font-bold underline">
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">

              {/* ── Mic / Start button ── */}
              {voiceReady ? (
                <button
                  onClick={toggleRecording}
                  disabled={isThinking}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                  className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40"
                  style={{
                    background: isRecording ? '#ef4444' : '#6366f1',
                    border: 'none',
                    animation: isRecording ? 'recordingPulse 1.5s ease-in-out infinite' : 'none',
                    color: '#fff',
                    boxShadow: isRecording ? '0 0 0 0 rgba(239,68,68,.4)' : '0 4px 14px rgba(99,102,241,0.4)',
                  }}>
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              ) : (
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-300 flex-shrink-0" title="Voice not supported in this browser">
                  <MicOff size={18} />
                </div>
              )}

              {/* Text input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isThinking && handleTypedSend()}
                  placeholder={isRecording ? 'Listening… speak now 🎤' : 'Type a message or tap mic…'}
                  disabled={isRecording}
                  className="w-full px-5 py-3.5 pr-14 rounded-2xl text-sm font-medium outline-none text-gray-800 placeholder-gray-400 transition-all"
                  style={{
                    background: isRecording ? '#fef2f2' : '#f9fafb',
                    border: isRecording ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                    caretColor: '#6366f1',
                  }}
                />
                {/* Send button */}
                <button
                  onClick={handleTypedSend}
                  disabled={!input.trim() || isThinking || isRecording}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: input.trim() && !isThinking && !isRecording ? '#6366f1' : '#f3f4f6',
                    color:      input.trim() && !isThinking && !isRecording ? '#fff'    : '#d1d5db',
                  }}>
                  {isThinking ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </div>

            {/* Voice not supported notice */}
            {!voiceReady && (
              <p className="text-center text-[10px] text-gray-300 mt-2">
                🎤 Voice input requires Chrome or Edge browser
              </p>
            )}

            {/* Voice error toast — auto-dismisses */}
            {voiceError && (
              <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 animate-slideIn">
                <span className="text-amber-500 text-lg">⚠️</span>
                <span className="text-amber-700 text-xs font-medium flex-1">{voiceError}</span>
                <button onClick={() => setVoiceError('')}
                  className="text-amber-400 hover:text-amber-600 text-[10px] font-bold ml-auto">✕</button>
              </div>
            )}
          </div>
        </div>

        {/* Booking Flow side panel */}
        {showBookingFlow && (
          <div className="w-full lg:w-[380px] border-l border-gray-100 flex flex-col overflow-hidden absolute inset-0 lg:relative lg:inset-auto z-10 bg-white">
            <BookingFlow
              onComplete={(data) => {
                setBookingFlow(false);
                const msg = `🎉 Your ${data.service?.label} appointment is confirmed for ${data.date} at ${data.time}!`;
                setMessages(prev => [...prev, { role: 'ai', text: msg, timestamp: Date.now() }]);
                setEmotion('confirming');
                speakText(msg);
                setTimeout(() => setEmotion('idle'), 4000);
              }}
              onClose={() => setBookingFlow(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
