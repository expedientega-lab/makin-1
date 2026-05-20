'use client'

import { useState, useEffect } from 'react'
import { horoscopeCategories } from '@/lib/mystika-data'

const zodiacSigns = [
  { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Abr 19' },
  { name: 'Tauro', emoji: '♉', dates: 'Abr 20 - May 20' },
  { name: 'Geminis', emoji: '♊', dates: 'May 21 - Jun 20' },
  { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
  { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Ago 22' },
  { name: 'Virgo', emoji: '♍', dates: 'Ago 23 - Sep 22' },
  { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
  { name: 'Escorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
  { name: 'Sagitario', emoji: '♐', dates: 'Nov 22 - Dic 21' },
  { name: 'Capricornio', emoji: '♑', dates: 'Dic 22 - Ene 19' },
  { name: 'Acuario', emoji: '♒', dates: 'Ene 20 - Feb 18' },
  { name: 'Piscis', emoji: '♓', dates: 'Feb 19 - Mar 20' },
]

export function HoroscopoSection() {
  const [selectedSign, setSelectedSign] = useState<string | null>(null)
  const [readings, setReadings] = useState<Record<string, { grade: string; msg: string }>>({})

  useEffect(() => {
    if (selectedSign) {
      const newReadings: Record<string, { grade: string; msg: string }> = {}
      horoscopeCategories.forEach(cat => {
        const grades = ['S', 'A', 'B', 'C', 'D'] as const
        const weights = [5, 20, 40, 25, 10]
        let r = Math.random() * 100
        let acc = 0
        let grade: typeof grades[number] = 'B'
        for (let i = 0; i < grades.length; i++) {
          acc += weights[i]
          if (r < acc) {
            grade = grades[i]
            break
          }
        }
        newReadings[cat.nm] = { grade, msg: cat.msgs[grade] }
      })
      setReadings(newReadings)
    }
  }, [selectedSign])

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'var(--gold)'
      case 'A': return 'var(--green)'
      case 'B': return 'var(--mystik)'
      case 'C': return 'var(--cyan)'
      case 'D': return 'var(--rose)'
      default: return 'var(--txt2)'
    }
  }

  const getGradeWidth = (grade: string) => {
    switch (grade) {
      case 'S': return '100%'
      case 'A': return '80%'
      case 'B': return '60%'
      case 'C': return '40%'
      case 'D': return '20%'
      default: return '50%'
    }
  }

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      {/* Header */}
      <div className="text-center py-1.5 pb-[18px]">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          HOROSCOPO MISTICO
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-2.5"
          style={{ fontSize: 'clamp(32px,8vw,52px)' }}
        >
          Tu <span className="text-[var(--mystik)]" style={{ textShadow: '0 0 20px rgba(179,136,255,.5)' }}>lectura</span> astral
        </h2>
        <p className="text-[13px] text-[var(--txt2)] max-w-[360px] mx-auto leading-[1.8] font-light">
          Selecciona tu signo zodiacal y descubre lo que los astros tienen preparado para ti esta semana.
        </p>
      </div>

      {/* Zodiac Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
        {zodiacSigns.map((sign) => (
          <button
            key={sign.name}
            onClick={() => setSelectedSign(sign.name)}
            className={`
              p-3 rounded-lg border transition-all text-center
              ${selectedSign === sign.name 
                ? 'bg-[var(--mystikS)] border-[var(--mystik)] shadow-[0_0_20px_rgba(179,136,255,0.3)]' 
                : 'bg-[var(--bg2)] border-[var(--border)] hover:border-[var(--borderH)]'}
            `}
          >
            <div className="text-xl mb-0.5">{sign.emoji}</div>
            <div className="font-mono text-[8px] tracking-[1px] text-[var(--txt2)]">{sign.name}</div>
          </button>
        ))}
      </div>

      {/* Reading Results */}
      {selectedSign && (
        <div className="animate-[fadeup_0.3s_ease]">
          {/* Sign Header */}
          <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-[var(--bg2)] border border-[var(--border)] rounded-lg">
            <span className="text-4xl">{zodiacSigns.find(s => s.name === selectedSign)?.emoji}</span>
            <div>
              <div className="font-display font-bold text-[20px] text-[var(--txt)]">{selectedSign}</div>
              <div className="font-mono text-[10px] text-[var(--txt3)]">
                {zodiacSigns.find(s => s.name === selectedSign)?.dates}
              </div>
            </div>
          </div>

          {/* Category Readings */}
          <div className="flex flex-col gap-3">
            {horoscopeCategories.map((cat) => {
              const reading = readings[cat.nm]
              if (!reading) return null

              return (
                <div
                  key={cat.nm}
                  className="p-4 bg-[var(--bg2)] border border-[var(--border)] rounded-lg hover:border-[var(--borderH)] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.ico}</span>
                      <span className="font-sans font-semibold text-[13px] text-[var(--txt)]">{cat.nm}</span>
                    </div>
                    <div 
                      className="font-display font-bold text-[18px]"
                      style={{ color: getGradeColor(reading.grade) }}
                    >
                      {reading.grade}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 bg-[var(--txt4)] rounded overflow-hidden mb-2">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: getGradeWidth(reading.grade),
                        background: `linear-gradient(90deg, ${getGradeColor(reading.grade)}88, ${getGradeColor(reading.grade)})`,
                      }}
                    />
                  </div>
                  
                  <p className="text-[12px] text-[var(--txt2)] leading-[1.6]">{reading.msg}</p>
                </div>
              )
            })}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => setSelectedSign(selectedSign)}
            className="w-full mt-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--txt2)] font-mono text-[11px] tracking-[2px] hover:border-[var(--borderH)] transition-all"
          >
            ↻ NUEVA LECTURA
          </button>
        </div>
      )}
    </div>
  )
}
