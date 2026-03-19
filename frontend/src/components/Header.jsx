import { MapPin, Zap } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-white/5 backdrop-blur-xl bg-white/[0.02] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg neon-blue">
            <span className="text-xl">🧞</span>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">TravelGenie</h1>
            <p className="text-xs text-slate-500 leading-none">AI Travel Concierge</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 glass-card px-3 py-2 rounded-xl">
            <div className="pulse-dot"></div>
            <span className="text-xs text-slate-300 font-medium">AI Online</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl">
            <Zap size={12} className="text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">Pro</span>
          </div>
        </div>
      </div>
    </header>
  )
}
