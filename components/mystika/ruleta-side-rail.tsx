'use client'

interface RuletaSideRailProps {
  side: 'left' | 'right'
  active: boolean
  frantic?: boolean
  currentAttempt: number
  spinsCompleted: number
  thirdBonusReady: boolean
  className?: string
}

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
        vertical ? 'w-[5px] md:w-[6px] flex-1 min-h-[80px] max-h-[140px]' : 'h-[4px] flex-1 min-w-[60px]',
      ].join(' ')}
      style={{
        background: active
          ? 'linear-gradient(180deg, rgba(40,32,55,0.9), rgba(20,14,32,0.95))'
          : 'rgba(20,14,32,0.8)',
        boxShadow: active
          ? 'inset 0 0 6px rgba(0,0,0,0.6), 0 0 10px rgba(179,136,255,0.2)'
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
                  height: '35%',
                  background:
                    'linear-gradient(180deg, transparent, #ffd700, #00e5ff, #b388ff, transparent)',
                  boxShadow: '0 0 12px rgba(255,215,0,0.8), 0 0 20px rgba(0,229,255,0.4)',
                  animation: `ruleta-tube-run ${frantic ? 1.4 : 2.4}s linear infinite`,
                }
              : {
                  top: 0,
                  bottom: 0,
                  width: '28%',
                  background:
                    'linear-gradient(90deg, transparent, #ffd700, #00e5ff, transparent)',
                  boxShadow: '0 0 10px rgba(255,215,0,0.7)',
                  animation: `ruleta-tube-run-h ${frantic ? 1.2 : 2}s linear infinite`,
                }
          }
        />
      )}
    </div>
  )
}

function VueltaTick({
  n,
  state,
}: {
  n: number
  state: 'done' | 'current' | 'pending' | 'bonus'
}) {
  const styles = {
    done: {
      border: 'rgba(179,136,255,0.55)',
      bg: 'rgba(179,136,255,0.15)',
      color: '#b388ff',
      glow: '0 0 10px rgba(179,136,255,0.35)',
    },
    current: {
      border: 'rgba(0,255,157,0.75)',
      bg: 'rgba(0,255,157,0.18)',
      color: '#00ff9d',
      glow: '0 0 14px rgba(0,255,157,0.5)',
    },
    bonus: {
      border: 'rgba(255,215,0,0.85)',
      bg: 'rgba(255,215,0,0.18)',
      color: '#ffd700',
      glow: '0 0 14px rgba(255,215,0,0.55)',
    },
    pending: {
      border: 'rgba(80,64,110,0.5)',
      bg: 'rgba(12,8,20,0.6)',
      color: 'rgba(140,120,170,0.7)',
      glow: 'none',
    },
  }[state]

  return (
    <div
      className="flex items-center justify-center w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-lg font-mono font-black transition-all duration-300"
      style={{
        fontSize: 'clamp(14px, 3.5vw, 16px)',
        border: `1px solid ${styles.border}`,
        background: styles.bg,
        color: styles.color,
        boxShadow: styles.glow,
      }}
    >
      {n}
    </div>
  )
}

/** Columna lateral — ruleta (sin bombillas de casino) */
export function RuletaSideRail({
  side,
  active,
  frantic = false,
  currentAttempt,
  spinsCompleted,
  thirdBonusReady,
  className = '',
}: RuletaSideRailProps) {
  const isLeft = side === 'left'
  const label = isLeft ? 'RULETA' : 'SUERTE'

  const tickState = (n: number): 'done' | 'current' | 'pending' | 'bonus' => {
    if (n === 3 && thirdBonusReady) return 'bonus'
    if (spinsCompleted >= n) return 'done'
    if (currentAttempt === n) return 'current'
    return 'pending'
  }

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
        @keyframes ruleta-tube-run {
          0% { top: -40%; opacity: 0.3; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 105%; opacity: 0.3; }
        }
        @keyframes ruleta-tube-run-h {
          0% { left: -35%; opacity: 0.3; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 108%; opacity: 0.3; }
        }
        @keyframes ruleta-rail-neon-flicker {
          0%, 100% { opacity: 1; }
          93% { opacity: 0.9; }
          94% { opacity: 1; }
        }
      `}</style>

      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          border: `1px solid ${active ? 'rgba(255,215,0,0.4)' : 'rgba(80,64,110,0.35)'}`,
          background:
            'linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(10,6,18,0.94) 42%, rgba(179,136,255,0.08) 100%)',
          boxShadow: active
            ? 'inset 0 0 16px rgba(179,136,255,0.12), 0 0 20px rgba(255,215,0,0.08)'
            : 'inset 0 0 8px rgba(0,0,0,0.4)',
        }}
      />

      <div className="relative z-[1] flex flex-col items-center justify-between h-full py-3 md:py-4 gap-2 w-full px-1">
        <span
          className="font-display font-black text-[10px] md:text-[11px] tracking-[0.12em]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            color: active ? '#00ff9d' : 'rgba(140,120,170,0.6)',
            textShadow: active
              ? '0 0 10px rgba(0,255,157,0.8), 0 0 18px rgba(0,255,157,0.4)'
              : undefined,
            animation: active ? 'ruleta-rail-neon-flicker 4s ease-in-out infinite' : undefined,
          }}
        >
          ★ {label}
        </span>

        <div className="flex flex-col items-center gap-2 flex-1 justify-center w-full">
          <NeonTube active={active} frantic={frantic} vertical />
          <div className="flex flex-col gap-1.5 md:gap-2 py-1">
            {[1, 2, 3].map((n) => (
              <VueltaTick key={n} n={n} state={tickState(n)} />
            ))}
          </div>
          <NeonTube active={active} frantic={frantic} vertical />
        </div>

        <span
          className="font-mono text-[7px] md:text-[8px] tracking-[0.18em]"
          style={{
            color: active ? 'rgba(179,136,255,0.9)' : 'rgba(100,85,130,0.5)',
            textShadow: active ? '0 0 6px rgba(179,136,255,0.5)' : undefined,
          }}
        >
          MYSTIKA
        </span>
      </div>
    </div>
  )
}

interface RuletaLedBarProps {
  active: boolean
  frantic?: boolean
  position: 'top' | 'bottom'
  currentAttempt: number
  spinsCompleted: number
  thirdBonusReady: boolean
}

/** Franja horizontal móvil — mismo estilo que el lateral */
export function RuletaLedBar({
  active,
  frantic = false,
  position,
  currentAttempt,
  spinsCompleted,
  thirdBonusReady,
}: RuletaLedBarProps) {
  const label = position === 'top' ? 'RULETA' : 'SUERTE'

  const tickState = (n: number): 'done' | 'current' | 'pending' | 'bonus' => {
    if (n === 3 && thirdBonusReady) return 'bonus'
    if (spinsCompleted >= n) return 'done'
    if (currentAttempt === n) return 'current'
    return 'pending'
  }

  return (
    <div
      className="relative w-full h-[36px] sm:h-[40px] flex sm:hidden items-center rounded-xl overflow-hidden flex-shrink-0 px-2 gap-2"
      aria-hidden
    >
      <style>{`
        @keyframes ruleta-tube-run-h {
          0% { left: -35%; opacity: 0.3; }
          100% { left: 108%; opacity: 0.3; }
        }
      `}</style>
      <div
        className="absolute inset-0"
        style={{
          border: `1px solid ${active ? 'rgba(255,215,0,0.35)' : 'rgba(80,64,110,0.3)'}`,
          background:
            'linear-gradient(90deg, rgba(255,215,0,0.1), rgba(10,6,18,0.96) 50%, rgba(179,136,255,0.1))',
        }}
      />
      <span
        className="relative z-[1] font-display font-black text-[8px] tracking-[0.15em] shrink-0"
        style={{
          color: active ? '#ffd700' : 'rgba(140,120,170,0.6)',
          textShadow: active ? '0 0 8px rgba(255,215,0,0.6)' : undefined,
        }}
      >
        {label}
      </span>
      <div className="relative z-[1] flex flex-1 items-center gap-2 px-1">
        <NeonTube active={active} frantic={frantic} vertical={false} />
        <div className="flex gap-1">
          {[1, 2, 3].map((n) => (
            <VueltaTick key={n} n={n} state={tickState(n)} />
          ))}
        </div>
      </div>
    </div>
  )
}
