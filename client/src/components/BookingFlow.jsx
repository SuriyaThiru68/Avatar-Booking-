import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, Stethoscope, Video, Coffee, Dumbbell } from 'lucide-react';

const SERVICES = [
  { id: 'doctor',   icon: Stethoscope, label: 'Doctor Visit',    duration: '30 min', color: '#6366f1' },
  { id: 'video',    icon: Video,       label: 'Video Consult',   duration: '20 min', color: '#10b981' },
  { id: 'meeting',  icon: Coffee,      label: 'Business Meet',   duration: '45 min', color: '#f59e0b' },
  { id: 'wellness', icon: Dumbbell,    label: 'Wellness Check',  duration: '60 min', color: '#ec4899' },
];

const TIME_SLOTS = {
  Morning:   ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
  Afternoon: ['01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'],
  Evening:   ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'],
};
const BOOKED = ['09:30 AM', '10:30 AM', '02:00 PM', '05:00 PM'];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function AvailableSlotsScreen({ onSlotSelected, onBack, service }) {
  const today = new Date();
  const [viewMonth, setViewMonth]     = useState(today.getMonth());
  const [viewYear, setViewYear]       = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(service || SERVICES[0]);

  const days     = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const dateStr  = `${MONTH_NAMES[viewMonth]} ${selectedDay}, ${viewYear}`;

  useEffect(() => setSelectedSlot(null), [selectedDay, viewMonth, viewYear]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <ChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-gray-900 font-bold text-base">Available Slots</h2>
          <p className="text-gray-400 text-xs mt-0.5">Select service, date & time</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Service picker */}
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Select Service</p>
          <div className="grid grid-cols-2 gap-2">
            {SERVICES.map(s => (
              <button key={s.id} onClick={() => setSelectedService(s)}
                className="p-3 rounded-xl border text-left transition-all"
                style={{
                  background: selectedService.id === s.id ? `${s.color}08` : '#fafafa',
                  borderColor: selectedService.id === s.id ? s.color : '#e5e7eb',
                }}>
                <s.icon size={15} style={{ color: s.color }} className="mb-1" />
                <p className="text-gray-800 font-bold text-xs">{s.label}</p>
                <p className="text-gray-400 text-[9px]">{s.duration}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
              <ChevronLeft size={14} />
            </button>
            <span className="text-gray-800 font-bold text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['S','M','T','W','T','F','S'].map((d,i) => (
              <div key={i} className="text-center text-gray-400 text-[10px] font-bold py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
            {Array.from({ length: days }).map((_,i) => {
              const day = i + 1;
              const isPast = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day < today.getDate();
              const isSelected = day === selectedDay;
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              return (
                <button key={day} disabled={isPast} onClick={() => setSelectedDay(day)}
                  className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: isSelected ? selectedService.color : isToday ? `${selectedService.color}15` : 'transparent',
                    color: isPast ? '#d1d5db' : isSelected ? '#fff' : isToday ? selectedService.color : '#374151',
                    cursor: isPast ? 'not-allowed' : 'pointer',
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Times — {dateStr}</p>
          {Object.entries(TIME_SLOTS).map(([period, slots]) => (
            <div key={period} className="mb-4">
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-2">{period}</p>
              <div className="grid grid-cols-3 gap-2">
                {slots.map(slot => {
                  const isBooked   = BOOKED.includes(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button key={slot} disabled={isBooked} onClick={() => setSelectedSlot(slot)}
                      className="py-2 px-2 rounded-xl text-[10px] font-bold transition-all border"
                      style={{
                        background: isBooked ? '#fafafa' : isSelected ? selectedService.color : '#fff',
                        borderColor: isBooked ? '#f3f4f6' : isSelected ? selectedService.color : '#e5e7eb',
                        color: isBooked ? '#d1d5db' : isSelected ? '#fff' : '#374151',
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        textDecoration: isBooked ? 'line-through' : 'none',
                      }}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 border-t border-gray-100 bg-white">
        {selectedSlot && (
          <div className="mb-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-medium">
              <selectedService.icon size={13} />
              {selectedService.label} · {dateStr} · {selectedSlot}
            </div>
          </div>
        )}
        <button onClick={() => { if (!selectedSlot) return; onSlotSelected({ service: selectedService, date: dateStr, time: selectedSlot }); }}
          disabled={!selectedSlot}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: selectedSlot ? selectedService.color : '#f3f4f6',
            color: selectedSlot ? '#fff' : '#9ca3af',
          }}>
          <Calendar size={15} />
          Confirm Selection
        </button>
      </div>
    </div>
  );
}

export function ConfirmationScreen({ booking, onConfirm, onEdit, onBack }) {
  const svc = SERVICES.find(s => s.id === booking?.service?.id) || SERVICES[0];
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all">
          <ChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-gray-900 font-bold text-base">Confirm Booking</h2>
          <p className="text-gray-400 text-xs mt-0.5">Review your appointment</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div className="w-full rounded-2xl p-6 border bg-white" style={{ borderColor: `${svc.color}22` }}>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${svc.color}10` }}>
              <svc.icon size={28} style={{ color: svc.color }} />
            </div>
          </div>
          <h3 className="text-gray-900 font-bold text-xl text-center mb-1">{booking?.service?.label}</h3>
          <p className="text-gray-400 text-sm text-center mb-6">{booking?.service?.duration} session</p>

          <div className="space-y-3">
            {[
              { label: 'Date',  value: booking?.date, icon: Calendar },
              { label: 'Time',  value: booking?.time, icon: Clock },
              { label: 'Name',  value: booking?.name || 'Guest User', icon: null },
              { label: 'Email', value: booking?.email || 'user@example.com', icon: null },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</span>
                <div className="flex items-center gap-2">
                  {Icon && <Icon size={12} style={{ color: svc.color }} />}
                  <span className="text-gray-800 text-sm font-semibold">{value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-gray-500 text-xs text-center">📧 A confirmation will be sent to your email after booking.</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <button onClick={onConfirm}
          className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
          style={{ background: svc.color }}>
          <CheckCircle size={16} />Confirm Appointment
        </button>
        <button onClick={onEdit}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
          Edit Details
        </button>
      </div>
    </div>
  );
}

export function BookingSuccessScreen({ booking, onDone }) {
  const svc = SERVICES.find(s => s.id === booking?.service?.id) || SERVICES[0];
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setInterval(() => { setCount(c => { if(c >= 100){clearInterval(t); return 100;} return c+4; }); }, 30);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white items-center justify-center px-6">
      <div className="relative mb-8">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="6" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={svc.color} strokeWidth="6"
            strokeDasharray={`${2*Math.PI*54}`}
            strokeDashoffset={`${2*Math.PI*54*(1-count/100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.08s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle size={36} style={{ color: svc.color }} />
        </div>
      </div>
      <h2 className="text-gray-900 font-bold text-2xl mb-2 text-center">Booking Confirmed!</h2>
      <p className="text-gray-400 text-sm text-center mb-8">Your appointment has been successfully scheduled.</p>

      <div className="w-full rounded-2xl p-5 border border-gray-100 bg-gray-50 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${svc.color}12` }}>
            <svc.icon size={18} style={{ color: svc.color }} />
          </div>
          <div>
            <p className="text-gray-800 font-bold text-sm">{booking?.service?.label}</p>
            <p className="text-gray-400 text-xs">{booking?.date} · {booking?.time}</p>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Confirmed · ID: #{Math.random().toString(36).substr(2, 8).toUpperCase()}
        </div>
      </div>

      <button onClick={onDone}
        className="w-full py-3.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
        Back to Chat
      </button>
    </div>
  );
}

export function BookingFlow({ onComplete, onClose, prefillName='', prefillEmail='' }) {
  const [step, setStep]             = useState('slots');
  const [bookingData, setBookingData] = useState({ name: prefillName, email: prefillEmail, service: SERVICES[0], date: '', time: '' });

  const handleSlotSelected = (sd) => { setBookingData(prev => ({ ...prev, ...sd })); setStep('confirm'); };
  const handleConfirm = async () => {
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: bookingData.name || 'Guest', email: bookingData.email, date: bookingData.date, time: bookingData.time, service: bookingData.service?.label }),
      });
    } catch {}
    setStep('success');
    onComplete?.(bookingData);
  };

  if (step === 'slots')   return <AvailableSlotsScreen onSlotSelected={handleSlotSelected} onBack={onClose} service={bookingData.service} />;
  if (step === 'confirm') return <ConfirmationScreen booking={bookingData} onConfirm={handleConfirm} onEdit={() => setStep('slots')} onBack={() => setStep('slots')} />;
  return <BookingSuccessScreen booking={bookingData} onDone={onClose} />;
}
