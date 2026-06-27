'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { wheelSegments } from '@/lib/clawzone-data'

interface RuletaSectionProps {
  hasPaid: boolean
  onRequestPay: () => void
}

export function RuletaSection({ hasPaid, onRequestPay }: RuletaSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ label: string; color: string; sub: string } | null>(null)
  const currentAngleRef = useRef(0)

  const drawWheel = useCallback((angle: number = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = 155
    const cy = 155
    const r = 148
    const n = wheelSegments.length
    const arc = (Math.PI * 2) / n

    ctx.clearRect(0, 0, 310, 310)

    // Outer glow (más intenso al girar)
    const outerGrad = ctx.createRadialGradient(cx, cy, r - 6, cx, cy, r + 36)
    const glowAlpha = spinning ? 0.45 : 0.18
    outerGrad.addColorStop(0, `rgba(0,212,255,${glowAlpha})`)
    outerGrad.addColorStop(0.6, `rgba(179,136,255,${glowAlpha * 0.7})`)
    outerGrad.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(cx, cy, r + 22, 0, Math.PI * 2)
    ctx.fillStyle = outerGrad
    ctx.fill()

    // Segments
    wheelSegments.forEach((seg, i) => {
      const start = angle + i * arc - Math.PI / 2
      const end = start + arc

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = i % 2 === 0 ? seg.c + '22' : seg.c + '11'
      ctx.fill()
      ctx.strokeStyle = seg.c + '44'
      ctx.lineWidth = 1
      ctx.stroke()

      // Text
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + arc / 2)
      ctx.fillStyle = seg.c
      ctx.font = 'bold 9px "Share Tech Mono",monospace'
      ctx.textAlign = 'right'
      ctx.shadowColor = seg.c
      ctx.shadowBlur = 6
      ctx.fillText(seg.l, r - 12, 3)
      ctx.restore()
    })

    // Border ring
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,212,255,0.35)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, r - 7, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,212,255,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Center hub
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22)
    grd.addColorStop(0, '#18223c')
    grd.addColorStop(1, '#080c18')
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, Math.PI * 2)
    ctx.fillStyle = grd
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,212,255,0.5)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Outer light ring intensificado + efecto barrido cuando gira
    const lightRingRadius = r + 26
    const lightCount = 36
    const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    for (let i = 0; i < lightCount; i += 1) {
      const theta = (Math.PI * 2 * i) / lightCount - Math.PI / 2
      const lx = cx + Math.cos(theta) * lightRingRadius
      const ly = cy + Math.sin(theta) * lightRingRadius

      // factor que resalta las luces cercanas al ángulo de giro (barrido)
      const dist = Math.abs(Math.atan2(Math.sin(theta - -normalizedAngle), Math.cos(theta - -normalizedAngle)))
      const proximity = Math.max(0, 1 - dist / 0.7)
      const sweep = spinning ? Math.pow(proximity, 1.6) : 0

      const baseAlpha = spinning ? 0.28 : 0.18
      const alpha = Math.min(1, baseAlpha + 0.9 * sweep + 0.08 * Math.sin(i * 1.3 + angle * 6))
      const size = 5 + 6 * sweep
      const color = i % 2 === 0 ? `rgba(0,212,255,${alpha})` : `rgba(179,136,255,${alpha})`

      ctx.beginPath()
      ctx.arc(lx, ly, size, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 12 + 26 * sweep
      ctx.fill()
    }
    ctx.shadowBlur = 0

    // Barrido radial: anillo brillante que se mueve con el ángulo
    if (spinning) {
      ctx.beginPath()
      ctx.lineWidth = 8
      const sweepAlpha = 0.14 + 0.18 * Math.abs(Math.sin(angle * 2.2))
      ctx.strokeStyle = `rgba(0,212,255,${sweepAlpha})`
      ctx.arc(cx, cy, r + 10, -normalizedAngle - 0.35, -normalizedAngle + 0.35)
      ctx.stroke()
    }

    ctx.font = '14px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'var(--neon)'
    ctx.shadowBlur = 10
    ctx.fillText('🎮', cx, cy)
  }, [spinning])

  useEffect(() => {
    drawWheel(0)
  }, [drawWheel])

  const spinWheel = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)

    const total = Math.PI * 2 * 7.5 + Math.random() * Math.PI * 2
    const duration = 5000
    const startTime = performance.now()
    const startAngle = currentAngleRef.current

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      currentAngleRef.current = startAngle + total * eased
      drawWheel(currentAngleRef.current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        const n = wheelSegments.length
        const arc = (Math.PI * 2) / n
        const norm = (((-currentAngleRef.current + Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        const idx = Math.floor(norm / arc) % n
        const seg = wheelSegments[idx]
        setResult({ label: seg.l, color: seg.c, sub: seg.s })
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className="animate-[fadeup_0.4s_ease] relative">
      {/* Paywall Overlay */}
      {!hasPaid && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-[30px] px-5 text-center rounded-lg bg-[rgba(5,8,16,0.88)] backdrop-blur-[6px]">
          <div className="text-[52px]" style={{ animation: 'lockpulse 2s ease-in-out infinite' }}>🔒</div>
          <div
            className="font-display font-black italic text-[26px] text-[var(--neon)]"
            style={{ textShadow: '0 0 16px rgba(0,212,255,.4)' }}
          >
            Contenido Premium
          </div>
          <div className="text-[13px] text-[var(--txt2)] leading-[1.7] font-light max-w-[280px]">
            Jugá una claw por $1 y desbloqueás la Ruleta del Destino y la Galleta de la Suerte de forma permanente.
          </div>
          <div className="inline-flex items-center gap-1.5 py-[5px] px-3.5 rounded bg-[rgba(0,212,255,0.08)] border border-[var(--border)] font-mono text-[10px] text-[var(--neon3)] tracking-[2px]">
            ✦ UNA JUGADA · TODO DESBLOQUEADO
          </div>
          <button
            onClick={onRequestPay}
            className="py-[13px] px-9 border-none rounded-md cursor-pointer font-display font-black italic text-[17px] tracking-[4px] text-[var(--bg0)] transition-transform hover:-translate-y-0.5 active:translate-y-[3px]"
            style={{
              background: 'linear-gradient(135deg,var(--neon3),var(--neon))',
              boxShadow: '0 5px 0 rgba(0,0,0,.4),0 8px 28px rgba(0,212,255,.25)',
            }}
          >
            🦾 JUGAR POR $1
          </button>
        </div>
      )}

      {/* Title */}
      <div className="text-center py-1.5 pb-4">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--neon3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          GIRÁ Y DESCUBRÍ
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black italic leading-[0.95] tracking-[-1px]"
          style={{ fontSize: 'clamp(42px,10vw,72px)' }}
        >
          Ruleta del{' '}
          <span className="text-[var(--neon)]" style={{ textShadow: '0 0 20px rgba(0,212,255,.5)' }}>
            Destino
          </span>
        </h2>
      </div>

      {/* Wheel */}
      <div className="flex justify-center my-5 relative">
        <div
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[28px] z-10 text-[var(--pink)]"
          style={{ filter: 'drop-shadow(0 4px 12px var(--pink))' }}
        >
          ▼
        </div>
        <canvas
          ref={canvasRef}
          width={310}
          height={310}
          className="rounded-full"
          style={{
            boxShadow: spinning
              ? '0 0 90px rgba(0,212,255,.22),0 0 180px rgba(0,212,255,.16)'
              : '0 0 60px rgba(0,212,255,.1),0 0 120px rgba(0,0,0,.5)',
          }}
        />
      </div>

      {/* Spin Button */}
      <div className="text-center">
        <button
          onClick={spinWheel}
          disabled={spinning}
          className="inline-flex items-center justify-center gap-2.5 mx-auto mb-5 py-[13px] px-10 rounded-md cursor-pointer font-display font-bold text-[15px] tracking-[4px] text-[var(--neon)] bg-transparent border border-[var(--border)] transition-all hover:bg-[var(--neonG)] hover:border-[var(--neon)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          style={!spinning ? { boxShadow: '0 0 24px rgba(0,212,255,.15)', textShadow: '0 0 12px var(--neon)' } : {}}
        >
          ⚡ &nbsp;GIRAR AHORA
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className="p-6 rounded-lg text-center border border-[var(--borderH)] bg-[var(--bg2)] mt-2.5 animate-[fadeup_0.4s_ease]"
          style={{ boxShadow: '0 0 30px rgba(0,212,255,.08)' }}
        >
          <div className="font-mono text-[9px] tracking-[5px] text-[var(--neon3)] mb-2.5">TU DESTINO ES</div>
          <div
            className="font-display font-black italic text-[36px] mb-2"
            style={{ color: result.color, textShadow: `0 0 20px ${result.color}66` }}
          >
            {result.label}
          </div>
          <div className="text-sm text-[var(--txt2)] leading-[1.7] font-light">{result.sub}</div>
        </div>
      )}
    </div>
  )
}
