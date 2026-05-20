'use client'

import type { Prize } from '@/lib/clawzone-data'

interface WinModalProps {
  isOpen: boolean
  onClose: () => void
  prize: Prize | null
}

export function WinModal({ isOpen, onClose, prize }: WinModalProps) {
  if (!isOpen || !prize) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(5,8,16,0.95)] backdrop-blur-[16px]">
      <div
        className="max-w-[360px] w-[92%] p-9 px-7 text-center rounded-xl bg-[var(--bg2)] border border-[var(--neon)] relative overflow-hidden"
        style={{
          boxShadow: '0 0 80px rgba(0,212,255,.15),0 0 200px rgba(0,0,0,.5)',
          animation: 'popin .4s cubic-bezier(.17,.67,.24,1.3)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,var(--neon),transparent)' }}
        />
        <span className="text-[60px] block mb-4">{prize.ico}</span>
        <div
          className="font-display font-black italic text-[28px] text-[var(--neon)] mb-2"
          style={{ textShadow: '0 0 20px rgba(0,212,255,.4)' }}
        >
          ¡LA GARRA AGARRÓ ALGO!
        </div>
        <div className="inline-block py-[5px] px-4 mb-3.5 rounded bg-[rgba(0,212,255,0.1)] border border-[var(--border)] font-mono text-xs text-[var(--neon2)]">
          {prize.nm} — valor ${prize.v}
        </div>
        <div className="text-sm text-[var(--txt2)] leading-[1.75] mb-[22px] font-light">
          Tu {prize.nm} fue reservado. Revisá tu email en los próximos 60 segundos para recibirlo.
        </div>
        <button
          onClick={onClose}
          className="w-full py-[15px] border-none rounded-md cursor-pointer font-display font-black text-base tracking-[5px] text-[var(--bg0)] transition-transform hover:-translate-y-0.5 active:translate-y-[3px]"
          style={{
            background: 'linear-gradient(135deg,var(--neon3),var(--neon))',
            boxShadow: '0 5px 0 rgba(0,0,0,.4),0 8px 28px rgba(0,212,255,.3)',
          }}
        >
          RECIBIR MI PREMIO ✦
        </button>
      </div>
    </div>
  )
}
