import { useNavigate } from 'react-router-dom'
import { CheckCircle, Star, Clock, MapPin, ArrowLeft, Package } from 'lucide-react'

export default function BookingPage() {
  const navigate = useNavigate()
  const raw = localStorage.getItem('tg_booking')
  const booking = raw ? JSON.parse(raw) : null

  return (
    <div className="bg-animated min-h-screen px-4 py-10">
      {/* Background glows */}
      <div className="fixed top-0 left-1/3 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)', filter: 'blur(60px)' }} />

      <div className="max-w-lg mx-auto">
        {/* Back nav */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors duration-200 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-cyan-400 font-medium uppercase tracking-widest mb-1">Booking Details</p>
          <h1 className="text-2xl font-bold text-white">Your Reservation</h1>
        </div>

        {booking ? (
          <>
            {/* Status banner */}
            <div
              className="flex items-center gap-3 rounded-xl px-5 py-4 mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.08))',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <CheckCircle size={22} className="text-green-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-400 text-sm">Confirmed ✅</p>
                <p className="text-xs text-slate-400">Your booking is confirmed. SMS sent to registered number.</p>
              </div>
            </div>

            {/* Booking card */}
            <div className="glass-card p-6 mb-4">
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}
                >
                  {booking.icon || '🏨'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-white text-lg leading-tight">{booking.place}</h2>
                  <p className="text-sm text-slate-400">{booking.label || 'Your selected plan'}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-3">
                {/* Rating */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Star size={16} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Rating</p>
                    <p className="text-sm font-bold text-amber-400">{booking.rating} ★</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Clock size={16} className="text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Scheduled Time</p>
                    <p className="text-sm font-bold text-white">{booking.time}</p>
                  </div>
                </div>

                {/* Address */}
                {booking.address && (
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <MapPin size={16} className="text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Location</p>
                      <p className="text-sm font-semibold text-white">{booking.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Maps link */}
            {booking.mapsUrl && (
              <a
                href={booking.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-white/10 hover:border-white/20 rounded-xl py-3 text-sm text-slate-400 hover:text-white transition-all duration-200 mb-4"
              >
                🗺️ View on Google Maps
              </a>
            )}

            {/* Replan */}
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              ✨ Plan Another Evening
            </button>
          </>
        ) : (
          /* No booking state */
          <div className="glass-card p-12 text-center">
            <Package size={48} className="text-slate-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-300 mb-2">No booking found</h2>
            <p className="text-sm text-slate-500 mb-6">
              You haven't made a booking yet. Go plan your perfect evening!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center justify-center gap-2 mx-auto"
            >
              ✨ Plan My Evening
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
