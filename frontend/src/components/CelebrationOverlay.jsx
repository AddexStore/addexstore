import { useCelebration } from '../context/CelebrationContext'

function Particle({ index }) {
  const angle = (index / 12) * 360
  const distance = 60 + Math.random() * 80
  const size = 4 + Math.random() * 6
  const delay = Math.random() * 0.2

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        animation: `celebrate-particle 1s ease-out ${delay}s forwards`,
        opacity: 0,
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: index % 3 === 0 ? '#C6A972' : index % 3 === 1 ? '#FFFFFF' : '#E7E2DA',
          transform: `rotate(${angle}deg) translateX(${distance}px)`,
        }}
      />
    </div>
  )
}

export default function CelebrationOverlay() {
  const { celebration } = useCelebration()

  if (!celebration) return null

  return (
    <div
      key={celebration.key}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ animation: 'celebration-fade 1.8s ease-out forwards' }}
    >
      <div
        className="absolute inset-0 bg-[var(--bg-card)]/30 backdrop-blur-sm"
        style={{ animation: 'celebration-fade 1.8s ease-out forwards' }}
      />
      <div className="relative pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
        <div
          className="relative w-20 h-20 rounded-full bg-[#C6A972] flex items-center justify-center shadow-xl shadow-[#C6A972]/30"
          style={{ animation: 'celebrate-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        >
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p
          className="text-center text-sm font-medium text-[var(--text-primary)] mt-4"
          style={{ animation: 'celebrate-text 0.5s 0.3s ease-out forwards', opacity: 0 }}
        >
          {celebration.message}
        </p>
      </div>

      <style>{`
        @keyframes celebration-fade {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes celebrate-pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes celebrate-particle {
          0% { opacity: 0; transform: translate(0, 0) scale(0); }
          30% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx, 0), var(--dy, 0)) scale(0); }
        }
        @keyframes celebrate-text {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
