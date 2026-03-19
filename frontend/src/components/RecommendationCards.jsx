import { MapPin, Star, ArrowRight, Navigation, ExternalLink } from 'lucide-react'

function RecommendationCard({ rec, onBook, animClass }) {
  const isBlue = rec.color === 'blue'
  const glowColor = isBlue ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)'
  const badgeBg = isBlue
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  const tagBg = isBlue
    ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'

  return (
    <div
      className={`${animClass} relative rounded-2xl p-[1px] overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${
          isBlue
            ? 'rgba(59,130,246,0.35), rgba(139,92,246,0.35)'
            : 'rgba(139,92,246,0.35), rgba(6,182,212,0.35)'
        })`,
      }}
    >
      <div
        className="rounded-2xl p-6 h-full flex flex-col relative overflow-hidden"
        style={{
          background: '#080e1c',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px ${glowColor}`,
        }}
      >
        {/* Background accent glow */}
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background: isBlue
              ? 'radial-gradient(circle, rgba(59,130,246,0.5), transparent)'
              : 'radial-gradient(circle, rgba(139,92,246,0.5), transparent)',
            filter: 'blur(35px)',
            opacity: 0.12,
            transform: 'translate(30%, -30%)',
          }}
        />

        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs font-semibold mb-2 ${badgeBg}`}>
              {rec.option}
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">{rec.label}</h3>
            <p className="text-base font-semibold gradient-text mt-0.5">{rec.place}</p>
          </div>
          <div className="text-4xl ml-3 flex-shrink-0" style={{ animation: 'float 4s ease-in-out infinite' }}>
            {rec.icon}
          </div>
        </div>

        {/* Hotel photo */}
        {rec.photo && (
          <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4">
            <img
              src={rec.photo}
              alt={rec.place}
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,14,28,0.6) 0%, transparent 60%)' }} />
          </div>
        )}

        {/* Address */}
        {rec.address && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={12} className="text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-400 truncate">{rec.address}</span>
          </div>
        )}

        {/* Meta row — distance + rating */}
        <div className="flex items-center gap-4 mb-4">
          {rec.distance && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: isBlue ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)' }}
              >
                <Navigation size={12} className={isBlue ? 'text-blue-400' : 'text-purple-400'} />
              </div>
              <span className="text-sm text-slate-400">{rec.distance}</span>
            </div>
          )}
          {rec.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <Star size={12} className="text-amber-400 fill-amber-400" />
              </div>
              <span className="font-bold text-amber-400 text-sm">{rec.rating}</span>
              {rec.reviews > 0 && (
                <span className="text-xs text-slate-500">({rec.reviews.toLocaleString()})</span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-5 flex-1">{rec.description}</p>

        {/* Tags */}
        {rec.tags && rec.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {rec.tags.map(tag => (
              <span key={tag} className={`text-xs rounded-lg px-2.5 py-1 font-medium border ${tagBg}`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Maps link + Book Now button */}
        <div className="flex flex-col gap-2">
          {rec.mapsUrl && (
            <a
              href={rec.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl py-2 transition-all duration-200"
            >
              <ExternalLink size={13} />
              View on Google Maps
            </a>
          )}
          <button
            className="btn-book flex items-center justify-center gap-2"
            onClick={() => onBook(rec)}
            id={`book-btn-${rec.id}`}
          >
            Book Now
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecommendationCards({ recommendations, onBook }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {recommendations.map((rec, i) => (
        <RecommendationCard
          key={rec.id}
          rec={rec}
          onBook={onBook}
          animClass={i === 0 ? 'slide-in' : 'slide-in-delay'}
        />
      ))}
    </div>
  )
}
