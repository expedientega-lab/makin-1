'use client'

import { useState } from 'react'
import { fortuneCategories, fortunes, luckColors } from '@/lib/clawzone-data'

interface GalletaSectionProps {
  hasPaid: boolean
  onRequestPay: () => void
}

export function GalletaSection({ hasPaid, onRequestPay }: GalletaSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<{ key: string; emoji: string; name: string }>(
    fortuneCategories[0]
  )
  const [fortune, setFortune] = useState<{ emoji: string; category: string; text: string; lucky: string } | null>(null)
  const [isShaking, setIsShaking] = useState(false)

  const crackCookie = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 200)

    const msgs = fortunes[selectedCategory.key as keyof typeof fortunes]
    const text = msgs[Math.floor(Math.random() * msgs.length)]

    let lucky: string
    const r = Math.random()
    if (r < 0.33) {
      lucky = `✦ Número: ${Math.floor(Math.random() * 99 + 1)}`
    } else if (r < 0.66) {
      lucky = `✦ Color del día: ${luckColors[Math.floor(Math.random() * luckColors.length)]}`
    } else {
      lucky = `✦ Hora pico: ${Math.floor(Math.random() * 12 + 1)}:${Math.random() < 0.5 ? '00' : '30'} ${Math.random() < 0.5 ? 'AM' : 'PM'}`
    }

    setFortune({
      emoji: selectedCategory.emoji,
      category: selectedCategory.name,
      text: `"${text}"`,
      lucky,
    })
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
            Jugá una claw por $1 y desbloqueás la Galleta de la Suerte y la Ruleta del Destino de forma permanente.
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
          ELEGÍ TU ÁREA
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black italic leading-[0.95] tracking-[-1px]"
          style={{ fontSize: 'clamp(42px,10vw,72px)' }}
        >
          Galleta de la{' '}
          <span className="text-[var(--neon)]" style={{ textShadow: '0 0 20px rgba(0,212,255,.5)' }}>
            Suerte
          </span>
        </h2>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-3 gap-2 mb-[22px]">
        {fortuneCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat)}
            className={`
              p-[18px] px-2.5 text-center rounded-lg bg-[var(--bg2)] border border-[var(--border)]
              cursor-pointer transition-all
              ${selectedCategory.key === cat.key ? 'bg-[var(--bg3)] border-[var(--neon)] shadow-[0_0_20px_rgba(0,212,255,.12)]' : 'hover:bg-[var(--bg3)] hover:border-[var(--neon)]'}
            `}
          >
            <div className="text-[28px] mb-1.5">{cat.emoji}</div>
            <div className="font-display font-bold text-[13px] tracking-[3px] text-[var(--txt2)]">{cat.name}</div>
          </button>
        ))}
      </div>

      {/* Cookie Zone */}
      <div className="text-center py-4 pb-5">
        <div
          className={`text-[90px] inline-block cursor-pointer leading-none select-none transition-all ${isShaking ? 'scale-[0.75] rotate-[20deg]' : 'hover:scale-[1.08]'}`}
          onClick={crackCookie}
          style={{ filter: 'drop-shadow(0 0 18px rgba(0,212,255,.3))' }}
        >
          🥠
        </div>
        <div
          className="font-mono text-[9px] tracking-[5px] text-[var(--txt3)] mt-2.5"
          style={{ animation: 'flicker 2.4s ease-in-out infinite' }}
        >
          TOCÁ PARA REVELAR TU DESTINO
        </div>
      </div>

      {/* Fortune Reveal */}
      {fortune && (
        <div
          className="p-7 px-[22px] text-center rounded-lg mt-5 bg-[var(--bg2)] border border-[var(--borderH)] relative overflow-hidden animate-[fadeup_0.4s_ease]"
          style={{ boxShadow: '0 0 30px rgba(0,212,255,.08)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,var(--neon),transparent)' }}
          />
          <span className="text-[48px] block mb-3" style={{ animation: 'popin .45s cubic-bezier(.17,.67,.24,1.5)' }}>
            {fortune.emoji}
          </span>
          <div className="font-mono text-[9px] tracking-[6px] text-[var(--neon3)] mb-2.5">{fortune.category}</div>
          <div
            className="w-[50px] h-px mx-auto mb-4"
            style={{ background: 'linear-gradient(90deg,transparent,var(--neon2),transparent)' }}
          />
          <div className="font-sans text-base font-light text-[var(--txt)] leading-[1.85] mb-[18px] italic">
            {fortune.text}
          </div>
          <div className="inline-flex items-center gap-2 py-[7px] px-[18px] rounded border border-[var(--border)] bg-[var(--bg1)] font-mono text-[10px] text-[var(--neon2)] tracking-[1px]">
            {fortune.lucky}
          </div>
        </div>
      )}
    </div>
  )
}
