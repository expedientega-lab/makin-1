'use client'

interface OrbStageAtmosphereProps {
  intense?: boolean
}

export function OrbStageAtmosphere({ intense = false }: OrbStageAtmosphereProps) {
  const count = intense ? 24 : 16

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes orb-bg-star {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.85; transform: scale(1.2); }
        }
        @keyframes orb-bg-aurora {
          0%, 100% { opacity: 0.35; transform: translateX(0) scale(1); }
          50% { opacity: 0.65; transform: translateX(3%) scale(1.04); }
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 20%, rgba(120,60,200,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0,229,255,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 45% at 85% 70%, rgba(255,215,0,0.08) 0%, transparent 50%)
          `,
          animation: 'orb-bg-aurora 8s ease-in-out infinite',
        }}
      />

      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 5 === 0 ? 3 : 2,
            height: i % 5 === 0 ? 3 : 2,
            left: `${(i * 13.7) % 100}%`,
            top: `${(i * 19.3) % 100}%`,
            background: ['#ffd700', '#b388ff', '#00e5ff', '#ff6b9d', '#fff'][i % 5],
            boxShadow: `0 0 6px ${['#ffd700', '#b388ff', '#00e5ff', '#ff6b9d', '#fff'][i % 5]}`,
            animation: `orb-bg-star ${2 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.27) % 3}s`,
          }}
        />
      ))}
    </div>
  )
}
