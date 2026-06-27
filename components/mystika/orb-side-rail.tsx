'use client'

const ORB_PRIZES = [
  { icon: '💵', accent: '#ffd700' },
  { icon: '🔮', accent: '#b388ff' },
  { icon: '💜', accent: '#ff6b9d' },
  { icon: '🥠', accent: '#00ff9d' },
] as const

function NeonTube({
  active,
  frantic,
  vertical = true,
}: {
  active: boolean
  frantic?: boolean
  vertical?: boolean
}) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-full',
        vertical
          ? 'w-[5px] md:w-[6px] flex-1 min-h-[72px] max-h-[120px]'
          : 'h-[4px] flex-1 min-w-[48px]',
      ].join(' ')}
      style={{
        background: 'linear-gradient(180deg, rgba(40,32,55,0.9), rgba(20,14,32,0.95))',
        boxShadow: active
          ? 'inset 0 0 6px rgba(0,0,0,0.6), 0 0 12px rgba(179,136,255,0.25)'
          : 'inset 0 0 4px rgba(0,0,0,0.5)',
      }}
    >
      {active && (
        <div
          className="absolute rounded-full"
          style={
            vertical
              ? {
                  left: 0,
                  right: 0,
                  height: '38%',
                  background:
                    'linear-gradient(180deg, transparent, #ffd700, #b388ff, #00e5ff, transparent)',
                  boxShadow: '0 0 14px rgba(255,215,0,0.85)',
                  animation: `orb-tube-run ${frantic ? 1.1 : 2}s linear infinite`,
                }
              : {
                  top: 0,
                  bottom: 0,
                  width: '30%',
                  background:
                    'linear-gradient(90deg, transparent, #ffd700, #b388ff, transparent)',
                  boxShadow: '0 0 10px rgba(255,215,0,0.7)',
                  animation: `orb-tube-run-h ${frantic ? 1 : 1.8}s linear infinite`,
                }
          }
        />
      )}
    </div>
  )
}

function PrizeGem({
  icon,
  accent,
  lit,
  delay,
}: {
  icon: string
  accent: string
  lit: boolean
  delay: number
}) {
  return (
    <div
      className="flex items-center justify-center w-[24px] h-[24px] md:w-[28px] md:h-[28px] rounded-lg text-[13px] md:text-[15px] transition-all duration-300"
      style={{
        border: `1px solid ${lit ? accent : 'rgba(80,64,110,0.45)'}`,
        background: lit ? `${accent}18` : 'rgba(8,5,14,0.7)',
        boxShadow: lit ? `0 0 12px ${accent}55, inset 0 0 8px ${accent}15` : undefined,
        animation: lit ? `orb-gem-pulse 2s ease-in-out infinite` : undefined,
        animationDelay: `${delay}s`,
      }}
    >
      {icon}
    </div>
  )
}

interface OrbSideRailProps {
  side: 'left' | 'right'
  active: boolean
  frantic?: boolean
  className?: string
}

export function OrbSideRail({
  side,
  active,
  frantic = false,
  className = '',
}: OrbSideRailProps) {
  const label = side === 'left' ? 'ORBE' : 'PREMIO'
  const prizes = side === 'left' ? ORB_PRIZES : [...ORB_PRIZES].reverse()

  return (
    <div
      className={[
        'relative hidden sm:flex flex-shrink-0 flex-col items-center justify-center',
        'w-[44px] md:w-[52px] self-stretch min-h-[260px] md:min-h-[300px]',
        className,
      ].join(' ')}
      aria-hidden
    >
      <style>{`
        @keyframes orb-tube-run {
          0% { top: -45%; opacity: 0.35; }
          100% { top: 108%; opacity: 0.35; }
        }
        @keyframes orb-tube-run-h {
          0% { left: -40%; }
          100% { left: 110%; }
        }
        @keyframes orb-gem-pulse {
          0%, 100% { filter: brightness(0.9); transform: scale(1); }
          50% { filter: brightness(1.2); transform: scale(1.06); }
        }
        @keyframes orb-rail-flicker {
          0%, 100% { opacity: 1; }
          94% { opacity: 0.88; }
          95% { opacity: 1; }
        }
      `}</style>

      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          border: '1px solid rgba(255,215,0,0.42)',
          background:
            'linear-gradient(180deg, rgba(255,215,0,0.1) 0%, rgba(8,5,14,0.95) 40%, rgba(179,136,255,0.1) 100%)',
          boxShadow:
            'inset 0 0 20px rgba(179,136,255,0.14), 0 0 24px rgba(255,215,0,0.1), 0 0 40px rgba(0,229,255,0.06)',
        }}
      />

      <div className="relative z-[1] flex flex-col items-center justify-between h-full py-3 md:py-4 gap-2 w-full px-1">
        <span
          className="font-display font-black text-[8px] md:text-[9px] tracking-[0.12em]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            color: '#ffd700',
            textShadow:
              '0 0 10px rgba(255,215,0,0.8), 0 0 18px rgba(179,136,255,0.4)',
            animation: active ? 'orb-rail-flicker 3.5s ease-in-out infinite' : undefined,
          }}
        >
          ★ {label}
        </span>

        <div className="flex flex-col items-center gap-2 flex-1 justify-center w-full">
          <NeonTube active={active} frantic={frantic} vertical />
          <div className="flex flex-col gap-1.5 md:gap-2 py-0.5">
            {prizes.map((p, i) => (
              <PrizeGem
                key={`${side}-${i}`}
                icon={p.icon}
                accent={p.accent}
                lit={active}
                delay={i * 0.35 + (side === 'right' ? 0.15 : 0)}
              />
            ))}
          </div>
          <NeonTube active={active} frantic={frantic} vertical />
        </div>

        <span
          className="font-mono text-[7px] md:text-[8px] tracking-[0.18em]"
          style={{
            color: 'rgba(179,136,255,0.9)',
            textShadow: '0 0 8px rgba(179,136,255,0.5)',
          }}
        >
          MYSTIKA
        </span>
      </div>
    </div>
  )
}

interface OrbLedBarProps {
  active: boolean
  frantic?: boolean
  position: 'top' | 'bottom'
}

export function OrbLedBar({
  active,
  frantic = false,
  position,
}: OrbLedBarProps) {
  const label = position === 'top' ? 'ORBE' : 'PREMIO'

  return (
    <div
      className="relative w-full h-[36px] sm:h-[40px] flex sm:hidden items-center rounded-xl overflow-hidden flex-shrink-0 px-2 gap-2"
      aria-hidden
    >
      <style>{`
        @keyframes orb-tube-run-h {
          0% { left: -40%; }
          100% { left: 110%; }
        }
      `}</style>
      <div
        className="absolute inset-0"
        style={{
          border: '1px solid rgba(255,215,0,0.38)',
          background:
            'linear-gradient(90deg, rgba(255,215,0,0.12), rgba(8,5,14,0.96) 45%, rgba(179,136,255,0.12))',
          boxShadow: 'inset 0 0 12px rgba(179,136,255,0.1)',
        }}
      />
      <span
        className="relative z-[1] font-display font-black text-[8px] tracking-[0.15em] shrink-0 text-[#ffd700]"
        style={{ textShadow: '0 0 8px rgba(255,215,0,0.65)' }}
      >
        ★ {label}
      </span>
      <div className="relative z-[1] flex flex-1 items-center gap-1.5 px-1">
        <NeonTube active={active} frantic={frantic} vertical={false} />
        <div className="flex gap-1">
          {ORB_PRIZES.map((p, i) => (
            <PrizeGem
              key={i}
              icon={p.icon}
              accent={p.accent}
              lit={active}
              delay={i * 0.2}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
