'use client'

export type StepLightVariant = 'idle' | 'active' | 'done' | 'bonus'

interface RuletaStepLightsProps {
  variant: StepLightVariant
}

const THEME: Record<
  StepLightVariant,
  {
    border: string
    neon: string
    neonSoft: string
    accent: string
    washTop: string
    washBottom: string
    pulse: boolean
  }
> = {
  idle: {
    border: 'rgba(120,100,150,0.45)',
    neon: 'rgba(179,136,255,0.2)',
    neonSoft: 'rgba(179,136,255,0.08)',
    accent: '#9a7ec8',
    washTop: 'rgba(179,136,255,0.06)',
    washBottom: 'rgba(80,64,110,0.08)',
    pulse: false,
  },
  active: {
    border: 'rgba(255,215,0,0.65)',
    neon: 'rgba(255,215,0,0.45)',
    neonSoft: 'rgba(255,215,0,0.15)',
    accent: '#ffd700',
    washTop: 'rgba(255,215,0,0.14)',
    washBottom: 'rgba(255,45,120,0.08)',
    pulse: true,
  },
  done: {
    border: 'rgba(179,136,255,0.55)',
    neon: 'rgba(179,136,255,0.35)',
    neonSoft: 'rgba(0,255,157,0.1)',
    accent: '#b388ff',
    washTop: 'rgba(179,136,255,0.1)',
    washBottom: 'rgba(0,255,157,0.06)',
    pulse: false,
  },
  bonus: {
    border: 'rgba(255,215,0,0.75)',
    neon: 'rgba(255,215,0,0.55)',
    neonSoft: 'rgba(255,107,157,0.18)',
    accent: '#ffd700',
    washTop: 'rgba(255,215,0,0.18)',
    washBottom: 'rgba(255,107,157,0.1)',
    pulse: true,
  },
}

/** Neón en bordes y fondo; el centro oscurecido para que el texto se lea bien */
export function RuletaStepLights({ variant }: RuletaStepLightsProps) {
  const t = THEME[variant]

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
      aria-hidden
    >
      <style>{`
        @keyframes ruleta-step-neon-pulse {
          0%, 100% { opacity: 0.75; filter: brightness(0.95); }
          50% { opacity: 1; filter: brightness(1.15); }
        }
        @keyframes ruleta-step-neon-flicker {
          0%, 100% { opacity: 1; }
          93% { opacity: 1; }
          94% { opacity: 0.88; }
          95% { opacity: 1; }
        }
      `}</style>

      {/* Lavado neón en bordes (arriba / abajo / laterales) */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `
            radial-gradient(ellipse 100% 55% at 50% 0%, ${t.washTop} 0%, transparent 58%),
            radial-gradient(ellipse 90% 45% at 50% 100%, ${t.washBottom} 0%, transparent 52%),
            linear-gradient(90deg, ${t.neonSoft} 0%, transparent 18%, transparent 82%, ${t.neonSoft} 100%)
          `,
          animation: t.pulse ? 'ruleta-step-neon-pulse 3s ease-in-out infinite' : undefined,
        }}
      />

      {/* Placa oscura central — legibilidad */}
      <div
        className="absolute inset-[2px] rounded-[10px]"
        style={{
          background:
            'radial-gradient(ellipse 92% 78% at 50% 48%, rgba(6,4,12,0.94) 0%, rgba(8,5,14,0.82) 50%, rgba(8,5,14,0.45) 100%)',
        }}
      />

      {/* Borde neón + glow exterior simulado por inset/outset en capas */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          boxShadow: `
            inset 0 0 0 1px ${t.border},
            inset 0 0 18px ${t.neonSoft},
            inset 0 1px 0 rgba(255,255,255,0.06)
          `,
          animation: t.pulse
            ? 'ruleta-step-neon-flicker 4s ease-in-out infinite'
            : undefined,
        }}
      />

      {/* Líneas neón horizontales tipo marquesina */}
      <div
        className="absolute left-[8%] right-[8%] top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
          boxShadow: `0 0 8px ${t.neon}, 0 0 14px ${t.neonSoft}`,
          opacity: variant === 'idle' ? 0.35 : 0.85,
        }}
      />
      <div
        className="absolute left-[8%] right-[8%] bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${t.accent}99, transparent)`,
          boxShadow: `0 0 6px ${t.neonSoft}`,
          opacity: variant === 'idle' ? 0.25 : 0.65,
        }}
      />

      {/* Rivets neón en esquinas */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <div
          key={corner}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            top: corner.startsWith('t') ? 5 : undefined,
            bottom: corner.startsWith('b') ? 5 : undefined,
            left: corner.endsWith('l') ? 5 : undefined,
            right: corner.endsWith('r') ? 5 : undefined,
            background: `radial-gradient(circle, #fff 0%, ${t.accent} 55%, ${t.accent}88 100%)`,
            boxShadow: `0 0 8px ${t.neon}, 0 0 14px ${t.neonSoft}`,
            opacity: variant === 'idle' ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  )
}

/** Sombra neón exterior para la tarjeta (va en el contenedor padre) */
export function ruletaStepNeonShadow(variant: StepLightVariant): string | undefined {
  const t = THEME[variant]
  if (variant === 'idle') {
    return `0 0 14px ${t.neonSoft}, 0 0 1px ${t.border}`
  }
  if (variant === 'active' || variant === 'bonus') {
    return `0 0 20px ${t.neon}, 0 0 36px ${t.neonSoft}, 0 0 8px ${t.neon}`
  }
  return `0 0 16px ${t.neon}, 0 0 28px ${t.neonSoft}`
}
