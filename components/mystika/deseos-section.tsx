'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Deseo } from '@/lib/deseos-pool'

type DeseosStatus = {
  locked: boolean
  name?: string
  deseos?: Deseo[]
  lockedUntil?: string
  remainingMs?: number
  reason?: 'ip_cooldown'
}

async function fetchDeseosStatus(): Promise<DeseosStatus> {
  const res = await fetch('/api/deseos', { credentials: 'include', cache: 'no-store' })
  if (!res.ok) return { locked: false }
  return res.json()
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function applyLockedStatus(
  status: DeseosStatus,
  setName: (n: string) => void,
  setDeseos: (d: Deseo[]) => void,
  setPhase: (p: 'idle' | 'revealing' | 'done') => void,
  setLockedUntil: (t: number | null) => void,
) {
  if (!status.locked || !status.lockedUntil) return false
  const until = new Date(status.lockedUntil).getTime()
  if (until <= Date.now()) return false
  if (status.name) setName(status.name)
  if (status.deseos?.length === 3) setDeseos(status.deseos)
  setPhase('done')
  setLockedUntil(until)
  return true
}

export function DeseosSection() {
  const [name, setName]           = useState('')
  const [phase, setPhase]         = useState<'idle' | 'revealing' | 'done'>('idle')
  const [deseos, setDeseos]       = useState<Deseo[]>([])
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [ready, setReady] = useState(false)

  const syncFromServer = useCallback(async () => {
    const status = await fetchDeseosStatus()
    if (applyLockedStatus(status, setName, setDeseos, setPhase, setLockedUntil)) {
      return status
    }
    setLockedUntil(null)
    setDeseos([])
    setPhase((p) => (p === 'done' ? 'idle' : p))
    return status
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await syncFromServer()
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [syncFromServer])

  useEffect(() => {
    if (!lockedUntil) return
    const tick = () => {
      const remaining = lockedUntil - Date.now()
      if (remaining <= 0) {
        setLockedUntil(null)
        setPhase('idle')
        setDeseos([])
        setUnlocked(true)
        setCountdown('')
        syncFromServer()
        setTimeout(() => setUnlocked(false), 3000)
        return
      }
      setCountdown(formatCountdown(remaining))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockedUntil, syncFromServer])

  const handleReveal = useCallback(async () => {
    if (!name.trim() || phase !== 'idle') return
    setPhase('revealing')
    await new Promise((r) => setTimeout(r, 1800))
    try {
      const res = await fetch('/api/deseos', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = (await res.json()) as DeseosStatus & { error?: string }
      if (applyLockedStatus(data, setName, setDeseos, setPhase, setLockedUntil)) {
        return
      }
      if (!res.ok) {
        setPhase('idle')
        return
      }
      if (data.deseos?.length === 3 && data.name) {
        setName(data.name)
        setDeseos(data.deseos)
        setPhase('done')
        if (data.lockedUntil) setLockedUntil(new Date(data.lockedUntil).getTime())
      }
    } catch {
      setPhase('idle')
    }
  }, [name, phase])

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  if (!ready) {
    return (
      <div className="animate-[fadeup_0.4s_ease] text-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--mystik)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-[12px] tracking-[2px] text-[var(--txt2)]">CONECTANDO CON EL PORTAL...</p>
      </div>
    )
  }

  return (
    <div className="animate-[fadeup_0.4s_ease]">

      {/* Header */}
      <div className="text-center py-1.5 pb-6">
        <div className="font-mono text-[11px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-3">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          PORTAL DE DESEOS
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-3"
          style={{ fontSize: 'clamp(30px,7vw,52px)' }}
        >
          Tus{' '}
          <span className="text-[var(--gold)]" style={{ textShadow: '0 0 28px rgba(255,215,0,.6)' }}>
            3 Deseos
          </span>{' '}
          del día
        </h2>
        <p className="text-[15px] text-[var(--txt2)] max-w-[420px] mx-auto leading-[1.8] font-light">
          Escribí tu nombre y el universo te revelará 3 mensajes positivos personalizados. Una vez por día.
        </p>
      </div>

      {/* ── UNLOCKED celebration ── */}
      {unlocked && (
        <div
          className="text-center py-4 mb-5 rounded-xl animate-[fadeup_0.4s_ease]"
          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)' }}
        >
          <p className="text-[16px] font-bold text-[var(--gold)]">✨ ¡Tus deseos se renovaron! Ya podés pedir tus 3 deseos del día.</p>
        </div>
      )}

      {/* ── INPUT + CTA (cuando no está bloqueado) ── */}
      {!isLocked && phase !== 'done' && (
        <div className="max-w-[480px] mx-auto animate-[fadeup_0.3s_ease]">
          {/* Orb visual */}
          <div className="flex justify-center mb-7">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.05) 70%)',
                boxShadow: phase === 'revealing'
                  ? '0 0 80px rgba(255,215,0,0.6)'
                  : '0 0 35px rgba(255,215,0,0.25)',
                border: '2px solid rgba(255,215,0,0.3)',
                transition: 'box-shadow 0.4s ease',
                animation: phase === 'revealing' ? 'pulse 0.5s ease-in-out infinite' : undefined,
              }}
            >
              {phase === 'revealing' ? '🌀' : '✨'}
            </div>
          </div>

          {/* Name input */}
          <div className="mb-4">
            <label className="font-mono text-[12px] tracking-[3px] text-[var(--mystik3)] block mb-2">
              TU NOMBRE
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReveal()}
              placeholder="Escribí tu nombre..."
              maxLength={40}
              disabled={phase === 'revealing'}
              className="w-full px-5 py-4 rounded-xl text-[16px] text-[var(--txt)] placeholder:text-[var(--txt3)] outline-none transition-all"
              style={{
                background: 'var(--bg2)',
                border: name.trim()
                  ? '2px solid rgba(255,215,0,0.5)'
                  : '2px solid var(--border)',
                boxShadow: name.trim() ? '0 0 16px rgba(255,215,0,0.1)' : 'none',
              }}
            />
          </div>

          {/* CTA */}
          <button
            onClick={handleReveal}
            disabled={!name.trim() || phase === 'revealing'}
            className="w-full py-5 rounded-xl font-mono text-[15px] tracking-[3px] font-black transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, #cc9900, #ffd700, #ffeb80, #ffd700)'
                : 'var(--bg2)',
              backgroundSize: '200% auto',
              animation: name.trim() ? 'ctamove 3s linear infinite' : undefined,
              color: name.trim() ? '#0a0612' : 'var(--txt3)',
              boxShadow: name.trim() ? '0 6px 28px rgba(255,215,0,0.4)' : 'none',
              border: name.trim() ? 'none' : '2px solid var(--border)',
            }}
          >
            {phase === 'revealing' ? (
              <>
                <div className="w-5 h-5 border-2 border-[#0a0612] border-t-transparent rounded-full animate-spin" />
                <span>EL UNIVERSO ESCUCHA...</span>
              </>
            ) : (
              <>
                <span className="text-xl">✨</span>
                <span>REVELAR MIS 3 DESEOS</span>
              </>
            )}
          </button>

          <p className="text-center text-[13px] text-[var(--txt3)] mt-3 font-mono">
            ✦ Gratuito · Una vez cada 24 horas ✦
          </p>
        </div>
      )}

      {/* ── RESULTADOS (después de revelar) ── */}
      {phase === 'done' && deseos.length > 0 && (
        <div className="animate-[fadeup_0.5s_ease]">
          <div className="font-mono text-[13px] sm:text-[14px] tracking-[3px] text-[var(--mystik)] text-center mb-6 font-medium">
            ✦ LOS 3 MENSAJES DEL UNIVERSO PARA {name.toUpperCase()} ✦
          </div>

          <div className="flex flex-col gap-5 mb-7">
            {deseos.map((d, i) => (
              <div
                key={i}
                className="rounded-xl p-6 sm:p-7 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${d.color}10 0%, var(--bg2) 100%)`,
                  border: `1px solid ${d.color}40`,
                  boxShadow: `0 0 24px ${d.color}15`,
                  animation: `fadeup 0.4s ease ${i * 0.15}s both`,
                }}
              >
                {/* Top shimmer */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${d.color}, transparent)` }}
                />

                <div className="flex items-center gap-3.5 mb-4">
                  {/* Number */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-[17px] flex-shrink-0"
                    style={{ background: `${d.color}20`, color: d.color, border: `1px solid ${d.color}40` }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-3xl">{d.icon}</span>
                  <span
                    className="font-mono text-[13px] sm:text-[14px] tracking-[2px] font-black"
                    style={{ color: d.color }}
                  >
                    {d.area}
                  </span>
                </div>

                <p
                  className="text-[var(--txt)] font-medium leading-[1.75]"
                  style={{ fontSize: 'clamp(17px, 4.2vw, 20px)' }}
                >
                  {d.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLocked && (
        <div
          className="rounded-2xl p-6 text-center animate-[fadeup_0.5s_ease] max-w-[480px] mx-auto mt-2"
          style={{
            background: 'linear-gradient(135deg, rgba(179,136,255,0.06) 0%, rgba(10,6,18,0.95) 100%)',
            border: '1px solid rgba(179,136,255,0.2)',
          }}
        >
              <div className="text-4xl mb-3">🔒</div>
              <div
                className="font-display font-black text-[var(--txt)] mb-2"
                style={{ fontSize: 'clamp(20px, 5vw, 26px)' }}
              >
                Deseos del día completados
              </div>
              <p className="text-[16px] sm:text-[17px] text-[var(--txt2)] mb-4">
                Tus deseos se renuevan en:
              </p>
              {/* Countdown */}
              <div
                className="inline-flex items-center gap-1 px-6 py-3 rounded-xl mb-4"
                style={{
                  background: 'rgba(179,136,255,0.1)',
                  border: '2px solid rgba(179,136,255,0.3)',
                }}
              >
                {(countdown || '00:00:00').split(':').map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="font-mono text-[24px] sm:text-[28px] text-[var(--mystik)] font-bold">:</span>}
                    <span
                      className="font-display font-black text-[var(--mystik)]"
                      style={{
                        fontSize: 'clamp(32px, 8vw, 44px)',
                        textShadow: '0 0 16px rgba(179,136,255,0.5)',
                        minWidth: '52px',
                        textAlign: 'center',
                      }}
                    >
                      {part}
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex justify-center gap-6 sm:gap-8 font-mono text-[12px] sm:text-[13px] text-[var(--txt2)] tracking-[2px] font-medium">
                <span>HORAS</span>
                <span>MIN</span>
                <span>SEG</span>
              </div>
              <p className="text-[14px] sm:text-[15px] text-[var(--txt2)] mt-5 font-mono">
                ✦ Volvé mañana para recibir nuevos mensajes del universo ✦
              </p>
        </div>
      )}

    </div>
  )
}
