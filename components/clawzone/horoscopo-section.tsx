'use client'

import { useState, useEffect } from 'react'
import { horoscopeCategories } from '@/lib/clawzone-data'

const gradeColors: Record<string, string> = {
  S: 'var(--neon)',
  A: 'var(--green)',
  B: 'var(--yellow)',
  C: '#f0a05a',
  D: 'var(--pink)',
}

const grades = ['S', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'D']

interface Score {
  ico: string
  nm: string
  grade: string
  pct: number
  msg: string
}

export function HoroscopoSection() {
  const [scores, setScores] = useState<Score[]>([])

  const generateScores = () => {
    const newScores: Score[] = horoscopeCategories.map((cat) => {
      const grade = grades[Math.floor(Math.random() * grades.length)]
      const pctMap: Record<string, () => number> = {
        S: () => 96,
        A: () => Math.floor(Math.random() * 12 + 81),
        B: () => Math.floor(Math.random() * 12 + 63),
        C: () => Math.floor(Math.random() * 12 + 43),
        D: () => Math.floor(Math.random() * 16 + 18),
      }
      return {
        ico: cat.ico,
        nm: cat.nm,
        grade,
        pct: pctMap[grade](),
        msg: cat.msgs[grade as keyof typeof cat.msgs],
      }
    })
    setScores(newScores)
  }

  useEffect(() => {
    generateScores()
  }, [])

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      {/* Title */}
      <div className="text-center py-1.5 pb-4">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--neon3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          TUS NOTAS DE HOY
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black italic leading-[0.95] tracking-[-1px]"
          style={{ fontSize: 'clamp(42px,10vw,72px)' }}
        >
          Mi{' '}
          <span className="text-[var(--neon)]" style={{ textShadow: '0 0 20px rgba(0,212,255,.5)' }}>
            Horóscopo
          </span>
        </h2>
      </div>

      {/* Scores */}
      <div className="space-y-6 mb-6">
        {scores.map((score, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[20px]">{score.ico}</span>
                <span className="text-sm font-bold tracking-[0.5px]">{score.nm}</span>
              </div>
              <div
                className="font-display font-black text-[28px]"
                style={{ color: gradeColors[score.grade], textShadow: `0 0 12px ${gradeColors[score.grade]}55` }}
              >
                {score.grade}
              </div>
            </div>
            <div className="h-[3px] bg-[var(--txt4)] rounded overflow-hidden mb-2">
              <div
                className="h-full rounded transition-[width] duration-[1.4s] ease-[cubic-bezier(.17,.67,.24,1)]"
                style={{
                  width: `${score.pct}%`,
                  background: `linear-gradient(90deg,${gradeColors[score.grade]},${gradeColors[score.grade]}55)`,
                }}
              />
            </div>
            <div className="text-[13px] text-[var(--txt2)] leading-[1.65] italic font-light">{score.msg}</div>
          </div>
        ))}
      </div>

      {/* Regenerate Button */}
      <button
        onClick={generateScores}
        className="w-full py-[13px] border border-[var(--border)] rounded-md bg-transparent text-[var(--txt2)] font-display font-bold text-sm tracking-[4px] cursor-pointer transition-all hover:border-[var(--neon)] hover:text-[var(--neon)] hover:bg-[var(--neonG)] hover:shadow-[0_0_20px_rgba(0,212,255,.1)]"
      >
        ↺ &nbsp;REGENERAR MIS NOTAS
      </button>
    </div>
  )
}
