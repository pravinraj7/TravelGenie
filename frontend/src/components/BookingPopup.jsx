import { useEffect } from 'react'
import { CheckCircle, X, MapPin, Navigation, Star } from 'lucide-react'

export default function BookingPopup({ option, onClose, onViewDetails }) {
  // Auto close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="relative max-w-sm w-full mx-4 rounded-2xl overflow-hidden slide-in"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.08))',
          border: '1px solid rgba(6,182,212,0.3)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.08)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.3), transparent)',
            filter: 'blur(20px)',
          }}
        ></div>

        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors duration-200"
          onClick={onClose}
        >
          <X size={14} className="text-slate-400" />
        </button>

        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="relative inline-block mb-5">
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto"
              style={{ boxShadow: '0 0 30px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1)' }}
            >
              <CheckCircle size={40} className="text-cyan-400" />
            </div>
            <div className="absolute -inset-2 rounded-full border border-cyan-500/15 animate-ping"></div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
          <p className="text-slate-400 text-sm mb-6">
            ✅ SMS & WhatsApp notification sent to your registered number
          </p>

          {/* Booking detail */}
          <div
            className="rounded-xl p-4 mb-6 text-left"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{option.icon}</span>
              <div>
                <p className="font-semibold text-white text-sm">{option.place}</p>
                <p className="text-xs text-slate-500">{option.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Navigation size={11} />
                {option.distance}
              </span>
              <span className="flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                {option.rating}
              </span>
              <span>Tonight · 6:30 PM</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button
              className="btn-book text-sm py-3"
              onClick={() => onViewDetails ? onViewDetails() : onClose()}
            >
              View Booking Details
            </button>
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-4">Auto-closing in 5 seconds</p>
        </div>
      </div>
    </div>
  )
}
