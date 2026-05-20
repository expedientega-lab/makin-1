'use client'

import { tickerItems } from '@/lib/mystika-data'

export function Ticker() {
  const items = [...tickerItems, ...tickerItems]

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'brand':
        return 'text-[var(--mystik)] font-bold'
      case 'win':
        return 'text-[var(--gold)]'
      case 'green':
        return 'text-[var(--green)]'
      case 'hot':
        return 'text-[var(--rose)]'
      default:
        return 'text-[var(--txt2)]'
    }
  }

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[rgba(10,6,18,0.95)] border-b border-[rgba(179,136,255,0.15)] backdrop-blur-sm">
      <div className="overflow-hidden py-2">
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{ animation: 'ticker 60s linear infinite' }}
        >
          {items.map((item, i) => (
            <span
              key={i}
              className={`text-[11px] tracking-[2px] ${getTypeStyle(item.type)}`}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
