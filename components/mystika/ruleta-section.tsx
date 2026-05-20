'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const LS_SPINS = 'mystika-ruleta-spins-completed'
const LS_WINNINGS = 'mystika-ruleta-winnings'
const LS_PENDING = 'mystika-ruleta-pending-paid-spin'
const TOTAL_ATTEMPTS = 3

interface WheelSegment {
  label: string
  value: number
  icon: string
  color: string
  isNothing: boolean
  isMysteryBox: boolean
  isFortuneCookie: boolean
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: '$30', value: 30, icon: '💵', color: '#00ff9d', isNothing: false, isMysteryBox: false, isFortuneCookie: false },
  { label: '$20', value: 20, icon: '💵', color: '#00e5ff', isNothing: false, isMysteryBox: false, isFortuneCookie: false },
  { label: '$5', value: 5, icon: '💵', color: '#ffd700', isNothing: false, isMysteryBox: false, isFortuneCookie: false },
  { label: 'NADA', value: 0, icon: '❌', color: '#ff6b6b', isNothing: true, isMysteryBox: false, isFortuneCookie: false },
  { label: 'CAJA MISTERIOSA', value: 0, icon: '📦', color: '#ff6b9d', isNothing: false, isMysteryBox: true, isFortuneCookie: false },
  { label: 'GALLETA DE LA SUERTE', value: 0, icon: '🥠', color: '#ffd700', isNothing: false, isMysteryBox: false, isFortuneCookie: true },
]

interface RuletaSectionProps {
  onRequestPay: (productId: string, title: string, description: string) => void
}

function readSpinsCompleted(): number {
  if (typeof window === 'undefined') return 0
  try {
    const n = parseInt(localStorage.getItem(LS_SPINS) || '0', 10)
    return Number.isFinite(n) ? Math.max(0, Math.min(TOTAL_ATTEMPTS, n)) : 0
  } catch {
    return 0
  }
}

function readWinnings(): number {
  if (typeof window === 'undefined') return 0
  try {
    const n = parseFloat(localStorage.getItem(LS_WINNINGS) || '0')
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

function readPendingPaid(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(LS_PENDING) === '1'
  } catch {
    return false
  }
}

function wrapLabel(label: string, maxChars: number): string[] {
  if (label.length <= maxChars) return [label]

  const words = label.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word.length > maxChars ? word.slice(0, maxChars) : word
    }
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : [label]
}

function drawSegmentContent(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  midAngle: number,
  segment: WheelSegment,
  segmentAngle: number,
) {
  const iconRadius = radius * 0.55
  const labelRadius = radius * 0.84
  const arcWidth = segmentAngle * labelRadius * 0.88

  const iconX = center + Math.cos(midAngle) * iconRadius
  const iconY = center + Math.sin(midAngle) * iconRadius
  const labelX = center + Math.cos(midAngle) * labelRadius
  const labelY = center + Math.sin(midAngle) * labelRadius

  ctx.save()
  ctx.translate(iconX, iconY)
  ctx.font = '30px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(segment.icon, 0, 0)
  ctx.restore()

  const normalized = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  let textAngle = midAngle + Math.PI / 2
  if (normalized > Math.PI / 2 && normalized < (3 * Math.PI) / 2) {
    textAngle += Math.PI
  }

  const isMoney = segment.label.startsWith('$')
  let fontSize = isMoney ? 24 : segment.label.length > 16 ? 11 : segment.label.length > 10 ? 13 : 15
  const maxChars = isMoney ? 6 : Math.max(8, Math.floor(arcWidth / (fontSize * 0.52)))

  ctx.save()
  ctx.translate(labelX, labelY)
  ctx.rotate(textAngle)

  let lines = wrapLabel(segment.label, maxChars)
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const measureLines = () =>
    lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0)

  while (measureLines() > arcWidth && fontSize > 9) {
    fontSize -= 1
    ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`
  }

  if (measureLines() > arcWidth && lines.length < 3) {
    lines = wrapLabel(segment.label, Math.max(6, maxChars - 2))
  }

  const lineHeight = fontSize * 1.2
  const startY = -((lines.length - 1) * lineHeight) / 2

  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight
    ctx.lineWidth = Math.max(2, fontSize * 0.14)
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'
    ctx.lineJoin = 'round'
    ctx.fillStyle = '#ffffff'
    ctx.strokeText(lines[i], 0, y)
    ctx.fillText(lines[i], 0, y)
  }

  ctx.restore()
}

function computeTargetRotationForSegment(
  startRotation: number,
  winIndex: number,
  segmentAngle: number,
): number {
  const twoPi = 2 * Math.PI
  const fullSpins = 5 + Math.floor(Math.random() * 4)
  const t = 0.28 + Math.random() * 0.44
  const desiredPointer = winIndex * segmentAngle + segmentAngle * t
  let desiredNorm = (3 * Math.PI) / 2 - desiredPointer
  desiredNorm = ((desiredNorm % twoPi) + twoPi) % twoPi

  const startNorm = ((startRotation % twoPi) + twoPi) % twoPi
  let delta = (desiredNorm - startNorm + twoPi) % twoPi
  if (delta < 0.08) delta += twoPi

  return startRotation + fullSpins * twoPi + delta
}

export function RuletaSection({ onRequestPay }: RuletaSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<{ label: string; message: string; color: string } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [spinsCompleted, setSpinsCompleted] = useState(readSpinsCompleted)
  const [winnings, setWinnings] = useState(readWinnings)
  const [pendingPaidSpin, setPendingPaidSpin] = useState(readPendingPaid)

  const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length

  const syncFromStorage = useCallback(() => {
    setSpinsCompleted(readSpinsCompleted())
    setWinnings(readWinnings())
    setPendingPaidSpin(readPendingPaid())
  }, [])

  useEffect(() => {
    syncFromStorage()
    const onUnlock = () => syncFromStorage()
    window.addEventListener('mystika-ruleta-unlock', onUnlock)
    return () => window.removeEventListener('mystika-ruleta-unlock', onUnlock)
  }, [syncFromStorage])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 40

    ctx.clearRect(0, 0, size, size)

    // Draw wheel segments
    WHEEL_SEGMENTS.forEach((segment, i) => {
      const startAngle = i * segmentAngle + rotation
      const endAngle = (i + 1) * segmentAngle + rotation

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      
      ctx.fillStyle = segment.color + '30'
      ctx.fill()
      ctx.strokeStyle = segment.color + '60'
      ctx.lineWidth = 2
      ctx.stroke()

      const midAngle = startAngle + segmentAngle / 2
      drawSegmentContent(ctx, center, radius, midAngle, segment, segmentAngle)
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(center, center, 65, 0, 2 * Math.PI)
    ctx.fillStyle = '#0a0612'
    ctx.fill()
    ctx.strokeStyle = 'rgba(179,136,255,0.6)'
    ctx.lineWidth = 5
    ctx.stroke()

    ctx.font = '52px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🔮', center, center)
  }, [rotation, segmentAngle])

  const spin = (targetSegmentIndex: number) => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult(null)

    const twoPi = 2 * Math.PI
    const targetRotation = computeTargetRotationForSegment(rotation, targetSegmentIndex, segmentAngle)

    const duration = 4000
    const startTime = Date.now()
    const startRotation = rotation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)

      setRotation(startRotation + (targetRotation - startRotation) * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)

        const segment = WHEEL_SEGMENTS[targetSegmentIndex]
        const currentAttempt = spinsCompleted + 1
        
        let newWinnings = winnings
        let message = ''
        let label = segment.label

        if (currentAttempt === 1) {
          // First spin: always win
          if (segment.isNothing) {
            // Shouldn't happen with rigged logic, but handle it
            newWinnings = 0
            message = 'La fortuna te sonrió... pero no esta vez.'
          } else if (segment.isMysteryBox) {
            newWinnings = 15
            message = '¡Caja misteriosa! Ganaste $15 USD.'
            label = 'CAJA MISTERIOSA'
          } else if (segment.isFortuneCookie) {
            newWinnings = 0
            message = 'Una galleta de la suerte ilumina tu camino.'
          } else {
            newWinnings = segment.value
            message = `¡Ganaste $${segment.value} USD!`
          }
        } else if (currentAttempt === 2) {
          // Second spin: lose everything
          newWinnings = 0
          message = 'El destino tiene otros planes. Perdiste todo lo ganado.'
          label = 'NADA'
        } else if (currentAttempt === 3) {
          // Third spin: always fortune cookie
          newWinnings = 0
          message = 'La galleta de la fortuna revela tu destino.'
          label = 'GALLETA DE LA SUERTE'
        }

        setResult({
          label,
          message,
          color: segment.color,
        })

        setSpinsCompleted((prev) => {
          const next = prev + 1
          try {
            localStorage.setItem(LS_SPINS, String(next))
          } catch {
            // ignore
          }
          return next
        })

        setWinnings((prev) => {
          try {
            localStorage.setItem(LS_WINNINGS, String(newWinnings))
          } catch {
            // ignore
          }
          return newWinnings
        })

        if (pendingPaidSpin) {
          setPendingPaidSpin(false)
          try {
            localStorage.removeItem(LS_PENDING)
          } catch {
            // ignore
          }
        }
      }
    }

    requestAnimationFrame(animate)
  }

  const needsPayForThird = spinsCompleted === 2 && !pendingPaidSpin
  const canSpinThird = spinsCompleted === 2 && pendingPaidSpin
  const pathComplete = spinsCompleted >= TOTAL_ATTEMPTS
  const currentAttempt = spinsCompleted + 1

  const handlePrimary = () => {
    if (isSpinning || pathComplete) return
    
    if (currentAttempt === 1) {
      // First spin: rigged to win (not nothing, not fortune cookie)
      const winningSegments = WHEEL_SEGMENTS.filter(s => !s.isNothing && !s.isFortuneCookie)
      const randomWin = winningSegments[Math.floor(Math.random() * winningSegments.length)]
      const targetIndex = WHEEL_SEGMENTS.indexOf(randomWin)
      spin(targetIndex)
      return
    }
    
    if (currentAttempt === 2) {
      // Second spin: rigged to lose (nothing segment)
      const nothingIndex = WHEEL_SEGMENTS.findIndex(s => s.isNothing)
      spin(nothingIndex)
      return
    }
    
    if (currentAttempt === 3) {
      if (needsPayForThird) {
        onRequestPay(
          'mystika-ruleta-tercera',
          '3ª VUELTA — GALLETA DE LA SUERTE',
          'Pago de $1 para la tercera vuelta: la ruleta te da una galleta de la fortuna.',
        )
        return
      }
      if (canSpinThird) {
        // Third spin: rigged to fortune cookie
        const fortuneIndex = WHEEL_SEGMENTS.findIndex(s => s.isFortuneCookie)
        spin(fortuneIndex)
      }
    }
  }

  const buttonLabel = (() => {
    if (isSpinning) return 'GIRANDO...'
    if (pathComplete) return 'COMPLETADO'
    if (currentAttempt === 1) return 'GIRAR — 1º INTENTO'
    if (currentAttempt === 2) return 'GIRAR — 2º INTENTO'
    if (needsPayForThird) return 'PAGAR $1 — 3º INTENTO'
    return 'GIRAR — 3º INTENTO'
  })()

  const buttonStyle = (() => {
    if (pathComplete) {
      return {
        background: 'linear-gradient(135deg,#5c5368,#3d3648)',
        boxShadow: '0 4px 15px rgba(0,0,0,.25)',
      }
    }
    if (needsPayForThird) {
      return {
        background: 'linear-gradient(135deg,var(--gold),#ffdd55)',
        boxShadow: '0 4px 15px rgba(255,215,0,.35)',
      }
    }
    return {
      background: 'linear-gradient(135deg,var(--mystik3),var(--mystik))',
      boxShadow: '0 4px 15px rgba(179,136,255,.3)',
    }
  })()

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      <div className="text-center py-1.5 pb-[18px]">
        <div className="font-mono text-[11px] sm:text-[12px] tracking-[4px] sm:tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          RULETA DEL DESTINO
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-2.5"
          style={{ fontSize: 'clamp(36px,9vw,58px)' }}
        >
          Gira y <span className="text-[var(--mystik)]" style={{ textShadow: '0 0 20px rgba(179,136,255,.5)' }}>descubre</span>
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[var(--txt2)] max-w-[400px] mx-auto leading-[1.75] font-normal">
          Tres intentos para probar tu suerte. La primera vez ganas, la segunda pierdes todo, la tercera pagás $1 por una galleta de la fortuna.
        </p>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div
            className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-10 text-2xl"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
          >
            ▼
          </div>

          <div
            className="absolute inset-[-20px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(179,136,255,0.15) 0%, transparent 70%)',
              animation: isSpinning ? 'glow-pulse 0.5s ease-in-out infinite' : 'none',
            }}
          />

          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="rounded-full"
            style={{
              boxShadow: '0 0 40px rgba(179,136,255,0.4), inset 0 0 30px rgba(0,0,0,0.6)',
            }}
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-[13px] text-[var(--mystik3)] font-mono tracking-wider mb-2">
            {pathComplete
              ? 'Completaste los 3 intentos.'
              : `Intento: ${currentAttempt} / ${TOTAL_ATTEMPTS}`}
          </p>
          {winnings > 0 && (
            <p className="text-[14px] font-bold" style={{ color: '#00ff9d' }}>
              Ganancias: ${winnings.toFixed(2)} USD
            </p>
          )}
          {winnings > 0 && winnings < 30 && (
            <p className="text-[11px] text-[var(--txt3)] mt-1">
              Mínimo para retiro: $30 USD
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handlePrimary}
          disabled={isSpinning || pathComplete}
          className="mt-3 min-h-[52px] py-4 px-6 sm:px-12 rounded-xl font-display font-bold text-[18px] sm:text-[21px] tracking-[1px] sm:tracking-[2px] text-[var(--bg0)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 leading-tight"
          style={buttonStyle}
        >
          {buttonLabel}
        </button>
      </div>

      {result && (
        <div
          className="bg-[var(--bg2)] border rounded-lg p-6 text-center relative overflow-hidden"
          style={{
            borderColor: result.color,
            animation: 'reveal-message 0.6s ease-out',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg,transparent,${result.color},transparent)` }}
          />

          <div
            className="inline-block py-1.5 px-4 rounded-full mb-4 font-display font-bold text-[16px]"
            style={{
              background: result.color,
              color: '#000',
            }}
          >
            {result.label}
          </div>

          <p className="text-[16px] sm:text-[17px] text-[var(--txt)] leading-[1.8] font-light italic">
            &ldquo;{result.message}&rdquo;
          </p>
        </div>
      )}

      {/* Prize info */}
      <div className="mt-6 grid grid-cols-3 gap-3 max-w-[500px] mx-auto">
        {WHEEL_SEGMENTS.map((segment, i) => (
          <div
            key={i}
            className="text-center p-2 rounded-lg"
            style={{
              background: `${segment.color}15`,
              border: `1px solid ${segment.color}40`,
            }}
          >
            <div className="text-3xl mb-1">{segment.icon}</div>
            <div className="text-[14px] font-black" style={{ color: segment.color }}>
              {segment.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
