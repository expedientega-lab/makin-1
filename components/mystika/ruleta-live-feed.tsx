'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  initialRuletaTableCount,
  initialRuletaWinsPerMin,
  pickRuletaAnonWin,
  pickRuletaPlayer,
  pickRuletaPlayingLine,
  pickRuletaWin,
  pickSecsAgo,
  RULETA_LIVE_PLAYER_COUNT,
  rnd,
} from '@/lib/ruleta-live-data'

type FeedEvent =
  | {
      id: number
      kind: 'won'
      flag: string
      user: string
      icon: string
      prize: string
      color: string
      hot?: boolean
      anon?: boolean
      anonLine?: string
      secsAgo: number
    }
  | {
      id: number
      kind: 'playing'
      flag: string
      line: string
      secsAgo: number
    }

let feedId = 0

function buildRuletaEvent(winBias = 0.42): FeedEvent {
  const p = pickRuletaPlayer()

  if (Math.random() < winBias) {
    const w = pickRuletaWin()
    const anon = Math.random() < 0.12
    return {
      id: ++feedId,
      kind: 'won',
      flag: p.flag,
      user: anon ? '' : p.handle,
      icon: w.icon,
      prize: w.label,
      color: w.color,
      hot: w.hot,
      anon,
      anonLine: anon ? pickRuletaAnonWin(p.flag, w.icon, w.label) : undefined,
      secsAgo: pickSecsAgo(),
    }
  }

  return {
    id: ++feedId,
    kind: 'playing',
    flag: p.flag,
    line: pickRuletaPlayingLine(p),
    secsAgo: pickSecsAgo(),
  }
}

const TICKER_LEN = 32

const TickerSegment = memo(function TickerSegment({ e }: { e: FeedEvent }) {
  if (e.kind === 'won') {
    if (e.anon && e.anonLine) {
      return (
        <span className="inline-flex items-center gap-1.5 shrink-0 pr-12">
          <span className="font-bold" style={{ color: e.color }}>
            {e.anonLine}
          </span>
          {e.hot && (
            <span className="font-mono text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-[rgba(255,45,120,0.2)] text-[#ff6b9d] border border-[rgba(255,45,120,0.45)]">
              HOT
            </span>
          )}
          <span className="text-[var(--txt3)] opacity-50">◆</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 shrink-0 pr-12">
        <span className="text-base leading-none">{e.flag}</span>
        <span className="text-[#ff6b9d] font-black">{e.user}</span>
        <span className="text-[#ffd700] font-black">GANÓ</span>
        <span className="font-bold" style={{ color: e.color }}>
          {e.icon} {e.prize}
        </span>
        {e.hot && (
          <span className="font-mono text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-[rgba(255,45,120,0.2)] text-[#ff6b9d] border border-[rgba(255,45,120,0.45)]">
            HOT
          </span>
        )}
        <span className="text-[var(--txt3)] opacity-50">◆</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0 pr-12 text-[var(--txt3)]">
      <span className="text-base leading-none opacity-90">{e.flag}</span>
      <span className="text-[var(--mystik)]">{e.line}</span>
      <span className="opacity-50">◆</span>
    </span>
  )
})

function TickerRow({ strip, duplicate }: { strip: FeedEvent[]; duplicate?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      {strip.map((e) => (
        <TickerSegment key={duplicate ? `dup-${e.id}` : e.id} e={e} />
      ))}
    </div>
  )
}

function SmoothRuletaTicker({ strip }: { strip: FeedEvent[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const halfWidthRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)

    const pxPerFrame = 0.4

    const tick = () => {
      const half = halfWidthRef.current
      if (half > 0) {
        offsetRef.current -= pxPerFrame
        if (-offsetRef.current >= half) {
          offsetRef.current += half
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [strip])

  const maskStyle = {
    maskImage:
      'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
  }

  return (
    <div
      className="relative overflow-hidden h-[24px] flex items-center flex-1 min-w-0"
      style={maskStyle}
    >
      <div
        ref={trackRef}
        className="flex w-max font-mono text-[10px] sm:text-[11px] leading-relaxed"
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      >
        <TickerRow strip={strip} />
        <TickerRow strip={strip} duplicate />
      </div>
    </div>
  )
}

function seedTickerStrip(count: number): FeedEvent[] {
  const items: FeedEvent[] = []
  let wins = 0
  for (let i = 0; i < count; i++) {
    const e = buildRuletaEvent(wins < 10 ? 0.58 : 0.42)
    if (e.kind === 'won') wins++
    items.push(e)
  }
  if (wins === 0) items.unshift(buildRuletaEvent(1))
  return items
}

interface RuletaLiveFeedProps {
  className?: string
}

export function RuletaLiveFeed({ className = '' }: RuletaLiveFeedProps) {
  const [tableCount, setTableCount] = useState(0)
  const [winsPerMin, setWinsPerMin] = useState(0)
  const tickerStrip = useMemo(() => seedTickerStrip(TICKER_LEN), [])
  const [pulse, setPulse] = useState(false)
  const [countFlash, setCountFlash] = useState(false)
  const prevCount = useRef(0)

  useEffect(() => {
    setTableCount(initialRuletaTableCount())
    setWinsPerMin(initialRuletaWinsPerMin())
  }, [])

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>
    const schedule = () => {
      if (Math.random() < 0.52) {
        setWinsPerMin((w) => Math.min(48, w + 1))
      }
      if (Math.random() < 0.14) {
        setPulse(true)
        window.setTimeout(() => setPulse(false), 1400)
      }
      tid = setTimeout(schedule, rnd(3500, 6500))
    }
    tid = setTimeout(schedule, rnd(1200, 2800))
    return () => clearTimeout(tid)
  }, [])

  useEffect(() => {
    const tick = () => {
      setTableCount((n) => {
        const next = Math.max(240, Math.min(620, n + rnd(-5, 11)))
        if (next !== prevCount.current) {
          prevCount.current = next
          setCountFlash(true)
          window.setTimeout(() => setCountFlash(false), 380)
        }
        return next
      })
    }
    tick()
    const t = setInterval(tick, 1600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setWinsPerMin((w) => (Math.random() < 0.28 ? Math.max(12, w - 1) : w))
    }, 8500)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className={[
        'w-full rounded-2xl overflow-hidden border relative transition-shadow duration-500',
        pulse ? 'ruleta-live-pulse' : '',
        className,
      ].join(' ')}
      style={{
        background:
          'linear-gradient(165deg, rgba(20,10,28,0.98) 0%, rgba(8,4,14,0.99) 55%, rgba(14,8,22,0.98) 100%)',
        borderColor: pulse ? 'rgba(255,45,120,0.55)' : 'rgba(179,136,255,0.35)',
        boxShadow: pulse
          ? '0 0 32px rgba(255,45,120,0.22), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <style>{`
        @keyframes ruleta-live-ring {
          0% { transform: scale(1); opacity: 0.75; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ruleta-live-pop {
          0% { transform: scale(1); }
          45% { transform: scale(1.06); color: #ff6b9d; }
          100% { transform: scale(1); }
        }
        .ruleta-live-pulse {
          animation: ruleta-live-pulse-glow 0.9s ease-in-out infinite;
        }
        @keyframes ruleta-live-pulse-glow {
          0%, 100% { box-shadow: 0 0 28px rgba(255,45,120,0.18); }
          50% { box-shadow: 0 0 40px rgba(255,45,120,0.35); }
        }
        .ruleta-live-count-flash { animation: ruleta-live-pop 0.38s ease-out; }
      `}</style>

      <div
        className="h-[2px] w-full"
        style={{
          background: 'linear-gradient(90deg, #ff2d78, #b388ff, #ffd700, #ff2d78)',
          backgroundSize: '200% 100%',
          animation: 'ctamove 3s linear infinite',
        }}
        aria-hidden
      />

      <div className="px-3 pt-3 pb-1 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.24em] text-[var(--mystik3)]">
          GANADORES EN VIVO
        </p>
        <p className="font-mono text-[9px] tracking-[0.12em] text-[var(--txt3)] hidden sm:block">
          {RULETA_LIVE_PLAYER_COUNT}+ jugadores en la ruleta
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 min-h-[48px]">
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-2 h-2">
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: '#ff2d78', boxShadow: '0 0 10px #ff2d78' }}
            />
            <span
              className="absolute inset-[-3px] rounded-full border border-[#ff2d78]/50"
              style={{ animation: 'ruleta-live-ring 1.5s ease-out infinite' }}
            />
          </div>
          <span className="font-mono text-[9px] font-black tracking-[0.15em] text-[#ff6b9d]">
            LIVE
          </span>
          <span
            className={[
              'font-mono text-[10px] sm:text-[11px] font-black tabular-nums text-[#ffd700]',
              countFlash ? 'ruleta-live-count-flash' : '',
            ].join(' ')}
          >
            {tableCount}
          </span>
        </div>
        <SmoothRuletaTicker strip={tickerStrip} />
        <span
          className="shrink-0 font-mono text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
          style={{
            background: 'rgba(179,136,255,0.18)',
            color: '#d4b8ff',
            border: '1px solid rgba(179,136,255,0.4)',
          }}
        >
          🔥{winsPerMin}/m
        </span>
      </div>

      <p className="px-3 pb-2.5 font-mono text-[9px] text-[var(--txt3)] tracking-[0.08em] sm:hidden">
        {RULETA_LIVE_PLAYER_COUNT}+ jugadores · premios cada minuto
      </p>
    </div>
  )
}
