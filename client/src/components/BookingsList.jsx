import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronLeft, RefreshCw, Database, ShieldCheck, CheckCircle, X, AlertCircle, RotateCcw, Search } from 'lucide-react';

const STATUS_STYLES = {
  confirmed: { label: 'Confirmed', bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', icon: CheckCircle },
  pending:   { label: 'Pending',   bg: '#fffbeb', text: '#d97706', border: '#fde68a', icon: Clock },
  cancelled: { label: 'Cancelled', bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: X },
};

function BookingCard({ booking, onCancel, onReschedule }) {
  const status = STATUS_STYLES[booking.status || 'confirmed'];
  const StatusIcon = status.icon;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <User size={18} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm">{booking.name || 'Guest'}</p>
            <p className="text-gray-400 text-xs truncate max-w-[160px]">{booking.email || '—'}</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
          style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
          <StatusIcon size={9} />
          {status.label}
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-indigo-400 flex-shrink-0" />
          <span className="text-gray-600 text-xs">{booking.date || '—'}</span>
          {booking.time && (<>
            <Clock size={12} className="text-indigo-400 flex-shrink-0 ml-2" />
            <span className="text-gray-600 text-xs">{booking.time}</span>
          </>)}
        </div>
        {booking.service && (
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-green-500 flex-shrink-0" />
            <span className="text-gray-600 text-xs">{booking.service}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-50">
        <button onClick={() => onReschedule(booking)}
          className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center gap-1">
          <RotateCcw size={10} /> Reschedule
        </button>
        <button onClick={() => onCancel(booking._id)}
          className="flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all">
          <X size={10} /> Cancel
        </button>
      </div>
    </div>
  );
}

function StatsBar({ bookings }) {
  const total     = bookings.length;
  const confirmed = bookings.filter(b => (b.status || 'confirmed') === 'confirmed').length;
  const pending   = bookings.filter(b => b.status === 'pending').length;
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: 'Total',     value: total,     color: '#6366f1', bg: '#eef2ff' },
        { label: 'Confirmed', value: confirmed, color: '#16a34a', bg: '#f0fdf4' },
        { label: 'Pending',   value: pending,   color: '#d97706', bg: '#fffbeb' },
      ].map(s => (
        <div key={s.label} className="rounded-xl p-3 text-center border" style={{ background: s.bg, borderColor: `${s.color}20` }}>
          <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: s.color }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function BookingsList({ onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [cancelId, setCancelId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) { setBookings(data.bookings); setError(null); }
      else setError('Failed to fetch bookings.');
    } catch { setError('Cannot connect to server. Is the backend running?'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel      = (id) => { setBookings(p => p.map(b => b._id === id ? { ...b, status: 'cancelled' } : b)); setCancelId(null); };
  const handleReschedule  = (b) => alert(`Reschedule: ${b.name} – ${b.date}`);

  const filtered = bookings.filter(b => {
    const ms = !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.email?.toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || (b.status || 'confirmed') === filter;
    return ms && mf;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-gray-900 font-bold text-lg">Booking History</h1>
            <p className="text-gray-400 text-xs flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live sync
            </p>
          </div>
        </div>
        <button onClick={fetchBookings}
          className="h-9 px-4 rounded-xl flex items-center gap-2 text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-all text-xs font-bold">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6">
        {!loading && !error && bookings.length > 0 && <StatsBar bookings={bookings} />}

        {/* Search & filter */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none text-gray-700 placeholder-gray-300 bg-white border border-gray-200 focus:border-indigo-300 transition-colors" />
          </div>
          <div className="flex gap-1.5">
            {['all', 'confirmed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border"
                style={{
                  background: filter === f ? '#eef2ff' : '#fff',
                  borderColor: filter === f ? '#c7d2fe' : '#e5e7eb',
                  color: filter === f ? '#6366f1' : '#6b7280',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="rounded-2xl p-12 text-center bg-red-50 border border-red-100">
            <AlertCircle size={28} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-bold mb-4">{error}</p>
            <button onClick={fetchBookings} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-all">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center bg-white border border-gray-100">
            <Database size={28} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-700 font-bold mb-2">No appointments found</h3>
            <p className="text-gray-400 text-sm">{search ? 'Try a different search term.' : 'Book your first appointment with Aura!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(b => (
              <BookingCard key={b._id} booking={b} onCancel={id => setCancelId(id)} onReschedule={handleReschedule} />
            ))}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-xl w-full max-w-sm">
            <AlertCircle size={28} className="text-red-400 mb-4" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">Cancel Appointment?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                Go Back
              </button>
              <button onClick={() => handleCancel(cancelId)}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
