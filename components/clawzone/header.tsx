'use client'

import { useState, useEffect } from 'react'

interface HeaderProps {
  onlineCount: number
}

export function Header({ onlineCount }: HeaderProps) {
  return (
    <header className="py-7 pb-6 flex items-center justify-between flex-wrap gap-4 border-b border-[var(--border)] mb-6 relative">
      <div
        className="absolute bottom-[-1px] left-0 right-0 h-px opacity-60"
        style={{ background: 'linear-gradient(90deg,transparent,var(--neon),transparent)' }}
      />

      {/* Left Stats */}
      <div className="flex flex-col gap-1.5 min-w-[110px]">
        <div className="inline-flex items-center gap-[7px] font-mono text-[10px] tracking-[2px] text-[var(--green)] py-[5px] px-3 border border-[rgba(0,255,157,0.3)] rounded bg-[var(--greenS)]">
          <div
            className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"
            style={{ animation: 'livepulse 1.4s infinite' }}
          />
          EN VIVO
        </div>
        <div className="mt-1">
          <div className="font-mono text-[9px] tracking-[3px] text-[var(--txt3)]">JUGADORES</div>
          <div
            className="font-display font-bold text-[26px] text-[var(--neon)] tracking-[2px]"
            style={{ textShadow: '0 0 12px rgba(0,212,255,.4)' }}
          >
            {onlineCount.toLocaleString('es')}
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="text-center">
        <span
          className="text-[28px] block mb-1"
          style={{ animation: 'clawbounce 2.5s ease-in-out infinite' }}
        >
          🎮
        </span>
        <div
          className="font-display font-black text-[52px] tracking-[8px] leading-none text-[var(--neon)]"
          style={{ textShadow: '0 0 20px rgba(0,212,255,0.6),0 0 60px rgba(0,212,255,0.2)' }}
        >
          CLAWZONE
        </div>
        <span className="font-mono text-[8px] tracking-[5px] text-[var(--neon3)] mt-1 block">
          MÁQUINA DIGITAL DE PREMIOS
        </span>
      </div>

      {/* Right Stats */}
      <div className="flex flex-col gap-1.5 min-w-[110px] items-end">
        <div className="font-mono text-[9px] tracking-[3px] text-[var(--txt3)]">PREMIOS ENTREGADOS</div>
        <div
          className="font-display font-bold text-[26px] text-[var(--neon)] tracking-[2px]"
          style={{ textShadow: '0 0 12px rgba(0,212,255,.4)' }}
        >
          12.4k
        </div>
      </div>
    </header>
  )
}
