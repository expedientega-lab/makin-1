'use client'

import { useEffect, useRef, useState } from 'react'

const liveCountries = [
  { flag: 'AR', country: 'Argentina', basePlaying: 2180, baseWinning: 286 },
  { flag: 'MX', country: 'Mexico', basePlaying: 3540, baseWinning: 451 },
  { flag: 'CO', country: 'Colombia', basePlaying: 1970, baseWinning: 239 },
  { flag: 'CL', country: 'Chile', basePlaying: 1330, baseWinning: 165 },
  { flag: 'PE', country: 'Peru', basePlaying: 1490, baseWinning: 188 },
  { flag: 'ES', country: 'Espana', basePlaying: 1710, baseWinning: 214 },
  { flag: 'UY', country: 'Uruguay', basePlaying: 780, baseWinning: 92 },
  { flag: 'PY', country: 'Paraguay', basePlaying: 690, baseWinning: 80 },
  { flag: 'BO', country: 'Bolivia', basePlaying: 830, baseWinning: 101 },
  { flag: 'EC', country: 'Ecuador', basePlaying: 1220, baseWinning: 149 },
  { flag: 'BR', country: 'Brasil', basePlaying: 4320, baseWinning: 570 },
  { flag: 'US', country: 'Estados Unidos', basePlaying: 3890, baseWinning: 505 },
  { flag: 'CA', country: 'Canada', basePlaying: 1440, baseWinning: 183 },
  { flag: 'FR', country: 'Francia', basePlaying: 1280, baseWinning: 160 },
  { flag: 'IT', country: 'Italia', basePlaying: 1360, baseWinning: 171 },
  { flag: 'DE', country: 'Alemania', basePlaying: 1570, baseWinning: 201 },
  { flag: 'PT', country: 'Portugal', basePlaying: 940, baseWinning: 118 },
  { flag: 'GB', country: 'Reino Unido', basePlaying: 1820, baseWinning: 236 },
  { flag: 'IN', country: 'India', basePlaying: 4680, baseWinning: 620 },
  { flag: 'PH', country: 'Filipinas', basePlaying: 1930, baseWinning: 248 },
  { flag: 'ID', country: 'Indonesia', basePlaying: 2140, baseWinning: 279 },
  { flag: 'TR', country: 'Turquia', basePlaying: 1670, baseWinning: 210 },
  { flag: 'ZA', country: 'Sudafrica', basePlaying: 990, baseWinning: 124 },
  { flag: 'JP', country: 'Japon', basePlaying: 1520, baseWinning: 190 },
  { flag: 'KR', country: 'Corea del Sur', basePlaying: 1480, baseWinning: 184 },
]

type LiveRow = {
  flag: string
  country: string
  playing: number
  winning: number
  trend: string
}

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

function buildLiveRow(countryIndex: number): LiveRow {
  const base = liveCountries[countryIndex]
  const playingDelta = randomBetween(-260, 420)
  const playing = Math.max(300, base.basePlaying + playingDelta)
  const winRate = randomBetween(11, 18) / 100
  const winning = Math.max(40, Math.round(playing * winRate))
  const trendValue = randomBetween(4, 22)
  const trendSign = Math.random() < 0.86 ? '+' : '-'

  return {
    flag: base.flag,
    country: base.country,
    playing,
    winning,
    trend: `${trendSign}${trendValue}%`,
  }
}

interface FloatingStatsProps {
  position?: 'top-right' | 'bottom-left' | 'bottom-right' | 'top-left'
  size?: 'compact' | 'normal' | 'large'
}

export function FloatingStats({ position = 'top-right', size = 'normal' }: FloatingStatsProps) {
  const [liveRow, setLiveRow] = useState<LiveRow>(() => buildLiveRow(0))
  const [pulseKey, setPulseKey] = useState(0)
  const [globalNow, setGlobalNow] = useState(48213)
  const currentIndexRef = useRef(0)
  const recentIndicesRef = useRef<number[]>([0])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const tick = () => {
      const blocked = new Set(recentIndicesRef.current.slice(-3))
      const candidatePool = liveCountries
        .map((_, idx) => idx)
        .filter((idx) => !blocked.has(idx))
      const nextIndex = candidatePool.length
        ? candidatePool[randomBetween(0, candidatePool.length - 1)]
        : randomBetween(0, liveCountries.length - 1)

      currentIndexRef.current = nextIndex
      recentIndicesRef.current = [...recentIndicesRef.current, nextIndex].slice(-4)
      setLiveRow(buildLiveRow(nextIndex))
      setGlobalNow((prev) => Math.max(35000, prev + randomBetween(-320, 540)))
      setPulseKey((prev) => prev + 1)

      timeoutId = setTimeout(tick, randomBetween(1800, 4200))
    }

    timeoutId = setTimeout(tick, randomBetween(1600, 3000))
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
  }

  const sizeClasses = {
    compact: 'max-w-[200px] p-3',
    normal: 'max-w-[270px] p-4',
    large: 'max-w-[320px] p-5',
  }

  return (
    <div className={`${positionClasses[position]} ${sizeClasses[size]} z-50 animate-[fadeup_0.6s_ease]`}>
      {/* Floating Stats Card */}
      <div className="relative rounded-2xl border border-[var(--border)] bg-[rgba(10,6,18,0.95)] backdrop-blur-md text-left overflow-hidden group shadow-2xl hover:shadow-[0_0_40px_rgba(179,136,255,0.3)] transition-all duration-300 hover:scale-[1.02]">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(179,136,255,0.1)_0%,transparent_70%)] animate-pulse" />
        </div>
        
        {/* Live Indicator */}
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--green)] px-2 py-1 rounded-full border border-[rgba(0,255,157,0.3)] bg-[rgba(0,255,157,0.1)] backdrop-blur-sm">
            <div className="w-1 h-1 rounded-full bg-[var(--green)] animate-livepulse" />
            <span className="font-black tracking-[1px]">LIVE</span>
          </div>
        </div>

        <div className="relative p-4">
          {/* Global Counter */}
          <div className="mb-3">
            <div className="text-[9px] text-[var(--txt2)] font-mono tracking-[2px] mb-1 opacity-80">
              GLOBALES
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] text-[var(--txt)] font-black font-mono" style={{ textShadow: '0 0 12px rgba(0,255,157,0.4)' }}>
                {globalNow.toLocaleString('es')}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            </div>
          </div>

          {/* Country Stats */}
          <div key={pulseKey} className="relative animate-[fadeup_0.3s_ease]">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-lg font-black text-[var(--txt)]" style={{ textShadow: '0 0 15px rgba(179,136,255,0.5)' }}>
                {liveRow.flag}
              </div>
              <div className="font-bold text-[13px] text-[var(--txt)] leading-tight">
                {liveRow.country}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="text-[8px] text-[var(--txt2)] font-mono tracking-[1px] mb-1 opacity-70">JUGANDO</div>
                <div className="text-[14px] text-[var(--txt)] font-black font-mono">
                  {liveRow.playing.toLocaleString('es')}
                </div>
              </div>
              <div>
                <div className="text-[8px] text-[var(--txt2)] font-mono tracking-[1px] mb-1 opacity-70">GANANDO</div>
                <div className="text-[14px] text-[var(--gold)] font-black font-mono">
                  {liveRow.winning.toLocaleString('es')}
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className={`text-right font-mono text-[16px] font-black ${liveRow.trend.startsWith('-') ? 'text-[var(--rose)]' : 'text-[var(--green)]'}`} style={{ textShadow: `0 0 10px ${liveRow.trend.startsWith('-') ? 'rgba(255,107,157,0.5)' : 'rgba(0,255,157,0.5)'}` }}>
              {liveRow.trend}
            </div>
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(179,136,255,0.1)] to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[rgba(0,255,157,0.4)] rounded-tl-sm" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[rgba(0,255,157,0.4)] rounded-tr-sm" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[rgba(0,255,157,0.4)] rounded-bl-sm" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[rgba(0,255,157,0.4)] rounded-br-sm" />
      </div>
    </div>
  )
}
