import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ChatPreview from './components/ChatPreview';
import Footer from './components/Footer';
import ChatRoom from './components/ChatRoom';
import BookingsList from './components/BookingsList';
import './App.css';

export default function App() {
  const [view, setView] = useState('landing');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [view]);

  if (view === 'chat')     return <ChatRoom onBack={() => setView('landing')} />;
  if (view === 'bookings') return <BookingsList onBack={() => setView('landing')} />;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar
        onStartChat={() => setView('chat')}
        onViewBookings={() => setView('bookings')}
      />
      <main>
        <section className="reveal">
          <HeroSection onStartChat={() => setView('chat')} onViewBookings={() => setView('bookings')} />
        </section>
        <section className="reveal">
          <FeaturesSection />
        </section>
        <section className="reveal">
          <ChatPreview />
        </section>
      </main>
      <Footer />
    </div>
  );
}
