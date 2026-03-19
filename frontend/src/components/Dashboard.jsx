import { useState, useEffect } from 'react'
import { MapPin, Clock, User, Calendar, Wifi, Navigation, ChevronDown } from 'lucide-react'

const PREFERENCE_OPTIONS = [
  { value: 'business', label: 'Business', emoji: '💼', sub: 'Meetings, Hotels, Lounges' },
  { value: 'relax',    label: 'Relax Mode', emoji: '🧘', sub: 'Parks, Spas, Quiet spots' },
  { value: 'food',     label: 'Foodie',     emoji: '🍽️', sub: 'Restaurants, Cafes, Street food' },
  { value: 'explore',  label: 'Explorer',   emoji: '🗺️', sub: 'Attractions, Museums, Hidden gems' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function formatTime12(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// ── InfoCard (static display) ─────────────────────────────────────────────────
const InfoCard = ({ icon: Icon, label, value, color, sub, badge, children }) => (
  <div className="glass-card p-5 flex items-start gap-4 flex-1 min-w-0">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        {badge && (
          <span className="text-[10px] font-semibold border rounded-full px-2 py-0.5 text-green-400 border-green-500/30 bg-green-500/10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            {badge}
          </span>
        )}
      </div>
      {children || <p className="text-base font-semibold text-white truncate">{value}</p>}
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ── Main Dashboard component ──────────────────────────────────────────────────
export default function Dashboard({ onInputChange }) {
  // ── User identity ─────────────────────────────────────────────────────────
  const userRaw = localStorage.getItem('tg_user')
  const user = userRaw ? JSON.parse(userRaw) : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Traveler')

  // ── Date / time ───────────────────────────────────────────────────────────
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const greeting = getGreeting()

  // ── GPS / location ────────────────────────────────────────────────────────
  const [locationLabel, setLocationLabel] = useState('Detecting…')
  const [locationSub, setLocationSub]     = useState('Requesting GPS…')
  const [gpsActive, setGpsActive]         = useState(false)
  const [coords, setCoords]               = useState({ lat: null, lng: null })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLabel('Bengaluru, KA')
      setLocationSub('GPS not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        setGpsActive(true)

        // Reverse geocode — Google Geocoding API (uses the API key from .env)
        const geoKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
        try {
          if (geoKey) {
            // ── Google Geocoding API ──────────────────────────────────────
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${geoKey}`
            )
            const data = await res.json()
            const result = data.results?.[0]
            if (result) {
              const comps = result.address_components
              const city    = comps.find(c => c.types.includes('locality'))?.long_name
                           || comps.find(c => c.types.includes('sublocality'))?.long_name
                           || comps.find(c => c.types.includes('administrative_area_level_2'))?.long_name
              const country  = comps.find(c => c.types.includes('country'))?.short_name
              const district = comps.find(c => c.types.includes('sublocality_level_1'))?.long_name
                            || comps.find(c => c.types.includes('neighborhood'))?.long_name
              setLocationLabel(city ? `${city}${country ? ', ' + country : ''}` : result.formatted_address.split(',')[0])
              setLocationSub(district && district !== city ? district : (comps.find(c => c.types.includes('administrative_area_level_1'))?.long_name || 'Live location'))
              return
            }
          }
          // ── Fallback: OpenStreetMap Nominatim (no key needed) ───────────
          const res2 = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelGenie/1.0' } }
          )
          const data2 = await res2.json()
          const addr = data2.address || {}
          const city    = addr.city || addr.town || addr.suburb || addr.village || addr.county || ''
          const country = addr.country_code?.toUpperCase() || ''
          const district = addr.suburb || addr.neighbourhood || addr.state || ''
          setLocationLabel(city ? `${city}${country ? ', ' + country : ''}` : (data2.display_name?.split(',')[0] || 'Unknown'))
          setLocationSub(district && district !== city ? district : 'Live location')
        } catch {
          setLocationLabel('Location detected')
          setLocationSub('GPS Active')
        }

      },
      () => {
        // Permission denied or timeout → use Bengaluru as fallback
        setLocationLabel('Bengaluru, IN')
        setLocationSub('Location access denied — using default')
        setGpsActive(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [])

  // Bubble up coords whenever they change
  useEffect(() => {
    onInputChange?.({ coords, locationLabel })
  }, [coords, locationLabel])

  // ── Time inputs ───────────────────────────────────────────────────────────
  const [startTime, setStartTime] = useState('')
  const [endTime,   setEndTime]   = useState('')

  const timeDisplay = (() => {
    const s = formatTime12(startTime)
    const e = formatTime12(endTime)
    if (s && e) return `${s} – ${e}`
    if (s)      return `From ${s}`
    return 'Select your free time'
  })()

  const timeSub = (() => {
    if (startTime && endTime) {
      const diffMin = (new Date(`2000-01-01T${endTime}`) - new Date(`2000-01-01T${startTime}`)) / 60000
      if (diffMin > 0) return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m available`
    }
    return 'Set start & end time'
  })()

  // ── Preference ────────────────────────────────────────────────────────────
  const [preference, setPreference] = useState('business')
  const prefObj = PREFERENCE_OPTIONS.find(p => p.value === preference) || PREFERENCE_OPTIONS[0]

  // ── Bubble up all inputs together ─────────────────────────────────────────
  useEffect(() => {
    onInputChange?.({ coords, locationLabel, startTime, endTime, preference })
  }, [startTime, endTime, preference])

  return (
    <div className="mt-8">
      {/* Hero greeting */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 tag mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block animate-pulse" />
          {dateStr}
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight tracking-tight">
          {greeting},{' '}
          <span className="gradient-text">{displayName}</span> 👋
        </h2>
        <p className="text-slate-400 text-lg">Your AI concierge has a few hours to fill — let's make them count.</p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        {/* Location card */}
        <InfoCard
          icon={MapPin}
          label="Your Location"
          value={locationLabel}
          sub={locationSub}
          badge={gpsActive ? 'GPS Active' : null}
          color="bg-blue-500/20 border border-blue-500/20"
        />

        {/* Time card — with inputs */}
        <InfoCard
          icon={Clock}
          label="Free Time Window"
          value={timeDisplay}
          sub={timeSub}
          color="bg-purple-500/20 border border-purple-500/20"
        >
          <p className="text-base font-semibold text-white mb-2 truncate">{timeDisplay}</p>
          <p className="text-xs text-slate-400 mb-3">{timeSub}</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Start</p>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="time-input"
                aria-label="Start time"
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">End</p>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="time-input"
                aria-label="End time"
              />
            </div>
          </div>
        </InfoCard>

        {/* Preference card — with dropdown */}
        <InfoCard
          icon={User}
          label="Traveler Profile"
          color="bg-cyan-500/20 border border-cyan-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{prefObj.emoji}</span>
            <p className="text-base font-semibold text-white">{prefObj.label}</p>
          </div>
          <p className="text-xs text-slate-400 mb-3">{prefObj.sub}</p>
          <div className="relative">
            <select
              value={preference}
              onChange={e => setPreference(e.target.value)}
              className="pref-select"
              aria-label="Travel preference"
            >
              {PREFERENCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </InfoCard>
      </div>

      {/* Context bar */}
      <div className="glass-card px-5 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Navigation size={14} className={gpsActive ? 'text-green-400' : 'text-slate-400'} />
          <span className={`text-xs ${gpsActive ? 'text-green-400' : 'text-slate-400'}`}>
            {gpsActive ? 'Live GPS' : 'Default Location'}
          </span>
        </div>
        <div className="w-px h-4 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400">Calendar synced</span>
        </div>
        <div className="w-px h-4 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400">Weather: 24°C, Clear</span>
        </div>
        <div className="w-px h-4 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">🤖 4 AI agents on standby</span>
        </div>
        <div className="ml-auto">
          <span className="tag">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            All systems ready
          </span>
        </div>
      </div>
    </div>
  )
}
