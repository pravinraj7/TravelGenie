import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Dashboard from '../components/Dashboard'
import LoadingScreen from '../components/LoadingScreen'
import RecommendationCards from '../components/RecommendationCards'
import BookingPopup from '../components/BookingPopup'
import Analytics from '../components/Analytics'
import Header from '../components/Header'
import { LogOut } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://travelgenie-nwzr.onrender.com'

function shapeRecommendations(data) {
  return [
    {
      id: 'a',
      option: 'Option A',
      label: data.optionA.title,
      place: data.optionA.place,
      address: data.optionA.address || '',
      distance: data.optionA.distance || '',
      rating: parseFloat(data.optionA.rating) || 0,
      reviews: data.optionA.reviews || 0,
      description: data.optionA.desc,
      tags: data.optionA.tags || [],
      photo: data.optionA.photo || null,
      mapsUrl: data.optionA.maps_url || null,
      color: 'blue',
      icon: '🏨',
    },
    {
      id: 'b',
      option: 'Option B',
      label: data.optionB.title,
      place: data.optionB.place,
      address: data.optionB.address || '',
      distance: data.optionB.distance || '',
      rating: parseFloat(data.optionB.rating) || 0,
      reviews: data.optionB.reviews || 0,
      description: data.optionB.desc,
      tags: data.optionB.tags || [],
      photo: data.optionB.photo || null,
      mapsUrl: data.optionB.maps_url || null,
      color: 'purple',
      icon: '🌿',
    },
  ]
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('dashboard')
  const [recommendations, setRecommendations] = useState([])
  const [bookingOption, setBookingOption] = useState(null)
  const [analytics, setAnalytics] = useState({ total: 0, popular: null, countA: 0, countB: 0 })
  const [dataSource, setDataSource] = useState(null)
  const [apiError, setApiError] = useState(null)

  // ── User inputs collected from Dashboard ──────────────────────────────────
  const [userInputs, setUserInputs] = useState({
    coords: { lat: null, lng: null },
    locationLabel: 'Bengaluru',
    startTime: '',
    endTime: '',
    preference: 'business',
  })

  const handleInputChange = (updates) => {
    setUserInputs(prev => ({ ...prev, ...updates }))
  }

  // Get user from localStorage for header display
  const userRaw = localStorage.getItem('tg_user')
  const user = userRaw ? JSON.parse(userRaw) : null

  const handleLogout = () => {
    localStorage.removeItem('tg_user')
    navigate('/login')
  }

  const handlePlanEvening = async () => {
    setPhase('loading')
    setApiError(null)

    const { locationLabel, startTime, endTime, preference } = userInputs

    // ── Get REAL GPS coords fresh at click-time ───────────────────────────────
    // Don't rely on async Dashboard state — re-request directly to guarantee
    // real coordinates reach the backend, not the null/default fallback.
    let lat = null
    let lng = null

    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          enableHighAccuracy: true,
          maximumAge: 30000,   // accept a cached fix up to 30s old
        })
      )
      lat = pos.coords.latitude
      lng = pos.coords.longitude
      console.log(`[TravelGenie] Using real GPS: ${lat}, ${lng}`)
    } catch {
      // GPS denied/unavailable — fall back to whatever Dashboard resolved to
      const stored = userInputs.coords
      if (stored?.lat && stored?.lng) {
        lat = stored.lat
        lng = stored.lng
        console.log(`[TravelGenie] GPS retry failed — using stored coords: ${lat}, ${lng}`)
      } else {
        console.log('[TravelGenie] No GPS available — backend will use its default location')
      }
    }

    const payload = {
      lat,
      lng,
      locationLabel: locationLabel || null,   // city name e.g. "Madurai, IN"
      startTime: startTime || null,
      endTime: endTime || null,
      preference: preference || 'business',
    }

    console.log('[TravelGenie] /plan payload:', payload)

    try {
      const { data } = await axios.post(`${API_BASE}/plan`, payload, { timeout: 40000 })
      setRecommendations(shapeRecommendations(data))
      setDataSource(data.source || data.mode || 'demo')
    } catch (err) {
      console.error('Plan API error:', err)
      setApiError('Could not reach the backend. Make sure the FastAPI server is running on port 8000.')
      setRecommendations(shapeRecommendations({
        optionA: {
          title: 'Hotel Stay',
          place: 'The Leela Palace Bengaluru',
          rating: '4.8',
          address: '23 Airport Road, Kodihalli, Bengaluru',
          distance: '~10 min',
          reviews: 4521,
          tags: ['5-Star', 'Luxury', 'Pool & Spa'],
          desc: "One of Bengaluru's most iconic luxury hotels with world-class amenities, fine dining, and impeccable service.",
        },
        optionB: {
          title: 'Relax & Unwind',
          place: 'Lalbagh Botanical Garden',
          rating: '4.7',
          address: 'Mavalli, Bengaluru',
          distance: '~15 min',
          reviews: 9832,
          tags: ['Nature', 'Peaceful', 'Heritage'],
          desc: "One of India's oldest botanical gardens — perfect for an evening stroll through lush greenery.",
        },
        source: 'offline',
      }))
      setDataSource('offline')
    }

    setPhase('results')
  }

  const handleBookNow = async (option) => {
    try {
      await axios.post(`${API_BASE}/book`, {
        place: option.place,
        option: option.id,
        title: option.label,
      }, { timeout: 8000 })
    } catch {
      // simulate success for demo
    }

    const { startTime } = userInputs
    const timeStr = startTime
      ? (() => {
          const [h, m] = startTime.split(':').map(Number)
          const ampm = h >= 12 ? 'PM' : 'AM'
          return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
        })()
      : '6:30 PM'

    localStorage.setItem('tg_booking', JSON.stringify({
      place: option.place,
      rating: option.rating,
      time: timeStr,
      label: option.label,
      address: option.address,
      mapsUrl: option.mapsUrl,
      icon: option.icon,
    }))

    setBookingOption(option)
    setAnalytics(prev => {
      const newCountA = prev.countA + (option.id === 'a' ? 1 : 0)
      const newCountB = prev.countB + (option.id === 'b' ? 1 : 0)
      return {
        total: prev.total + 1,
        countA: newCountA,
        countB: newCountB,
        popular: newCountA >= newCountB ? 'Option A' : 'Option B',
      }
    })
  }

  const handleViewBookingDetails = () => {
    setBookingOption(null)
    navigate('/booking')
  }

  const handleClosePopup = () => setBookingOption(null)
  const handleReset = () => {
    setPhase('dashboard')
    setDataSource(null)
    setApiError(null)
  }

  const sourceBadge = {
    google_places: { label: '🌐 Live — Google Places', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
    demo:          { label: '🧪 Demo Mode',             color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    fallback:      { label: '⚠️ Fallback — API Error',  color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    offline:       { label: '📴 Offline Mode',          color: 'text-slate-400 border-slate-500/30 bg-slate-500/10' },
  }

  return (
    <div className="bg-animated min-h-screen">
      <Header />

      {/* Logout bar */}
      <div className="max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {user ? (
            <>Signed in as <span className="text-slate-300 font-medium">{user.email}</span></>
          ) : null}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl px-4 py-2 transition-all duration-200"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {/* Dashboard collects and exposes user inputs */}
        <Dashboard onInputChange={handleInputChange} />

        {/* Plan button */}
        {phase === 'dashboard' && (
          <div className="flex justify-center mt-10 mb-4">
            <button
              className="btn-primary flex items-center gap-3 text-lg font-semibold"
              onClick={handlePlanEvening}
              id="plan-evening-btn"
            >
              <span className="text-2xl">✨</span>
              Plan My Evening
              <span className="text-2xl">→</span>
            </button>
          </div>
        )}

        {/* AI Loading */}
        {phase === 'loading' && (
          <LoadingScreen location={userInputs.locationLabel} />
        )}

        {/* Results */}
        {phase === 'results' && (
          <>
            <div className="flex justify-between items-center mt-8 mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm text-blue-400 font-medium uppercase tracking-widest">AI Recommendations</p>
                  {dataSource && sourceBadge[dataSource] && (
                    <span className={`text-xs font-medium border rounded-lg px-2 py-0.5 ${sourceBadge[dataSource].color}`}>
                      {sourceBadge[dataSource].label}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">Your Personalized Evening Plan</h2>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 transition-all duration-200"
              >
                ↺ Replan
              </button>
            </div>

            {apiError && (
              <div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
                ⚠️ {apiError}
              </div>
            )}

            <RecommendationCards recommendations={recommendations} onBook={handleBookNow} />
            <Analytics analytics={analytics} />
          </>
        )}

        {/* Booking popup */}
        {bookingOption && (
          <BookingPopup
            option={bookingOption}
            onClose={handleClosePopup}
            onViewDetails={handleViewBookingDetails}
          />
        )}
      </main>
    </div>
  )
}
