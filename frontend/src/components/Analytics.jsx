import { TrendingUp, Award, Activity } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Analytics({ analytics }) {
  const { total, popular, countA, countB } = analytics

  const pctA = total > 0 ? Math.round((countA / total) * 100) : 50
  const pctB = total > 0 ? Math.round((countB / total) * 100) : 50

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Activity size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-white">Analytics</h3>
          <p className="text-xs text-slate-500">Session insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Total Bookings"
          value={total}
          sub="This session"
          color="#3b82f6"
        />
        <StatCard
          icon={Award}
          label="Popular Choice"
          value={popular ?? '—'}
          sub={popular ? 'Most selected' : 'No bookings yet'}
          color="#f59e0b"
        />
        <StatCard
          icon={Activity}
          label="AI Plans Generated"
          value={total > 0 ? 1 : 0}
          sub="Evening plans"
          color="#8b5cf6"
        />
      </div>

      {/* Distribution bar */}
      <div className="glass-card p-5">
        <p className="text-sm font-semibold text-white mb-4">Option Preference Distribution</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>🍽️ Option A — Business Dinner</span>
              <span className="font-medium text-white">{pctA}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                style={{ width: `${pctA}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>🌿 Option B — Relax & Unwind</span>
              <span className="font-medium text-white">{pctB}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-700"
                style={{ width: `${pctB}%` }}
              ></div>
            </div>
          </div>
        </div>
        {total === 0 && (
          <p className="text-xs text-slate-600 text-center mt-4">Book an option above to see the analytics update in real time</p>
        )}
      </div>
    </div>
  )
}
