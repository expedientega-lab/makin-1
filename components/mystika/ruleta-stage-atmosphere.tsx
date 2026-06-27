'use client'

interface RuletaStageAtmosphereProps {
  /** Luces al máximo — ruleta encendida o girando */
  live: boolean
  /** Pulso suave invitando a JUEGA */
  tease?: boolean
  /** Tono dorado del bonus */
  gold?: boolean
}

export function RuletaStageAtmosphere({
  live,
  tease = false,
  gold = false,
}: RuletaStageAtmosphereProps) {
  const accent = gold ? '#ffd700' : '#b388ff'
  const accentSoft = gold ? 'rgba(255,215,0,0.5)' : 'rgba(179,136,255,0.45)'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl" aria-hidden>
      <style>{`
        @keyframes ruleta-ambient-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes ruleta-sparkle {
          0%, 100% { opacity: 0.1; transform: scale(0.6); }
          40% { opacity: 0.95; transform: scale(1.2); }
          70% { opacity: 0.35; transform: scale(0.9); }
        }
        @keyframes ruleta-tease-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.55; }
        }
      `}</style>

      {(live || tease) && (
        <div
          className="absolute inset-0"
          style={{
            background: live
              ? gold
                ? 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(255,215,0,0.14) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(179,136,255,0.1) 0%, transparent 50%)'
                : 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(179,136,255,0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(255,45,120,0.08) 0%, transparent 50%)'
              : `radial-gradient(ellipse 80% 60% at 50% 50%, ${accentSoft} 0%, transparent 60%)`,
            animation: tease && !live ? 'ruleta-tease-glow 2.2s ease-in-out infinite' : undefined,
          }}
        />
      )}

      {Array.from({ length: live ? 8 : tease ? 4 : 0 }, (_, i) => (
        <div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            width: i % 4 === 0 ? 3 : 2,
            height: i % 4 === 0 ? 3 : 2,
            left: `${12 + ((i * 19) % 76)}%`,
            top: `${18 + ((i * 27) % 70)}%`,
            background: i % 3 === 0 ? accent : i % 3 === 1 ? '#b388ff' : '#ffd700',
            boxShadow: `0 0 6px ${i % 2 ? accent : '#b388ff'}`,
            animation: `ruleta-sparkle ${1.8 + (i % 5) * 0.4}s ease-in-out infinite`,
            animationDelay: `${(i * 0.31) % 2.5}s`,
          }}
        />
      ))}
    </div>
  )
}
