import { useState, useEffect } from 'react'

const AGENT_STEPS = (location) => [
  {
    id: 1,
    icon: '🤖',
    label: 'Discovery Agent',
    task: `Fetching nearby places near ${location}…`,
    color: 'blue',
  },
  {
    id: 2,
    icon: '🧠',
    label: 'Planner Agent',
    task: 'Creating your personalized evening plan…',
    color: 'purple',
  },
  {
    id: 3,
    icon: '📩',
    label: 'Notification Agent',
    task: 'Preparing booking & SMS alerts…',
    color: 'cyan',
  },
]

export default function LoadingScreen({ location = 'your area' }) {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [dots, setDots] = useState('')

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'))
    }, 400)
    return () => clearInterval(dotInterval)
  }, [])

  useEffect(() => {
    const STEP_DURATION = 1600
    if (activeStep < AGENT_STEPS.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, activeStep])
        setActiveStep(prev => prev + 1)
      }, STEP_DURATION)
      return () => clearTimeout(timer)
    }
  }, [activeStep])

  return (
    <div className="mt-10 flex flex-col items-center">
      {/* Animated robot orb */}
      <div className="relative w-36 h-36 mb-8" style={{ animation: 'float 4s ease-in-out infinite' }}>
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(59,130,246,0.25)', animation: 'orbit 3s linear infinite' }}
        >
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
            style={{ background: '#60a5fa', boxShadow: '0 0 12px rgba(59,130,246,0.9)' }}
          />
        </div>
        {/* Inner ring */}
        <div
          className="absolute inset-5 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.25)', animation: 'orbit-reverse 2s linear infinite' }}
        >
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
            style={{ background: '#a78bfa', boxShadow: '0 0 10px rgba(139,92,246,0.9)' }}
          />
        </div>
        {/* Centre orb */}
        <div
          className="absolute inset-9 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(139,92,246,0.8))',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 0 30px rgba(139,92,246,0.5)',
          }}
        >
          <span className="text-3xl">🤖</span>
        </div>
      </div>

      {/* Status headline */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          AI agents are collaborating{dots}
        </h3>
        <p className="text-slate-400 text-sm">Generating your personalized evening plan</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 10px rgba(59,130,246,0.6)',
              animation: 'progress-fill 5s ease-in-out forwards',
            }}
          />
        </div>
      </div>

      {/* Agent steps */}
      <div className="w-full max-w-md space-y-3">
        {AGENT_STEPS(location).map((step, i) => {
          const isCompleted = completedSteps.includes(i)
          const isActive = activeStep === i
          const isPending = activeStep < i

          return (
            <div
              key={step.id}
              className="glass-card px-4 py-4 flex items-center gap-4 transition-all duration-500"
              style={{
                borderColor: isActive ? 'rgba(59,130,246,0.35)' : undefined,
                background: isActive ? 'rgba(59,130,246,0.06)' : undefined,
                opacity: isPending ? 0.45 : 1,
              }}
            >
              {/* Icon */}
              <div className="text-xl w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {step.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isCompleted ? 'text-slate-400' : 'text-white'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 truncate">{step.task}</p>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0 w-6 flex items-center justify-center">
                {isCompleted ? (
                  <span className="text-green-400 text-base font-bold">✓</span>
                ) : isActive ? (
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      borderColor: '#60a5fa',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                ) : (
                  <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
