'use client'

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { verifyRuletaThirdPaid } from '@/lib/game-authorize-client'
import { isLocalDevHost } from '@/lib/is-local-dev'
import { DevTestButton } from './dev-test-button'
import { OrbMarqueeLights } from './orb-marquee-lights'
import { RuletaSideRail, RuletaLedBar } from './ruleta-side-rail'
import { RuletaStageAtmosphere } from './ruleta-stage-atmosphere'
import { RuletaStepLights, ruletaStepNeonShadow } from './ruleta-step-lights'
import { RuletaLiveFeed } from './ruleta-live-feed'

const LS_SPINS = 'mystika-ruleta-spins-completed'
const LS_WINNINGS = 'mystika-ruleta-winnings'
const LS_PENDING = 'mystika-ruleta-pending-paid-spin'
const LS_THIRD_BONUS = 'mystika-ruleta-third-bonus'
const TOTAL_ATTEMPTS = 3

type SpinPhase = 1 | 2 | '3a' | '3b'

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
  devTestEnabled?: boolean
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

function readThirdBonusReady(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(LS_THIRD_BONUS) === '1'
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
  ctx.font = `${Math.max(18, Math.floor(radius * 0.28))}px serif`
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
  let fontSize = isMoney ? Math.max(12, Math.floor(radius * 0.18)) : segment.label.length > 16 ? Math.max(9, Math.floor(radius * 0.07)) : segment.label.length > 10 ? Math.max(10, Math.floor(radius * 0.08)) : Math.max(11, Math.floor(radius * 0.1))
  const maxChars = isMoney ? 6 : Math.max(6, Math.floor(arcWidth / (fontSize * 0.52)))

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

export function RuletaSection({ onRequestPay, devTestEnabled }: RuletaSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<{ label: string; message: string; color: string } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [spinsCompleted, setSpinsCompleted] = useState(readSpinsCompleted)
  const [winnings, setWinnings] = useState(readWinnings)
  const [pendingPaidSpin, setPendingPaidSpin] = useState(readPendingPaid)
  const [thirdBonusReady, setThirdBonusReady] = useState(readThirdBonusReady)
  const [wheelPowered, setWheelPowered] = useState(
    () => readSpinsCompleted() > 0 || readPendingPaid(),
  )
  const [bonusArmed, setBonusArmed] = useState(false)
  const [isLocalHost, setIsLocalHost] = useState(false)
  const [wheelSize, setWheelSize] = useState(420)

  const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length

  const isLocalPlay = useCallback(
    () => devTestEnabled || isLocalHost || isLocalDevHost(),
    [devTestEnabled, isLocalHost],
  )

  const ensureThirdPaid = useCallback(async (): Promise<boolean> => {
    if (isLocalPlay()) return true
    return verifyRuletaThirdPaid()
  }, [isLocalPlay])

  const syncFromStorage = useCallback(() => {
    setSpinsCompleted(readSpinsCompleted())
    setWinnings(readWinnings())
    setPendingPaidSpin(readPendingPaid())
    setThirdBonusReady(readThirdBonusReady())
  }, [])

  const resetFullCycle = useCallback(() => {
    setSpinsCompleted(0)
    setWinnings(0)
    setPendingPaidSpin(false)
    setThirdBonusReady(false)
    setWheelPowered(false)
    setBonusArmed(false)
    setResult(null)
    try {
      localStorage.removeItem(LS_SPINS)
      localStorage.removeItem(LS_WINNINGS)
      localStorage.removeItem(LS_PENDING)
      localStorage.removeItem(LS_THIRD_BONUS)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    syncFromStorage()
    const onUnlock = () => syncFromStorage()
    window.addEventListener('mystika-ruleta-unlock', onUnlock)
    return () => window.removeEventListener('mystika-ruleta-unlock', onUnlock)
  }, [syncFromStorage])

  useEffect(() => {
    if (!pendingPaidSpin || isLocalPlay()) return
    void verifyRuletaThirdPaid().then((paid) => {
      if (paid) return
      setPendingPaidSpin(false)
      try {
        localStorage.removeItem(LS_PENDING)
      } catch {
        // ignore
      }
    })
  }, [pendingPaidSpin, isLocalPlay])

  useEffect(() => {
    if (thirdBonusReady) {
      setBonusArmed(true)
      setWheelPowered(true)
    }
  }, [thirdBonusReady])

  useEffect(() => {
    if (spinsCompleted > 0 || pendingPaidSpin) setWheelPowered(true)
  }, [spinsCompleted, pendingPaidSpin])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hostname = window.location.hostname
    setIsLocalHost(hostname === 'localhost' || hostname === '127.0.0.1')
  }, [])

  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const updateSize = () => {
      const w = el.clientWidth || 320
      const vw = typeof window !== 'undefined' ? window.innerWidth : w
      const pad = vw < 400 ? 24 : vw < 640 ? 32 : 40
      const size = Math.floor(
        Math.min(w - 8, vw - pad, 520, Math.max(280, w * 0.92)),
      )
      setWheelSize(Math.max(280, size))
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(el)
    window.addEventListener('resize', updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = Math.round(wheelSize * dpr)
    canvas.height = Math.round(wheelSize * dpr)
    canvas.style.width = `${wheelSize}px`
    canvas.style.height = `${wheelSize}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const size = wheelSize
    const center = size / 2
    const rim = Math.max(10, Math.floor(size * 0.045))
    const radius = Math.floor(center - rim - size * 0.04)
    const hubRadius = Math.max(26, Math.floor(size * 0.11))

    ctx.clearRect(0, 0, size, size)

    // Sombra base de la rueda
    ctx.save()
    ctx.beginPath()
    ctx.arc(center, center + size * 0.02, radius + rim * 0.5, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.filter = 'blur(12px)'
    ctx.fill()
    ctx.filter = 'none'
    ctx.restore()

    WHEEL_SEGMENTS.forEach((segment, i) => {
      const startAngle = i * segmentAngle + rotation
      const endAngle = (i + 1) * segmentAngle + rotation
      const midAngle = startAngle + segmentAngle / 2

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()

      const midX = center + Math.cos(midAngle) * radius * 0.55
      const midY = center + Math.sin(midAngle) * radius * 0.55
      const segGrad = ctx.createRadialGradient(midX, midY, 4, center, center, radius)
      segGrad.addColorStop(0, segment.color)
      segGrad.addColorStop(0.45, segment.color)
      segGrad.addColorStop(0.85, '#120a1e')
      segGrad.addColorStop(1, '#06040c')
      ctx.fillStyle = segGrad
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.lineTo(
        center + Math.cos(endAngle) * radius,
        center + Math.sin(endAngle) * radius,
      )
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'
      ctx.lineWidth = Math.max(1.5, size * 0.004)
      ctx.stroke()

      drawSegmentContent(ctx, center, radius, midAngle, segment, segmentAngle)
    })

    const teaseLights =
      (!wheelPowered && spinsCompleted === 0 && !thirdBonusReady) ||
      (thirdBonusReady && !bonusArmed)
    const wheelLit = wheelPowered && (!thirdBonusReady || bonusArmed)
    const rimLive = wheelLit || teaseLights
    const outerRadius = radius + rim
    const ringWidth = Math.max(8, Math.floor(size * (isSpinning ? 0.055 : 0.032)))

    // Aro dorado exterior
    ctx.beginPath()
    ctx.arc(center, center, outerRadius + ringWidth * 0.35, 0, 2 * Math.PI)
    ctx.strokeStyle = isSpinning
      ? 'rgba(255,215,0,0.55)'
      : rimLive
        ? teaseLights
          ? 'rgba(255,215,0,0.18)'
          : 'rgba(255,215,0,0.28)'
        : 'rgba(255,215,0,0.1)'
    ctx.lineWidth = Math.max(2, size * 0.006)
    ctx.stroke()

    // Luces en el borde
    const lightCount = 24
    for (let i = 0; i < lightCount; i++) {
      const a = (i / lightCount) * 2 * Math.PI + rotation * 0.15
      const lx = center + Math.cos(a) * (outerRadius + ringWidth * 0.15)
      const ly = center + Math.sin(a) * (outerRadius + ringWidth * 0.15)
      const lit =
        rimLive &&
        (isSpinning
          ? i % 2 === Math.floor((rotation * 4) % 2)
          : teaseLights
            ? i % 5 === 1 || i % 5 === 3
            : i % 3 === 0)
      ctx.beginPath()
      ctx.arc(lx, ly, Math.max(2, size * 0.008), 0, 2 * Math.PI)
      ctx.fillStyle = !rimLive
        ? 'rgba(60,48,80,0.35)'
        : lit
          ? 'rgba(255,215,0,0.95)'
          : teaseLights
            ? 'rgba(179,136,255,0.5)'
            : 'rgba(179,136,255,0.35)'
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(center, center, outerRadius, 0, 2 * Math.PI)
    ctx.lineWidth = ringWidth
    if (isSpinning) {
      ctx.strokeStyle = 'rgba(0,229,255,0.35)'
      ctx.shadowBlur = 32
      ctx.shadowColor = 'rgba(0,229,255,0.4)'
    } else if (wheelLit) {
      ctx.strokeStyle = 'rgba(179,136,255,0.3)'
      ctx.shadowBlur = 16
      ctx.shadowColor = 'rgba(179,136,255,0.25)'
    } else {
      ctx.strokeStyle = 'rgba(80,64,110,0.2)'
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    if (isSpinning) {
      const sweepLen = Math.PI * 0.75
      const sweepStart = -rotation % (Math.PI * 2)
      ctx.beginPath()
      ctx.lineWidth = Math.max(5, size * 0.018)
      ctx.strokeStyle = 'rgba(0,229,255,0.25)'
      ctx.arc(center, center, outerRadius, sweepStart - sweepLen / 2, sweepStart + sweepLen / 2)
      ctx.stroke()
    }

    // Hub central
    ctx.beginPath()
    ctx.arc(center, center, hubRadius + 4, 0, 2 * Math.PI)
    ctx.fillStyle = '#1a1028'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,215,0,0.45)'
    ctx.lineWidth = Math.max(2, size * 0.005)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(center, center, hubRadius, 0, 2 * Math.PI)
    const hubGrad = ctx.createRadialGradient(
      center - hubRadius * 0.2,
      center - hubRadius * 0.2,
      2,
      center,
      center,
      hubRadius,
    )
    hubGrad.addColorStop(0, '#2a1840')
    hubGrad.addColorStop(0.6, '#0e0816')
    hubGrad.addColorStop(1, '#050308')
    ctx.fillStyle = hubGrad
    ctx.fill()

    const centerGlow = ctx.createRadialGradient(center, center, 4, center, center, hubRadius + 8)
    centerGlow.addColorStop(0, 'rgba(179,136,255,0.5)')
    centerGlow.addColorStop(1, 'rgba(179,136,255,0)')
    ctx.fillStyle = centerGlow
    ctx.fill()

    ctx.font = `${Math.max(18, Math.floor(hubRadius * 0.95))}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🔮', center, center - 1)
  }, [
    rotation,
    segmentAngle,
    isSpinning,
    wheelSize,
    wheelPowered,
    thirdBonusReady,
    bonusArmed,
    spinsCompleted,
  ])

  const spin = (
    targetSegmentIndex: number,
    phase: SpinPhase,
    meta?: { accumulatedBeforeThird?: number },
  ) => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult(null)

    const targetRotation = computeTargetRotationForSegment(
      rotation,
      targetSegmentIndex,
      segmentAngle,
    )

    const duration = phase === '3b' ? 3500 : 4000
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
        let newWinnings = winnings
        let message = ''
        let label = segment.label
        let color = segment.color

        if (phase === 1) {
          newWinnings = 0
          label = 'NADA'
          color = '#ff6b6b'
          message =
            'Primer premio: el portal no entregó fichas esta vez. Probá de nuevo en la segunda vuelta.'
          setSpinsCompleted(1)
          try {
            localStorage.setItem(LS_SPINS, '1')
          } catch {
            // ignore
          }
        } else if (phase === 2) {
          if (segment.isMysteryBox) {
            newWinnings = 15
            message = '¡Segundo premio! Caja misteriosa: sumaste $15 USD al acumulado.'
            label = 'CAJA MISTERIOSA'
          } else if (segment.isFortuneCookie) {
            newWinnings = 5
            message = '¡Segundo premio! La suerte te dejó $5 USD en el acumulado.'
            label = '$5'
          } else {
            newWinnings = segment.value
            message = `¡Segundo premio! Ganaste $${segment.value} USD. Quedó en tu acumulado.`
          }
          setSpinsCompleted(2)
          try {
            localStorage.setItem(LS_SPINS, '2')
          } catch {
            // ignore
          }
        } else if (phase === '3a') {
          const prevAccum = meta?.accumulatedBeforeThird ?? winnings
          newWinnings = 0
          label = 'NADA'
          color = '#ff6b6b'
          message = `Tercer premio: cayó en NADA. Se retiró tu acumulado de $${prevAccum.toFixed(2)} USD. El portal activa un bonus…`
          setThirdBonusReady(true)
          try {
            localStorage.setItem(LS_THIRD_BONUS, '1')
            localStorage.setItem(LS_WINNINGS, '0')
          } catch {
            // ignore
          }
        } else if (phase === '3b') {
          newWinnings = 0
          label = 'GALLETA DE LA SUERTE'
          color = '#ffd700'
          message =
            'Bonus del tercer premio: tu galleta de la suerte digital está lista. Ciclo completado.'
          setSpinsCompleted(3)
          setThirdBonusReady(false)
          setPendingPaidSpin(false)
          try {
            localStorage.setItem(LS_SPINS, '3')
            localStorage.removeItem(LS_PENDING)
            localStorage.removeItem(LS_THIRD_BONUS)
          } catch {
            // ignore
          }
        }

        setResult({ label, message, color })

        if (phase !== '3a') {
          setWinnings(newWinnings)
        } else {
          setWinnings(0)
        }
      }
    }

    requestAnimationFrame(animate)
  }

  const needsPayForThird =
    spinsCompleted === 2 && !pendingPaidSpin && !thirdBonusReady
  const canSpinThirdFirst =
    spinsCompleted === 2 && pendingPaidSpin && !thirdBonusReady
  const canSpinThirdBonus = thirdBonusReady && spinsCompleted === 2
  const pathComplete = spinsCompleted >= TOTAL_ATTEMPTS
  const currentAttempt = thirdBonusReady
    ? 3
    : Math.min(spinsCompleted + 1, TOTAL_ATTEMPTS)

  const handleLocalUnlockThird = () => {
    if (!isLocalPlay()) return
    if (pathComplete) return
    if (spinsCompleted < 2) return
    setPendingPaidSpin(true)
    setThirdBonusReady(false)
    try {
      localStorage.setItem(LS_PENDING, '1')
      localStorage.removeItem(LS_THIRD_BONUS)
    } catch {
      // ignore
    }
  }

  const handleLocalReset = () => {
    if (!isLocalPlay()) return
    resetFullCycle()
  }

  const nothingIndex = WHEEL_SEGMENTS.findIndex((s) => s.isNothing)
  const fortuneIndex = WHEEL_SEGMENTS.findIndex((s) => s.isFortuneCookie)

  const needsMainPowerOn =
    spinsCompleted === 0 && !wheelPowered && !pathComplete && !thirdBonusReady
  const wheelLit = wheelPowered && (!thirdBonusReady || bonusArmed)
  const marqueeActive = wheelLit || isSpinning
  const standbyTease = needsMainPowerOn
  const lightsOn = marqueeActive || standbyTease
  const lightsFrantic =
    isSpinning || (thirdBonusReady && bonusArmed) || (standbyTease && !marqueeActive)

  const handlePrimary = async () => {
    if (isSpinning) return

    if (pathComplete) {
      resetFullCycle()
      return
    }

    if (canSpinThirdBonus) {
      const paidBonus = await ensureThirdPaid()
      if (!paidBonus) {
        setPendingPaidSpin(false)
        setThirdBonusReady(false)
        try {
          localStorage.removeItem(LS_PENDING)
          localStorage.removeItem(LS_THIRD_BONUS)
        } catch {
          // ignore
        }
        onRequestPay(
          'mystika-ruleta-tercera',
          '3ER PREMIO — RULETA',
          'Pago de $1 para el tercer premio: primero NADA (se retira el acumulado) y bonus con galleta de la suerte.',
        )
        return
      }
      if (!bonusArmed) setBonusArmed(true)
      spin(fortuneIndex, '3b')
      return
    }

    if (needsMainPowerOn) {
      setWheelPowered(true)
      spin(nothingIndex, 1)
      return
    }

    if (currentAttempt === 1) {
      spin(nothingIndex, 1)
      return
    }

    if (currentAttempt === 2) {
      const winningSegments = WHEEL_SEGMENTS.filter(
        (s) => !s.isNothing && !s.isFortuneCookie,
      )
      const randomWin =
        winningSegments[Math.floor(Math.random() * winningSegments.length)]
      spin(WHEEL_SEGMENTS.indexOf(randomWin), 2)
      return
    }

    if (currentAttempt === 3) {
      if (needsPayForThird) {
        onRequestPay(
          'mystika-ruleta-tercera',
          '3ER PREMIO — RULETA',
          'Pago de $1 para el tercer premio: primero NADA (se retira el acumulado) y bonus con galleta de la suerte.',
        )
        return
      }
      if (canSpinThirdFirst) {
        const paidThird = await ensureThirdPaid()
        if (!paidThird) {
          setPendingPaidSpin(false)
          try {
            localStorage.removeItem(LS_PENDING)
          } catch {
            // ignore
          }
          onRequestPay(
            'mystika-ruleta-tercera',
            '3ER PREMIO — RULETA',
            'Pago de $1 para el tercer premio: primero NADA (se retira el acumulado) y bonus con galleta de la suerte.',
          )
          return
        }
        spin(nothingIndex, '3a', { accumulatedBeforeThird: winnings })
      }
    }
  }

  const buttonLabel = (() => {
    if (isSpinning) return 'GIRANDO...'
    if (pathComplete) return 'JUGAR DE NUEVO'
    if (canSpinThirdBonus) return 'GIRAR BONUS'
    if (needsMainPowerOn) return 'GIRAR — 1ER PREMIO'
    if (currentAttempt === 1) return 'GIRAR — 1ER PREMIO'
    if (currentAttempt === 2) return 'GIRAR — 2DO PREMIO'
    if (needsPayForThird) return 'PAGAR $1 — 3ER PREMIO'
    return 'GIRAR — 3ER PREMIO'
  })()

  const buttonStyle = (() => {
    if (pathComplete) {
      return {
        background: 'linear-gradient(135deg,var(--mystik3),var(--mystik))',
        boxShadow: '0 4px 15px rgba(179,136,255,.35)',
      }
    }
    if (canSpinThirdBonus) {
      return {
        background: 'linear-gradient(135deg,#ffd700,#ffb347)',
        boxShadow: '0 4px 20px rgba(255,215,0,.45)',
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

  const stepMeta = [
    { n: 1, title: 'Primer premio' },
    { n: 2, title: 'Segundo premio' },
    { n: 3, title: 'Tercer premio' },
  ] as const

  return (
    <div className="animate-[fadeup_0.4s_ease] max-w-[640px] mx-auto w-full">
      <div className="text-center py-1.5 pb-4 px-1">
        <div className="font-mono text-[10px] sm:text-[11px] tracking-[4px] text-[var(--mystik3)] flex items-center justify-center gap-3 mb-2">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          RULETA DEL DESTINO
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-2 text-[var(--txt)]"
          style={{ fontSize: 'clamp(30px,8vw,52px)' }}
        >
          Gira y{' '}
          <span
            className="text-[var(--mystik)]"
            style={{ textShadow: '0 0 24px rgba(179,136,255,0.45)' }}
          >
            descubre
          </span>
        </h2>
      </div>

      {/* Progreso de intentos */}
      <div className="mb-5 px-1">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {stepMeta.map((step) => {
            const done =
              step.n === 1
                ? spinsCompleted >= 1
                : step.n === 2
                  ? spinsCompleted >= 2
                  : spinsCompleted >= 3 || thirdBonusReady
            const active =
              !pathComplete &&
              (thirdBonusReady ? step.n === 3 : currentAttempt === step.n)
            const isBonusStep = step.n === 3 && thirdBonusReady
            const lightVariant = isBonusStep
              ? 'bonus'
              : active
                ? 'active'
                : done
                  ? 'done'
                  : 'idle'
            return (
              <div
                key={step.n}
                className={[
                  'relative overflow-hidden rounded-xl border px-1.5 py-1.5 sm:px-2 sm:py-2 text-center transition-all duration-300',
                  'border-transparent',
                  !active && !done && !isBonusStep ? 'opacity-80' : '',
                ].join(' ')}
                style={{
                  background: 'var(--bg2)',
                  boxShadow: ruletaStepNeonShadow(lightVariant),
                }}
              >
                <RuletaStepLights variant={lightVariant} />
                <div
                  className="relative z-[1] rounded-[9px] px-1.5 py-2 sm:px-2 sm:py-2.5"
                  style={{
                    background: 'rgba(6,4,12,0.55)',
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  <div
                    className={[
                      'font-mono text-[9px] sm:text-[10px] tracking-[2px] mb-1 font-semibold',
                      active || isBonusStep
                        ? 'text-[#00ff9d]'
                        : done
                          ? 'text-[var(--mystik3)]'
                          : 'text-[var(--mystik3)]',
                    ].join(' ')}
                  >
                    VUELTA {step.n}
                  </div>
                  <div className="font-display font-bold text-[13px] sm:text-[14px] text-[var(--txt)]">
                    {step.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Escenario de la ruleta */}
      <div
        className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg2)] p-3 sm:p-5 mb-5 transition-all duration-500 overflow-hidden"
        style={{
          background: lightsOn
            ? thirdBonusReady
              ? 'linear-gradient(180deg, rgba(255,215,0,0.1) 0%, rgba(179,136,255,0.08) 35%, var(--bg2) 100%)'
              : 'linear-gradient(180deg, rgba(179,136,255,0.12) 0%, rgba(255,45,120,0.06) 38%, var(--bg2) 100%)'
            : 'linear-gradient(180deg, rgba(179,136,255,0.03) 0%, var(--bg2) 35%, var(--bg2) 100%)',
          boxShadow: lightsOn
            ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.3), 0 0 56px rgba(179,136,255,0.22), 0 0 48px rgba(255,45,120,0.08)'
            : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.25)',
          borderColor: lightsOn
            ? thirdBonusReady
              ? 'rgba(255,215,0,0.4)'
              : 'rgba(179,136,255,0.45)'
            : undefined,
        }}
      >
        <RuletaStageAtmosphere
          live={marqueeActive}
          tease={standbyTease && !marqueeActive}
          gold={thirdBonusReady}
        />
        {marqueeActive && !isSpinning && (
          <div
            className="mb-3 mx-auto w-fit max-w-full px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-center animate-[fadeup_0.35s_ease]"
            style={{
              background: thirdBonusReady
                ? 'rgba(255,215,0,0.14)'
                : 'rgba(0,255,157,0.16)',
              border: `2px solid ${thirdBonusReady ? 'rgba(255,215,0,0.55)' : 'rgba(0,255,157,0.55)'}`,
              boxShadow: thirdBonusReady
                ? '0 0 28px rgba(255,215,0,0.25)'
                : '0 0 28px rgba(0,255,157,0.3)',
            }}
          >
            <p
              className="font-mono font-black tracking-[0.18em] sm:tracking-[0.22em]"
              style={{
                fontSize: 'clamp(14px, 4vw, 18px)',
                color: thirdBonusReady ? '#ffd700' : '#00ff9d',
                textShadow: thirdBonusReady
                  ? '0 0 20px rgba(255,215,0,0.65)'
                  : '0 0 20px rgba(0,255,157,0.65)',
              }}
            >
              {thirdBonusReady ? '★ BONUS ENCENDIDO ★' : '★ RULETA ENCENDIDA ★'}
            </p>
          </div>
        )}

        <div className="relative z-[1] flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-3 max-w-[min(100%,600px)] mx-auto">
          <RuletaSideRail
            side="left"
            active={lightsOn}
            frantic={lightsFrantic}
            currentAttempt={currentAttempt}
            spinsCompleted={spinsCompleted}
            thirdBonusReady={thirdBonusReady}
            className="min-h-[min(72vw,340px)]"
          />

          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <RuletaLedBar
              position="top"
              active={lightsOn}
              frantic={lightsFrantic}
              currentAttempt={currentAttempt}
              spinsCompleted={spinsCompleted}
              thirdBonusReady={thirdBonusReady}
            />

            <OrbMarqueeLights
              active={lightsOn}
              frantic={lightsFrantic}
              premium={marqueeActive}
              hideBulbs
              square
              className="w-full"
            >
        <div ref={wrapperRef} className="relative w-full flex justify-center items-center py-2 sm:py-3">
          {/* Puntero — sin filter en el contenedor (evita el cuadrado oscuro) */}
          <div
            className="absolute top-0 left-1/2 z-20 pointer-events-none"
            style={{
              marginTop: 'clamp(-6px, -1vw, -2px)',
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className="flex flex-col items-center"
              style={{
                animation:
                  isSpinning || marqueeActive
                    ? 'glow-pulse 0.8s ease-in-out infinite'
                    : standbyTease
                      ? 'glow-pulse 1.6s ease-in-out infinite'
                      : undefined,
              }}
            >
              <div
                className="w-0 h-0 transition-[border-color] duration-300"
                style={{
                  borderLeft: 'clamp(18px, 5vw, 26px) solid transparent',
                  borderRight: 'clamp(18px, 5vw, 26px) solid transparent',
                  borderTop: `clamp(28px, 7.5vw, 38px) solid ${marqueeActive || standbyTease ? '#00ff9d' : '#8a7aa8'}`,
                  filter:
                    marqueeActive || standbyTease
                      ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 18px rgba(0,255,157,0.95))'
                      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
                }}
              />
              <div
                className="rounded-full -mt-1.5"
                style={{
                  width: 'clamp(12px, 3.2vw, 16px)',
                  height: 'clamp(12px, 3.2vw, 16px)',
                  background: marqueeActive || standbyTease ? '#00ff9d' : '#6a5a88',
                  boxShadow:
                    marqueeActive || standbyTease
                      ? '0 0 14px #00ff9d, 0 0 24px rgba(0,255,157,0.45)'
                      : undefined,
                }}
              />
            </div>
          </div>

          <div
            className="absolute rounded-full pointer-events-none transition-opacity duration-500"
            style={{
              inset: 'clamp(-12px, -4vw, -28px)',
              background: marqueeActive
                ? 'radial-gradient(circle, rgba(179,136,255,0.22) 0%, transparent 68%)'
                : 'radial-gradient(circle, rgba(80,64,110,0.08) 0%, transparent 68%)',
              animation:
                isSpinning || marqueeActive
                  ? 'glow-pulse 1.4s ease-in-out infinite'
                  : standbyTease
                    ? 'glow-pulse 2s ease-in-out infinite'
                    : 'none',
              opacity: marqueeActive ? 1 : standbyTease ? 0.65 : 0.4,
            }}
          />

          {marqueeActive && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none z-[5]"
              style={{
                boxShadow:
                  'inset 0 0 40px rgba(255,215,0,0.08), inset 0 0 80px rgba(179,136,255,0.12)',
                animation: 'glow-pulse 2.2s ease-in-out infinite',
              }}
            />
          )}

          <canvas
            ref={canvasRef}
            width={wheelSize}
            height={wheelSize}
            className="rounded-full relative z-10 max-w-full h-auto transition-[box-shadow,filter] duration-500"
            style={{
              width: wheelSize,
              height: wheelSize,
              filter: marqueeActive ? 'none' : 'brightness(0.72) saturate(0.85)',
              boxShadow: isSpinning
                ? '0 0 100px rgba(0,229,255,0.2), inset 0 0 40px rgba(0,0,0,0.5)'
                : marqueeActive
                  ? thirdBonusReady
                    ? '0 0 56px rgba(255,215,0,0.35), inset 0 0 28px rgba(0,0,0,0.55)'
                    : '0 0 48px rgba(179,136,255,0.35), inset 0 0 28px rgba(0,0,0,0.55)'
                  : '0 0 24px rgba(60,48,80,0.2), inset 0 0 28px rgba(0,0,0,0.65)',
            }}
          />
        </div>
            </OrbMarqueeLights>

            <RuletaLedBar
              position="bottom"
              active={lightsOn}
              frantic={lightsFrantic}
              currentAttempt={currentAttempt}
              spinsCompleted={spinsCompleted}
              thirdBonusReady={thirdBonusReady}
            />
          </div>

          <RuletaSideRail
            side="right"
            active={lightsOn}
            frantic={lightsFrantic}
            currentAttempt={currentAttempt}
            spinsCompleted={spinsCompleted}
            thirdBonusReady={thirdBonusReady}
            className="min-h-[min(72vw,340px)]"
          />
        </div>

        {/* Stats */}
        <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono font-bold tracking-[1px]"
            style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              borderColor: pathComplete ? 'rgba(0,255,157,0.4)' : 'rgba(0,255,157,0.35)',
              background: 'rgba(0,255,157,0.1)',
              color: '#00ff9d',
              boxShadow: '0 0 16px rgba(0,255,157,0.15)',
            }}
          >
            <span style={{ textShadow: '0 0 8px rgba(0,255,157,0.5)' }}>◆</span>
            {pathComplete ? '3 / 3 completado' : `Intento ${currentAttempt} / ${TOTAL_ATTEMPTS}`}
          </span>
          {winnings > 0 && (
            <span
              className="inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold tracking-[1px]"
              style={{
                borderColor: 'rgba(0,255,157,0.35)',
                background: 'rgba(0,255,157,0.08)',
                color: '#00ff9d',
              }}
            >
              ${winnings.toFixed(2)} acumulado
            </span>
          )}
          {winnings > 0 && winnings < 30 && (
            <span className="text-[10px] text-[var(--txt3)] font-mono w-full text-center sm:w-auto">
              Retiro desde $30
            </span>
          )}
        </div>

        {thirdBonusReady && !isSpinning && (
          <div
            className="mt-4 mb-2 rounded-xl border px-4 py-3 text-center animate-[fadeup_0.35s_ease]"
            style={{
              borderColor: 'rgba(255,215,0,0.45)',
              background: 'rgba(255,215,0,0.08)',
              boxShadow: '0 0 24px rgba(255,215,0,0.15)',
            }}
          >
            <p className="font-mono text-[10px] tracking-[3px] text-[var(--gold)] mb-1">
              ✦ BONUS DESBLOQUEADO
            </p>
            <p className="text-[12px] text-[var(--txt2)] leading-relaxed">
              Bonus listo. Tocá GIRAR BONUS para tu galleta de la suerte.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handlePrimary}
          disabled={isSpinning}
          className="mt-4 w-full min-h-[56px] py-4 px-4 rounded-xl font-display font-black tracking-[1px] text-[var(--bg0)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{
            fontSize: 'clamp(17px, 4.5vw, 20px)',
            ...buttonStyle,
            ...(isSpinning
              ? { animation: 'glow-pulse 0.9s ease-in-out infinite' }
              : canSpinThirdBonus
                ? { animation: 'glow-pulse 1.15s ease-in-out infinite' }
                : marqueeActive
                  ? { animation: 'glow-pulse 2.4s ease-in-out infinite' }
                  : {}),
          }}
        >
          {buttonLabel}
        </button>

        {(isLocalHost || devTestEnabled) && (
          <div className="mt-3 flex flex-col items-center gap-2">
            {!pathComplete ? (
              <DevTestButton
                onClick={handleLocalUnlockThird}
                label={isLocalHost ? 'PROBAR (local)' : 'PROBAR PAGO LOCAL'}
              />
            ) : (
              <DevTestButton onClick={handleLocalReset} label="REINICIAR RUEDA" />
            )}
          </div>
        )}
      </div>

      {result && (
        <div
          className="rounded-xl border p-5 sm:p-6 text-center relative overflow-hidden mb-5 animate-[fadeup_0.35s_ease]"
          style={{
            borderColor: result.color,
            background:
              'linear-gradient(160deg, rgba(179,136,255,0.08) 0%, var(--bg2) 50%)',
            animation: 'reveal-message 0.6s ease-out',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${result.color}, transparent)`,
            }}
          />
          <div
            className="inline-block py-1.5 px-4 rounded-full mb-3 font-display font-bold text-[14px] sm:text-[15px]"
            style={{ background: result.color, color: '#0a0612' }}
          >
            {result.label}
          </div>
          <p className="text-[15px] sm:text-[16px] text-[var(--txt)] leading-[1.75] italic max-w-[400px] mx-auto">
            &ldquo;{result.message}&rdquo;
          </p>
        </div>
      )}

      {/* Ganadores en vivo */}
      <div className="px-1 mt-2">
        <RuletaLiveFeed />
      </div>
    </div>
  )
}
