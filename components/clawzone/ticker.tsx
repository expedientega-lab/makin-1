'use client'

import { tickerItems } from '@/lib/clawzone-data'

export function Ticker() {
  const items = [...tickerItems, ...tickerItems]

  return (
    <div className="sticky top-0 z-50 overflow-hidden bg-[var(--bg1)] border-b border-[var(--border)]">
      <div
        className="flex gap-0 whitespace-nowrap w-max hover:[animation-play-state:paused]"
        style={{ animation: 'ticker 55s linear infinite' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className={`
              font-mono text-[clamp(9px,2vw,11px)] tracking-[clamp(1px,0.4vw,3px)]
              inline-flex items-center gap-[clamp(8px,2vw,16px)] flex-shrink-0
              py-[9px] px-[clamp(10px,3vw,24px)] border-r border-[rgba(0,212,255,0.08)]
              ${item.type === 'win' ? 'text-[var(--yellow)]' : ''}
              ${item.type === 'hot' ? 'text-[var(--pink)]' : ''}
              ${item.type === 'green' ? 'text-[var(--green)]' : ''}
              ${item.type === 'normal' || item.type === 'brand' ? 'text-[var(--neon2)]' : ''}
            `}
          >
            {item.type === 'brand' ? (
              <>
                <span className="w-1 h-1 bg-[var(--pink)] rotate-45 flex-shrink-0 opacity-80" />
                {item.text}
                <span className="w-1 h-1 bg-[var(--pink)] rotate-45 flex-shrink-0 opacity-80" />
              </>
            ) : (
              item.text
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
