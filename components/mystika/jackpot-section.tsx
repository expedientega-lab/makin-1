'use client'

import { useState, useEffect, useCallback } from 'react'
import { DevTestButton } from './dev-test-button'
import { OrbMarqueeLights } from './orb-marquee-lights'
import { JackpotReel } from './jackpot-reel'
import { JackpotLiveFeed } from './jackpot-live-feed'
import { JackpotLiveFeedHeader, JackpotTopCompact } from './jackpot-premium-ui'
import { authorizeGameAction, reconcilePaidSession } from '@/lib/game-authorize-client'
import { isLocalDevHost } from '@/lib/is-local-dev'
import {
  JACKPOT_FIRST_SPIN_WIN,
  JACKPOT_SCRIPTED,
  JACKPOT_TOTAL_SPINS,
  persistJackpotSession,
  readJackpotSessionOrderId,
  readJackpotSessionPaid,
  readJackpotSpinsCompleted,
  readJackpotWinnings,
  resetJackpotSession,
  unlockJackpotSession,
  type JackpotScriptedOutcome,
  type JackpotSpinPhase,
} from '@/lib/jackpot-session-data'

const LOCAL_JACKPOT_ORDER_ID = 'local-dev-jackpot'

interface JackpotSectionProps {
  onRequestPay: (productId: string, title: string, description: string, price: number) => void
  devTestEnabled?: boolean
}

function outcomeForSpin(
  phase: JackpotSpinPhase,
  accumulatedBeforeSecond: number,
): JackpotScriptedOutcome {
  const base = JACKPOT_SCRIPTED[phase]
  if (phase !== 2) return base
  return {
    ...base,
    message: `Segundo giro: sin línea ganadora. Se retiró tu acumulado de $${accumulatedBeforeSecond.toFixed(2)} USD.`,
  }
}

function JackpotAccumulationBar({
  winnings,
  spinsCompleted,
  sessionActive,
  cycleComplete,
  spinning,
}: {
  winnings: number
  spinsCompleted: number
  sessionActive: boolean
  cycleComplete: boolean
  spinning: boolean
}) {
  const max = JACKPOT_FIRST_SPIN_WIN
  const pct = Math.min(100, Math.max(0, (winnings / max) * 100))
  const galletaWon = cycleComplete
  const hasAccum = winnings > 0
  const drained =
    sessionActive && !galletaWon && winnings === 0 && spinsCompleted >= 2

  const fillColor = galletaWon
    ? 'linear-gradient(90deg, #ffd700, #ffb347, #ffd700)'
    : hasAccum
      ? 'linear-gradient(90deg, #00cc7a, #00ff9d, #7dffc4)'
      : drained
        ? 'linear-gradient(90deg, #ff6b6b, #ff8787)'
        : 'linear-gradient(90deg, rgba(179,136,255,0.35), rgba(179,136,255,0.15))'

  const borderColor = galletaWon
    ? 'rgba(255,215,0,0.55)'
    : hasAccum
      ? 'rgba(0,255,157,0.45)'
      : drained
        ? 'rgba(255,107,107,0.45)'
        : 'rgba(179,136,255,0.28)'

  const glow = galletaWon
    ? '0 0 24px rgba(255,215,0,0.25)'
    : hasAccum
      ? '0 0 22px rgba(0,255,157,0.22)'
      : 'none'

  return (
    <div
      className="relative z-[2] mb-3 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 overflow-hidden"
      style={{
        background:
          'linear-gradient(165deg, rgba(0,255,157,0.06) 0%, rgba(6,4,12,0.88) 45%, rgba(8,5,14,0.95) 100%)',
        border: `1px solid ${borderColor}`,
        boxShadow: glow ? `${glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.2em] text-[var(--mystik3)]">
          BARRA DE ACUMULACIÓN
        </span>
        <span
          className="font-mono text-[12px] sm:text-[14px] font-black tracking-[0.06em]"
          style={{
            color: galletaWon ? '#ffd700' : hasAccum ? '#00ff9d' : drained ? '#ff8787' : 'var(--txt3)',
          }}
        >
          {galletaWon
            ? '🥠 GALLETA DE LA FORTUNA'
            : hasAccum
              ? `$${winnings.toFixed(2)} USD`
              : drained
                ? '$0 · ACUMULADO RETIRADO'
                : sessionActive
                  ? '$0 · LISTO PARA SUMAR'
                  : '$0 · SIN SESIÓN'}
        </span>
      </div>

      <div
        className="relative h-4 sm:h-[18px] rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: galletaWon ? '100%' : `${pct}%`,
            background: fillColor,
            boxShadow: hasAccum || galletaWon ? '0 0 16px rgba(0,255,157,0.45)' : undefined,
            animation: spinning ? 'glow-pulse 0.9s ease-in-out infinite' : undefined,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.12) 6px, rgba(0,0,0,0.12) 12px)',
          }}
        />
        {!galletaWon && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-px h-[130%] pointer-events-none transition-[left] duration-700 ease-out"
            style={{
              left: `${pct}%`,
              background: hasAccum ? 'rgba(255,255,255,0.85)' : 'transparent',
              boxShadow: hasAccum ? '0 0 8px rgba(255,255,255,0.8)' : undefined,
            }}
          />
        )}
      </div>
    </div>
  )
}

export function JackpotSection({
  onRequestPay,
  devTestEnabled,
}: JackpotSectionProps) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [result, setResult] = useState<JackpotScriptedOutcome | null>(null)
  const [stoppedReels, setStoppedReels] = useState([false, false, false])
  const [spinsCompleted, setSpinsCompleted] = useState(readJackpotSpinsCompleted)
  const [winnings, setWinnings] = useState(readJackpotWinnings)
  const [sessionPaid, setSessionPaid] = useState(readJackpotSessionPaid)
  const [isLocalHost, setIsLocalHost] = useState(false)

  const spinning = phase === 'spinning'
  const cycleComplete = spinsCompleted >= JACKPOT_TOTAL_SPINS
  const currentSpin = Math.min(spinsCompleted + 1, JACKPOT_TOTAL_SPINS)
  const canSpinInSession = sessionPaid && !cycleComplete
  const needsPay = !sessionPaid && !cycleComplete

  const isLocalPlay = useCallback(
    () => Boolean(devTestEnabled || isLocalHost || isLocalDevHost()),
    [devTestEnabled, isLocalHost],
  )

  const syncFromStorage = useCallback(() => {
    setSpinsCompleted(readJackpotSpinsCompleted())
    setWinnings(readJackpotWinnings())
    setSessionPaid(readJackpotSessionPaid())
  }, [])

  useEffect(() => {
    syncFromStorage()
    const onUnlock = () => syncFromStorage()
    window.addEventListener('mystika-jackpot-unlock', onUnlock)
    return () => window.removeEventListener('mystika-jackpot-unlock', onUnlock)
  }, [syncFromStorage])

  useEffect(() => {
    if (!readJackpotSessionPaid() || isLocalPlay()) return
    void reconcilePaidSession('mystika-jackpot', readJackpotSessionOrderId(), () => {
      resetJackpotSession()
      syncFromStorage()
    })
  }, [syncFromStorage, isLocalPlay])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hostname = window.location.hostname
    setIsLocalHost(hostname === 'localhost' || hostname === '127.0.0.1')
  }, [])

  const resetFullCycle = useCallback(() => {
    resetJackpotSession()
    setSpinsCompleted(0)
    setWinnings(0)
    setSessionPaid(false)
    setPhase('idle')
    setResult(null)
    setStoppedReels([false, false, false])
  }, [])

  const executeSpin = (attempt: JackpotSpinPhase) => {
    const accumulatedBefore = attempt === 2 ? readJackpotWinnings() : winnings
    const picked = outcomeForSpin(attempt, accumulatedBefore)

    setResult(picked)
    setStoppedReels([false, false, false])
    setPhase('spinning')

    setTimeout(() => setStoppedReels([true, false, false]), 1400)
    setTimeout(() => setStoppedReels([true, true, false]), 2000)
    setTimeout(() => {
      setStoppedReels([true, true, true])
      setPhase('result')

      if (attempt === 1) {
        const nextWinnings = JACKPOT_FIRST_SPIN_WIN
        setWinnings(nextWinnings)
        setSpinsCompleted(1)
        persistJackpotSession(1, nextWinnings, true)
      } else if (attempt === 2) {
        setWinnings(0)
        setSpinsCompleted(2)
        persistJackpotSession(2, 0, true)
      } else {
        setSpinsCompleted(JACKPOT_TOTAL_SPINS)
        setSessionPaid(false)
        persistJackpotSession(JACKPOT_TOTAL_SPINS, 0, false)
      }
    }, 2600)
  }

  const startSpin = async () => {
    if (spinning || !canSpinInSession) return

    if (isLocalPlay()) {
      const attempt = Math.min(spinsCompleted + 1, JACKPOT_TOTAL_SPINS) as JackpotSpinPhase
      executeSpin(attempt)
      return
    }

    const orderId = readJackpotSessionOrderId()
    if (!orderId || !readJackpotSessionPaid()) {
      setSessionPaid(false)
      persistJackpotSession(spinsCompleted, winnings, false)
      onRequestPay(
        'mystika-jackpot',
        'JACKPOT MYSTIKA — 3 GIROS',
        'Por $1 USD: 1.º giro ganás $50, 2.º perdés el acumulado, 3.º galleta de la fortuna.',
        1,
      )
      return
    }

    const auth = await authorizeGameAction('mystika-jackpot', orderId)
    if (!auth.ok) {
      setSessionPaid(false)
      persistJackpotSession(spinsCompleted, winnings, false)
      onRequestPay(
        'mystika-jackpot',
        'JACKPOT MYSTIKA — 3 GIROS',
        'Por $1 USD: 1.º giro ganás $50, 2.º perdés el acumulado, 3.º galleta de la fortuna.',
        1,
      )
      return
    }

    const attempt = (auth.spin ?? spinsCompleted + 1) as JackpotSpinPhase
    executeSpin(attempt)
  }

  const handlePlay = () => {
    if (spinning) return

    if (cycleComplete) {
      resetFullCycle()
      onRequestPay(
        'mystika-jackpot',
        'JACKPOT MYSTIKA — 3 GIROS',
        'Por $1 USD: 1.º giro ganás $50, 2.º perdés el acumulado, 3.º galleta de la fortuna.',
        1,
      )
      return
    }

    if (needsPay) {
      onRequestPay(
        'mystika-jackpot',
        'JACKPOT MYSTIKA — 3 GIROS',
        'Por $1 USD: 1.º giro ganás $50, 2.º perdés el acumulado, 3.º galleta de la fortuna.',
        1,
      )
      return
    }

    startSpin()
  }

  const handleContinue = () => {
    if (spinning || cycleComplete || !sessionPaid) return
    void startSpin()
  }

  const handleDevUnlock = () => {
    if (!isLocalPlay()) return
    if (cycleComplete) return
    unlockJackpotSession(LOCAL_JACKPOT_ORDER_ID)
    syncFromStorage()
  }

  const handleDevReset = () => {
    if (!isLocalPlay()) return
    resetFullCycle()
  }

  const buttonLabel = (() => {
    if (spinning) return 'GIRANDO...'
    if (cycleComplete) return 'JUGAR DE NUEVO — $1'
    if (needsPay) return 'GIRAR — $1 (3 GIROS)'
    if (currentSpin === 1) return 'GIRAR — 1ER GIRO'
    if (currentSpin === 2) return 'GIRAR — 2DO GIRO'
    return 'GIRAR — 3ER GIRO'
  })()

  const reelSymbols: [string, string, string] = result?.symbols ?? ['❓', '❓', '❓']

  const showAccumulated = sessionPaid && !cycleComplete && winnings > 0

  return (
    <div className="animate-[fadeup_0.4s_ease]">

      <JackpotTopCompact
        amount={showAccumulated ? `$${winnings}` : '$1,000'}
        topLabel={showAccumulated ? 'ACUMULADO EN MESA' : 'JACKPOT DISPONIBLE'}
        bottomLabel={showAccumulated ? 'USD · EN TU MESA' : 'USD · PREMIO MAYOR'}
        icon={showAccumulated ? '💜' : '💵'}
        spinsCompleted={spinsCompleted}
        currentSpin={currentSpin}
        cycleComplete={cycleComplete}
        sessionPaid={sessionPaid}
      />

      <div className="mx-auto mb-3 w-full max-w-[560px]">
        <JackpotLiveFeedHeader />
        <JackpotLiveFeed />
      </div>

      <OrbMarqueeLights
        active
        premium
        hideBulbs
        frantic={spinning || phase === 'result'}
        className="mb-5 mx-auto w-full max-w-[560px]"
      >
      <div className="relative p-3 sm:p-4">
        <div className="relative z-[2] mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <span
                className="block w-2 h-2 rounded-full"
                style={{ background: '#00ff9d', boxShadow: '0 0 10px #00ff9d' }}
              />
              <span
                className="absolute inset-[-3px] rounded-full border border-[#00ff9d]/60"
                style={{ animation: 'orb-feed-live-ring 1.6s ease-out infinite' }}
              />
            </div>
            <span className="font-mono text-[9px] tracking-[3px] text-[var(--green)]">
              MESA JACKPOT
            </span>
          </div>
          <span className="font-mono text-[8px] tracking-[2px] text-[var(--gold3)] opacity-80">
            {sessionPaid && !cycleComplete
              ? `GIRO ${currentSpin}/${JACKPOT_TOTAL_SPINS}`
              : 'PREMIUM'}
          </span>
        </div>

        <JackpotAccumulationBar
          winnings={winnings}
          spinsCompleted={spinsCompleted}
          sessionActive={sessionPaid || cycleComplete}
          cycleComplete={cycleComplete}
          spinning={spinning}
        />

        <div className={`relative z-[2] ${phase === 'result' ? 'mb-3' : 'mb-4'}`}>
          <div className="flex gap-3 sm:gap-4 justify-center relative">
            {spinning && (
              <div
                className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[3px] z-[1] pointer-events-none rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.15) 8%, rgba(255,215,0,0.9) 50%, rgba(255,215,0,0.15) 92%, transparent 100%)',
                  boxShadow: '0 0 20px rgba(255,215,0,0.55)',
                  animation: 'glow-pulse 0.8s ease-in-out infinite',
                }}
                aria-hidden
              />
            )}
            {[0, 1, 2].map((i) => (
              <JackpotReel
                key={i}
                reelIndex={i}
                finalSymbol={reelSymbols[i]}
                spinning={spinning || phase === 'result'}
                stopped={stoppedReels[i] || phase === 'result'}
              />
            ))}
          </div>
          {spinning && (
            <div className="flex justify-center gap-3 mt-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="font-mono text-[9px] tracking-[2px] transition-all duration-300"
                  style={{
                    color: stoppedReels[i] ? '#ffd700' : 'var(--mystik3)',
                    opacity: stoppedReels[i] ? 1 : 0.55,
                  }}
                >
                  {stoppedReels[i] ? '●' : '○'} CARRETE {i + 1}
                </span>
              ))}
            </div>
          )}
        </div>

        {phase !== 'result' && (
        <div className="relative z-[2] flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.5))' }} />
          <span className="font-mono text-[12px] sm:text-[13px] tracking-[4px] text-[var(--gold3)]">
            LÍNEA DE PAGO
          </span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.5))' }} />
        </div>
        )}

        {phase !== 'result' && (
        <div className="relative z-[2] grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { sym: '🌙🌙🌙', label: '1 mil dólares', color: '#ffd700' },
            { sym: '🔮🔮🔮', label: '100 dólares', color: '#b388ff' },
            { sym: '💜💜💜', label: '50 dólares', color: '#ff6b9d' },
            { sym: '💎💎🥠', label: 'Galleta de la fortuna', color: '#00ff9d' },
          ].map((g, i) => (
            <div
              key={i}
              className="text-center py-2.5 px-2 sm:py-3 rounded-lg min-h-[72px] flex flex-col items-center justify-center"
              style={{
                background: `linear-gradient(160deg, ${g.color}14 0%, rgba(8,5,14,0.92) 100%)`,
                border: `1px solid ${g.color}44`,
                boxShadow: `0 0 16px ${g.color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
                backdropFilter: 'blur(6px)',
              }}
            >
              <div className="text-[20px] sm:text-[22px] mb-2 leading-none tracking-tight">
                {g.sym}
              </div>
              <div
                className="font-mono text-[10px] sm:text-[11px] font-black tracking-[0.5px] leading-snug px-0.5"
                style={{ color: g.color }}
              >
                {g.label}
              </div>
            </div>
          ))}
        </div>
        )}

        {phase === 'idle' && (
          <div className="relative z-[2] flex flex-col gap-3">
            {sessionPaid && !cycleComplete && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono font-bold tracking-[1px] text-[12px]"
                  style={{
                    borderColor: 'rgba(0,255,157,0.35)',
                    background: 'rgba(0,255,157,0.1)',
                    color: '#00ff9d',
                  }}
                >
                  Giro {currentSpin} / {JACKPOT_TOTAL_SPINS}
                </span>
                {winnings > 0 && (
                  <span
                    className="inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold"
                    style={{
                      borderColor: 'rgba(255,107,157,0.35)',
                      background: 'rgba(255,107,157,0.08)',
                      color: '#ff6b9d',
                    }}
                  >
                    ${winnings.toFixed(2)} acumulado
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handlePlay}
                className="flex-1 py-5 rounded-2xl font-mono text-[16px] tracking-[4px] font-black transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
                style={{
                  background: canSpinInSession
                    ? 'linear-gradient(135deg, #b388ff, #d4b8ff)'
                    : 'linear-gradient(135deg, #00cc7a 0%, #00ff9d 100%)',
                  color: '#0a0612',
                  boxShadow: canSpinInSession
                    ? '0 8px 40px rgba(179,136,255,0.45)'
                    : '0 8px 40px rgba(0,255,157,0.5), 0 0 20px rgba(0,255,157,0.3)',
                  animation: 'glow-pulse 2.2s ease-in-out infinite',
                }}
              >
                <span className="text-3xl">🎰</span>
                <span>{buttonLabel}</span>
              </button>
              {(devTestEnabled || isLocalHost) && (
                <DevTestButton
                  onClick={cycleComplete ? handleDevReset : handleDevUnlock}
                  label={cycleComplete ? 'REINICIAR' : isLocalHost ? 'PROBAR (local)' : 'PROBAR PAGO LOCAL'}
                />
              )}
            </div>
          </div>
        )}

        {phase === 'spinning' && (
          <div
            className="relative z-[2] w-full py-4 sm:py-5 rounded-2xl overflow-hidden backdrop-blur-sm"
            style={{
              background: 'rgba(8, 5, 14, 0.55)',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              boxShadow: '0 0 24px rgba(255, 215, 0, 0.15)',
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)',
                animation: 'ctamove 1.8s linear infinite',
              }}
            />
            <div className="flex flex-col items-center gap-2 px-4">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="text-lg leading-none transition-opacity duration-300"
                    style={{
                      opacity: stoppedReels[i] ? 1 : 0.35,
                      filter: stoppedReels[i]
                        ? 'drop-shadow(0 0 8px rgba(255,215,0,0.8))'
                        : undefined,
                    }}
                  >
                    🎰
                  </span>
                ))}
              </div>
              <span className="font-mono text-[13px] sm:text-[14px] tracking-[3px] text-[var(--gold3)]">
                {stoppedReels.filter(Boolean).length === 0 &&
                  `GIRO ${currentSpin} · ACTIVANDO CARRETES...`}
                {stoppedReels.filter(Boolean).length === 1 &&
                  'CARRETE 1 FIJO · SIGUIENTE...'}
                {stoppedReels.filter(Boolean).length === 2 &&
                  'CARRETE 2 FIJO · ÚLTIMO CARRETE...'}
                {stoppedReels.filter(Boolean).length === 3 &&
                  'RESULTADO LISTO'}
              </span>
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <div
            className="relative z-[2] animate-[fadeup_0.5s_ease] rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${result.color}22 0%, rgba(8,5,14,0.94) 42%, rgba(10,6,18,0.98) 100%)`,
              border: `2px solid ${result.color}55`,
              boxShadow: `0 0 40px ${result.color}28, inset 0 0 36px ${result.color}08`,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, transparent, ${result.color}, transparent)` }}
              aria-hidden
            />

            <div className="p-4 sm:p-5">
              <div
                className="font-display font-black text-[20px] sm:text-[24px] tracking-[0.5px] text-center mb-3 leading-tight"
                style={{ color: result.color, textShadow: `0 0 22px ${result.color}70` }}
              >
                {result.title}
              </div>

              <p className="text-[14px] sm:text-[15px] text-[var(--txt)] leading-[1.75] text-center mb-3 px-1">
                {result.message}
              </p>

              <div
                className="text-center py-2.5 px-3 rounded-xl mb-3"
                style={{ background: `${result.color}12`, border: `1px solid ${result.color}35` }}
              >
                <p className="text-[13px] sm:text-[14px] font-medium italic leading-snug" style={{ color: result.color }}>
                  {result.extra}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cycleComplete
                    ? () => {
                        setPhase('idle')
                        setResult(null)
                        setStoppedReels([false, false, false])
                        handlePlay()
                      }
                    : handleContinue
                }
                className="w-full py-3.5 sm:py-4 rounded-2xl font-mono text-[13px] sm:text-[14px] tracking-[3px] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: cycleComplete
                    ? 'linear-gradient(135deg, #00cc7a 0%, #00ff9d 100%)'
                    : 'rgba(255,255,255,0.06)',
                  border: cycleComplete
                    ? 'none'
                    : '2px solid rgba(255,255,255,0.18)',
                  color: cycleComplete ? '#0a0612' : 'var(--txt2)',
                  boxShadow: cycleComplete
                    ? '0 4px 20px rgba(0,255,157,0.35)'
                    : undefined,
                }}
              >
                {cycleComplete
                  ? 'JUGAR DE NUEVO — $1'
                  : currentSpin <= 2
                    ? 'GIRAR — SIGUIENTE GIRO'
                    : 'CONTINUAR'}
              </button>
            </div>
          </div>
        )}
      </div>
      </OrbMarqueeLights>
    </div>
  )
}
