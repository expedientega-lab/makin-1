'use client'

import { useState, useEffect, useMemo } from 'react'

const ballTypes = ['pb-blue', 'pb-red', 'pb-yellow', 'pb-green', 'pb-pink']
const ballEmojis = ['🤖', '💎', '⚡', '🎯', '🔐', '📚', '💰', '🧠', '📊', '🎁', '✨', '🎮', '🃏', '🌟', '💡']

interface Ball {
  type: string
  emoji: string
  delay: string
  duration: string
}

export function ClawMachine() {
  const [clawX, setClawX] = useState(50)
  const [balls, setBalls] = useState<Ball[]>([])

  // Generate balls on mount
  useEffect(() => {
    const newBalls: Ball[] = []
    for (let i = 0; i < 15; i++) {
      newBalls.push({
        type: ballTypes[Math.floor(Math.random() * ballTypes.length)],
        emoji: ballEmojis[Math.floor(Math.random() * ballEmojis.length)],
        delay: `${Math.random() * 2}s`,
        duration: `${2.5 + Math.random() * 2}s`,
      })
    }
    setBalls(newBalls)
  }, [])

  // Claw animation
  useEffect(() => {
    let dir = 1
    let x = 50
    const interval = setInterval(() => {
      x += dir * 2.5
      if (x > 80 || x < 20) dir *= -1
      setClawX(x)
    }, 120)
    return () => clearInterval(interval)
  }, [])

  const getBallClass = (type: string) => {
    const styles: Record<string, string> = {
      'pb-blue': 'bg-gradient-to-br from-[#1a6aff] to-[#0033aa] shadow-[0_4px_15px_rgba(0,100,255,.4)]',
      'pb-red': 'bg-gradient-to-br from-[#ff4466] to-[#aa0022] shadow-[0_4px_15px_rgba(255,0,80,.4)]',
      'pb-yellow': 'bg-gradient-to-br from-[#ffe566] to-[#cc9900] shadow-[0_4px_15px_rgba(255,200,0,.4)]',
      'pb-green': 'bg-gradient-to-br from-[#44ffaa] to-[#008844] shadow-[0_4px_15px_rgba(0,200,100,.4)]',
      'pb-pink': 'bg-gradient-to-br from-[#ff66aa] to-[#aa0066] shadow-[0_4px_15px_rgba(255,0,150,.4)]',
    }
    return styles[type] || styles['pb-blue']
  }

  return (
    <div className="w-full max-w-[480px] mx-auto mb-6 relative">
      <div
        className="p-4 relative overflow-hidden rounded-2xl border-2 border-[rgba(0,212,255,0.25)]"
        style={{ background: 'linear-gradient(180deg,var(--bg3),var(--bg2))' }}
      >
        {/* Dashed inner border */}
        <div className="absolute inset-1.5 border border-dashed border-[rgba(0,212,255,0.1)] rounded-xl pointer-events-none" />

        {/* Lights */}
        <div className="flex justify-between px-2.5 mb-3">
          {[...Array(7)].map((_, i) => {
            const colors = ['var(--pink)', 'var(--yellow)', 'var(--neon)', 'var(--green)', 'var(--pink)', 'var(--yellow)', 'var(--neon)']
            return (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: colors[i],
                  boxShadow: `0 0 8px ${colors[i]}`,
                  animation: `blinkit 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            )
          })}
        </div>

        {/* Screen */}
        <div className="bg-[var(--bg0)] border-2 border-[rgba(0,212,255,0.2)] rounded-lg p-2.5 mb-3.5 min-h-[240px] relative overflow-hidden">
          {/* Glass effect */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.04) 0%,transparent 50%)' }}
          />

          {/* Claw arm */}
          <div
            className="absolute top-0 flex flex-col items-center z-10 pointer-events-none transition-[left] duration-300"
            style={{ left: `${clawX}%`, transform: 'translateX(-50%)' }}
          >
            <div
              className="w-0.5 h-[60px]"
              style={{ background: 'linear-gradient(180deg,rgba(0,212,255,.4),rgba(0,212,255,.1))' }}
            />
            <div
              className="text-[30px] -mt-0.5"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,212,255,.6))' }}
            >
              🦾
            </div>
          </div>

          {/* Prize field */}
          <div className="grid grid-cols-5 gap-1.5 p-3.5 pt-8 min-h-[180px] items-end">
            {balls.map((ball, i) => (
              <div
                key={i}
                className={`aspect-square rounded-full flex items-center justify-center text-[22px] cursor-default border-2 border-[rgba(255,255,255,0.1)] transition-transform hover:scale-[1.12] ${getBallClass(ball.type)}`}
                style={{
                  animation: `float-ball ${ball.duration} ease-in-out infinite`,
                  animationDelay: ball.delay,
                }}
              >
                {ball.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Rail */}
        <div
          className="h-1.5 rounded mb-2.5 relative"
          style={{ background: 'linear-gradient(90deg,var(--bg3),rgba(0,212,255,.3),var(--bg3))' }}
        >
          <div className="absolute top-[1px] left-0 right-0 h-0.5 bg-[rgba(255,255,255,0.08)] rounded" />
        </div>

        {/* Brand */}
        <div
          className="text-center font-display font-black text-[18px] tracking-[10px] text-[var(--neon)] mb-1"
          style={{ textShadow: '0 0 14px rgba(0,212,255,.7)' }}
        >
          CLAWZONE
        </div>

        {/* Coin slot */}
        <div className="flex justify-center items-center gap-2 font-mono text-[10px] tracking-[3px] text-[var(--txt3)]">
          <span>INSERTAR MONEDA</span>
          <div className="w-7 h-1.5 bg-[var(--bg0)] rounded-sm border border-[rgba(0,212,255,0.2)]" />
        </div>
      </div>
    </div>
  )
}
