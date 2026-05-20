'use client'

import { useState, useEffect, useRef } from 'react'
import { DevTestButton } from './dev-test-button'

interface JackpotSectionProps {
  onRequestPay: (productId: string, title: string, description: string, price: number) => void
  /** Un giro pagado pendiente: se consume al tocar GIRAR. */
  hasFreeSpin?: boolean
  onConsumeFreeSpin?: () => void
  devTestEnabled?: boolean
}

const REEL_SYMBOLS = ['💎', '🔮', '⭐', '💜', '🌙', '🥠', '🎯', '🌟']

/** Probabilidad real del triple luna ($1,000) en `pickResult`. */
const JACKPOT_WIN_PERCENT = 2
const JACKPOT_ODDS_ONE_IN = 50

type ResultConfig = {
  symbols: [string, string, string]
  title: string
  message: string
  extra: string
  color: string
  isTop: boolean
  isJackpot?: boolean
}

const RESULTS: ResultConfig[] = [
  {
    symbols: ['💎', '💎', '🔮'],
    title: '💎 ¡DOS DIAMANTES!',
    message: 'El portal detectó una energía extraordinaria en vos. Los diamantes casi se alinearon — una señal de que la fortuna grande está muy cerca.',
    extra: 'El universo te dice: la próxima oportunidad es la tuya.',
    color: '#b388ff',
    isTop: false,
  },
  {
    symbols: ['🔮', '🔮', '🔮'],
    title: '🔮 TRIPLE ORBE',
    message: 'Tres orbes en perfecta sincronía. El cosmos abrió un portal exclusivo para vos. Tu energía mística está en su punto más alto.',
    extra: 'Momento ideal para tomar decisiones importantes.',
    color: '#b388ff',
    isTop: true,
  },
  {
    symbols: ['⭐', '💜', '🌙'],
    title: '🌙 ALINEACIÓN CÓSMICA',
    message: 'Las estrellas, el amor y la luna se encontraron en tu giro. Una tríada de buena suerte que se activa en tu vida ahora mismo.',
    extra: 'Lo que estás buscando está más cerca de lo que creés.',
    color: '#ffd700',
    isTop: false,
  },
  {
    symbols: ['💜', '💜', '💜'],
    title: '💜 TRIPLE AMOR',
    message: 'Tres corazones púrpura. El universo confirma que estás en un ciclo de amor y abundancia emocional sin precedentes.',
    extra: 'Las personas correctas llegan cuando menos lo esperás.',
    color: '#ff6b9d',
    isTop: true,
  },
  {
    symbols: ['🥠', '🌟', '🔮'],
    title: '🥠 FORTUNA DESPERTADA',
    message: 'La galleta mística, la estrella y el orbe se combinaron. Tu mensaje del destino es claro: algo grande se aproxima en tu camino.',
    extra: 'Confiá en el proceso. El timing es perfecto.',
    color: '#ffd700',
    isTop: false,
  },
  {
    symbols: ['🌟', '🌟', '💎'],
    title: '🌟 ESTRELLAS Y DIAMANTE',
    message: 'Dos estrellas y un diamante. Una combinación que anuncia logros materiales y reconocimiento en tu entorno próximamente.',
    extra: 'Tu esfuerzo está a punto de ser recompensado.',
    color: '#00ff9d',
    isTop: false,
  },
  {
    symbols: ['🎯', '💜', '⭐'],
    title: '🎯 DESTINO MARCADO',
    message: 'El objetivo, el amor y la estrella. El universo te muestra que vas exactamente en la dirección correcta. No frenes.',
    extra: 'Tu intuición nunca te falló. Seguí escuchándola.',
    color: '#b388ff',
    isTop: false,
  },
  {
    symbols: ['🌙', '🌙', '🌙'],
    title: '🌌 TRIPLE LUNA — JACKPOT',
    message: '¡Tres lunas! La combinación más rara del portal. El jackpot de $1,000 USD fue activado. El equipo de Mystika se contactará a la brevedad para coordinar tu premio.',
    extra: '✦ Sos parte de los elegidos del portal ✦',
    color: '#ffd700',
    isTop: true,
    isJackpot: true,
  },
]

function buildJackpotOddsMessage(spinNumber: number, wonJackpot: boolean): string {
  if (wonJackpot) {
    return `En el giro #${spinNumber} tenías 1 oportunidad entre ${JACKPOT_ODDS_ONE_IN} de ganar $1,000 USD (${JACKPOT_WIN_PERCENT}%). ¡El portal te eligió!`
  }
  return `En el giro #${spinNumber} tuviste 1 oportunidad entre ${JACKPOT_ODDS_ONE_IN} de ganar $1,000 USD (${JACKPOT_WIN_PERCENT}%). Esta vez no fue el jackpot mayor.`
}

function buildJackpotOddsSessionLine(sessionSpins: number): string {
  return `En esta sesión: ${sessionSpins} giro${sessionSpins === 1 ? '' : 's'} = ${sessionSpins} chance${sessionSpins === 1 ? '' : 's'} independiente${sessionSpins === 1 ? '' : 's'} de 1 en ${JACKPOT_ODDS_ONE_IN} para el premio de $1,000.`
}

// Weighted random: jackpot (triple luna) ~2%, tops ~15%, rest ~83%
function pickResult(): ResultConfig {
  const r = Math.random() * 100
  if (r < 2) return RESULTS[7]           // Triple Luna JACKPOT
  if (r < 8) return RESULTS[1]           // Triple Orbe
  if (r < 14) return RESULTS[3]          // Triple Amor
  if (r < 25) return RESULTS[0]          // Dos Diamantes
  if (r < 40) return RESULTS[5]          // Estrellas y Diamante
  if (r < 55) return RESULTS[2]          // Alineación Cósmica
  if (r < 72) return RESULTS[4]          // Fortuna Despertada
  return RESULTS[6]                       // Destino Marcado
}

// Spin animation: cycles through symbols rapidly then lands on target
function useReelSpin(target: string, spinning: boolean, delay: number) {
  const [display, setDisplay] = useState('❓')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!spinning) {
      setDisplay('❓')
      return
    }
    let idx = 0
    const start = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setDisplay(REEL_SYMBOLS[idx % REEL_SYMBOLS.length])
        idx++
      }, 80)
    }, delay)

    return () => {
      clearTimeout(start)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [spinning, delay])

  useEffect(() => {
    if (!spinning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [spinning])

  return { display, setDisplay }
}

export function JackpotSection({
  onRequestPay,
  hasFreeSpin = false,
  onConsumeFreeSpin,
  devTestEnabled,
}: JackpotSectionProps) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [result, setResult] = useState<ResultConfig | null>(null)
  const [stoppedReels, setStoppedReels] = useState([false, false, false])
  const [spinCount, setSpinCount] = useState(0)
  const [showOddsEvent, setShowOddsEvent] = useState(false)

  const spinning = phase === 'spinning'

  const reel0 = useReelSpin(result?.symbols[0] ?? '❓', spinning, 0)
  const reel1 = useReelSpin(result?.symbols[1] ?? '❓', spinning, 180)
  const reel2 = useReelSpin(result?.symbols[2] ?? '❓', spinning, 360)

  const startSpin = () => {
    const picked = pickResult()
    setShowOddsEvent(false)
    setResult(picked)
    setStoppedReels([false, false, false])
    setPhase('spinning')
    setSpinCount((n) => n + 1)

    // Stop reels one by one
    setTimeout(() => {
      reel0.setDisplay(picked.symbols[0])
      setStoppedReels([true, false, false])
    }, 1400)
    setTimeout(() => {
      reel1.setDisplay(picked.symbols[1])
      setStoppedReels([true, true, false])
    }, 2000)
    setTimeout(() => {
      reel2.setDisplay(picked.symbols[2])
      setStoppedReels([true, true, true])
      setPhase('result')
      window.setTimeout(() => setShowOddsEvent(true), 120)
    }, 2600)
  }

  const handlePlay = () => {
    if (hasFreeSpin) {
      onConsumeFreeSpin?.()
      startSpin()
      return
    }
    onRequestPay(
      'mystika-jackpot',
      'JACKPOT MYSTIKA — $1,000',
      'Girá los tres carretes y descubrí si el portal te elige. Jackpot de $1,000 USD disponible.',
      1,
    )
  }

  const handleReset = () => {
    setPhase('idle')
    setResult(null)
    setShowOddsEvent(false)
    setStoppedReels([false, false, false])
    reel0.setDisplay('❓')
    reel1.setDisplay('❓')
    reel2.setDisplay('❓')
  }

  const reels = [
    { ...reel0, stopped: stoppedReels[0] },
    { ...reel1, stopped: stoppedReels[1] },
    { ...reel2, stopped: stoppedReels[2] },
  ]

  return (
    <div className="animate-[fadeup_0.4s_ease]">

      {/* Header */}
      <div className="text-center py-1.5 pb-5">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-3">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          PORTAL DEL JACKPOT
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-4"
          style={{ fontSize: 'clamp(36px,8vw,58px)' }}
        >
          Ganate{' '}
          <span
            className="text-[#00ff9d]"
            style={{ textShadow: '0 0 35px rgba(0,255,157,.75)' }}
          >
            $1,000 USD
          </span>
        </h2>
        <p className="text-[15px] text-[var(--txt2)] max-w-[420px] mx-auto leading-[1.8] font-light">
          Girá los tres carretes del portal. Alineá los símbolos y el jackpot es tuyo.
        </p>
      </div>

      {/* Jackpot prize display */}
      <div
        className="flex items-center justify-between px-7 py-5 rounded-2xl mb-8 mx-auto max-w-[480px]"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,157,0.18) 0%, rgba(10,6,18,0.95) 100%)',
          border: '2px solid rgba(0,255,157,0.5)',
          boxShadow: '0 0 40px rgba(0,255,157,0.25), inset 0 0 30px rgba(0,255,157,0.05)',
        }}
      >
        <div>
          <div className="font-mono text-[11px] tracking-[4px] text-[var(--green)] mb-1.5">JACKPOT DISPONIBLE</div>
          <div
            className="font-display font-black text-[48px] leading-none"
            style={{ color: '#00ff9d', textShadow: '0 0 30px rgba(0,255,157,0.8), 0 0 60px rgba(0,255,157,0.4)' }}
          >
            $1,000
          </div>
          <div className="font-mono text-[11px] text-[var(--txt3)] tracking-[3px]">USD · PREMIO MAYOR</div>
        </div>
        <div className="text-right">
          <div
            className="text-7xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,157,0.8))' }}
          >
            💵
          </div>
        </div>
      </div>

      {/* Slot Machine */}
      <div
        className="rounded-2xl p-8 mb-8 mx-auto max-w-[480px]"
        style={{
          background: 'linear-gradient(160deg, #120a22 0%, #0a0612 100%)',
          border: '2px solid rgba(179,136,255,0.35)',
          boxShadow: '0 0 60px rgba(179,136,255,0.15), inset 0 0 40px rgba(179,136,255,0.05)',
        }}
      >
        {/* Reels */}
        <div className="flex gap-4 justify-center mb-6">
          {reels.map((reel, i) => (
            <div
              key={i}
              className="flex-1 max-w-[120px] aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: reel.stopped && phase === 'result'
                  ? 'rgba(179,136,255,0.15)'
                  : 'rgba(255,255,255,0.05)',
                border: reel.stopped && phase === 'result'
                  ? '3px solid rgba(179,136,255,0.55)'
                  : '2px solid rgba(255,255,255,0.1)',
                boxShadow: reel.stopped && phase === 'result'
                  ? '0 0 35px rgba(179,136,255,0.35), inset 0 0 20px rgba(179,136,255,0.1)'
                  : '0 0 15px rgba(179,136,255,0.08)',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Blur when spinning */}
              <span
                className="text-6xl select-none"
                style={{
                  filter: spinning && !reel.stopped ? 'blur(2px)' : 'none',
                  transition: reel.stopped ? 'filter 0.2s ease' : 'none',
                  animation: spinning && !reel.stopped ? 'pulse 0.3s ease-in-out infinite' : undefined,
                }}
              >
                {reel.display}
              </span>
              {/* Stop flash */}
              {reel.stopped && phase === 'spinning' && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ animation: 'ping 0.5s ease-out forwards', background: 'rgba(179,136,255,0.4)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Payline indicator */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.5))' }} />
          <span className="font-mono text-[12px] sm:text-[13px] tracking-[4px] text-[var(--gold3)]">
            LÍNEA DE PAGO
          </span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.5))' }} />
        </div>

        {/* Symbol guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { sym: '🌙🌙🌙', label: '$1,000', color: '#ffd700' },
            { sym: '🔮🔮🔮', label: 'PREMIO', color: '#b388ff' },
            { sym: '💜💜💜', label: 'PREMIO', color: '#ff6b9d' },
            { sym: '💎💎?', label: 'BONUS', color: '#00ff9d' },
          ].map((g, i) => (
            <div
              key={i}
              className="text-center py-3.5 px-2 sm:py-4 rounded-xl min-h-[88px] flex flex-col items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="text-[20px] sm:text-[22px] mb-2 leading-none tracking-tight">
                {g.sym}
              </div>
              <div
                className="font-mono text-[11px] sm:text-[12px] font-black tracking-[1px]"
                style={{ color: g.color }}
              >
                {g.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA / Spinning state */}
        {phase === 'idle' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePlay}
              className="flex-1 py-5 rounded-2xl font-mono text-[16px] tracking-[4px] font-black transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
              style={{
                background: hasFreeSpin
                  ? 'linear-gradient(135deg, #b388ff, #d4b8ff)'
                  : 'linear-gradient(135deg, #00cc7a 0%, #00ff9d 100%)',
                color: '#0a0612',
                boxShadow: hasFreeSpin
                  ? '0 8px 40px rgba(179,136,255,0.45)'
                  : '0 8px 40px rgba(0,255,157,0.5), 0 0 20px rgba(0,255,157,0.3)',
              }}
            >
              <span className="text-3xl">🎰</span>
              <span>{hasFreeSpin ? 'GIRAR (pago listo)' : 'GIRAR — $1'}</span>
            </button>
            {devTestEnabled && (
              <DevTestButton onClick={startSpin} />
            )}
          </div>
        )}

        {phase === 'spinning' && (
          <div className="w-full py-5 rounded-2xl flex items-center justify-center gap-4"
            style={{ background: 'rgba(179,136,255,0.1)', border: '2px solid rgba(179,136,255,0.3)' }}
          >
            <div className="w-6 h-6 border-3 border-[var(--mystik)] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[14px] tracking-[3px] text-[var(--mystik)]">GIRANDO EL PORTAL...</span>
          </div>
        )}

        {phase === 'result' && (
          <button
            onClick={handleReset}
            className="w-full py-4 rounded-2xl font-mono text-[14px] tracking-[3px] transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.15)',
              color: 'var(--txt2)',
            }}
          >
            ↺ GIRAR DE NUEVO
          </button>
        )}
      </div>

      {/* Result card */}
      {phase === 'result' && result && (
        <div
          className="animate-[fadeup_0.5s_ease] rounded-2xl p-7 mx-auto max-w-[480px] relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${result.color}20 0%, rgba(10,6,18,0.96) 100%)`,
            border: `2px solid ${result.color}60`,
            boxShadow: `0 0 50px ${result.color}30, inset 0 0 40px ${result.color}08`,
          }}
        >
          {/* Top glow */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, transparent, ${result.color}, transparent)` }}
          />

          {/* Symbols recap */}
          <div className="flex justify-center gap-3 mb-4">
            {result.symbols.map((s, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: `${result.color}18`,
                  border: `2px solid ${result.color}50`,
                  boxShadow: `0 0 20px ${result.color}25`,
                }}
              >
                {s}
              </div>
            ))}
          </div>

          {/* Title */}
          <div
            className="font-display font-black text-[26px] tracking-[1px] text-center mb-3"
            style={{ color: result.color, textShadow: `0 0 25px ${result.color}70` }}
          >
            {result.title}
          </div>

          {/* Message */}
          <p className="text-[16px] text-[var(--txt)] leading-[1.8] text-center mb-4">
            {result.message}
          </p>

          {/* Extra */}
          <div
            className="text-center py-3 px-4 rounded-xl mb-4"
            style={{ background: `${result.color}12`, border: `1px solid ${result.color}30` }}
          >
            <p className="text-[14px] font-medium italic" style={{ color: result.color }}>
              {result.extra}
            </p>
          </div>

          {/* Odds event — probabilidad del jackpot $1,000 en este giro */}
          {showOddsEvent && (
            <div
              className="animate-[fadeup_0.45s_ease] rounded-xl p-4 text-left"
              style={{
                background: result.isJackpot
                  ? 'rgba(255,215,0,0.12)'
                  : 'rgba(0,255,157,0.08)',
                border: result.isJackpot
                  ? '2px solid rgba(255,215,0,0.45)'
                  : '2px solid rgba(0,255,157,0.28)',
                boxShadow: result.isJackpot
                  ? '0 0 28px rgba(255,215,0,0.2)'
                  : '0 0 20px rgba(0,255,157,0.12)',
              }}
            >
              <div className="font-mono text-[11px] sm:text-[12px] tracking-[3px] text-[var(--gold3)] mb-2.5">
                📊 REGISTRO DE PROBABILIDAD — JACKPOT $1,000
              </div>
              <p className="text-[15px] sm:text-[16px] text-[var(--txt)] leading-[1.75] mb-2.5">
                {buildJackpotOddsMessage(spinCount, Boolean(result.isJackpot))}
              </p>
              <p className="text-[13px] sm:text-[14px] text-[var(--txt3)] font-mono leading-relaxed">
                {buildJackpotOddsSessionLine(spinCount)}
              </p>
              <div className="mt-3.5 flex items-center gap-2.5">
                <div
                  className="h-2.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${JACKPOT_WIN_PERCENT}%`,
                      background: result.isJackpot ? '#ffd700' : '#00ff9d',
                      boxShadow: result.isJackpot
                        ? '0 0 12px rgba(255,215,0,0.6)'
                        : '0 0 10px rgba(0,255,157,0.5)',
                    }}
                  />
                </div>
                <span
                  className="font-mono text-[12px] sm:text-[13px] font-black shrink-0"
                  style={{ color: result.isJackpot ? '#ffd700' : '#00ff9d' }}
                >
                  {JACKPOT_WIN_PERCENT}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Odds disclaimer */}
      <p className="text-center text-[13px] sm:text-[14px] text-[var(--txt2)] mt-8 max-w-[520px] mx-auto leading-[1.85] px-2">
        <span className="text-[var(--gold3)]">✦</span> Cada giro:{' '}
        <span className="font-mono font-black text-[#00ff9d]">
          1 en {JACKPOT_ODDS_ONE_IN} ({JACKPOT_WIN_PERCENT}%)
        </span>{' '}
        de alinear <span className="text-[18px] leading-none align-middle">🌙🌙🌙</span> y ganar{' '}
        <span className="font-black text-[#ffd700]">$1,000 USD</span>. Probabilidades independientes por giro.
      </p>
    </div>
  )
}
