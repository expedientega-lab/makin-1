'use client'

import { useState, useEffect } from 'react'
import { fortunes, fortuneCategories } from '@/lib/mystika-data'
import { useTrappedDialog } from '@/hooks/use-trapped-dialog'

interface WinModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WinModal({ isOpen, onClose }: WinModalProps) {
  const [fortune, setFortune] = useState<string | null>(null)
  const [category, setCategory] = useState<typeof fortuneCategories[0] | null>(null)
  const [luckNumber, setLuckNumber] = useState<number>(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const randomCat =
        fortuneCategories[Math.floor(Math.random() * fortuneCategories.length)]
      const randomSub =
        randomCat.subcategories[
          Math.floor(Math.random() * randomCat.subcategories.length)
        ]
      setCategory(randomCat)

      const categoryFortunes =
        fortunes[randomSub.key as keyof typeof fortunes]
      if (!categoryFortunes?.length) return

      const randomFortune =
        categoryFortunes[Math.floor(Math.random() * categoryFortunes.length)]
      setFortune(randomFortune)
      
      setLuckNumber(Math.floor(Math.random() * 99) + 1)
      setShowConfetti(true)
      
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [isOpen])

  const panelRef = useTrappedDialog(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(10,6,18,0.95)] backdrop-blur-sm" />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%',
                background: ['var(--mystik)', 'var(--gold)', 'var(--rose)', 'var(--cyan)'][i % 4],
                animation: `confetti ${1.5 + Math.random()}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div 
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mystika-win-modal-title"
        className="relative max-w-[400px] w-full bg-[var(--bg2)] border border-[var(--gold)] rounded-2xl p-6 text-center"
        style={{
          animation: 'popin 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: '0 0 60px rgba(255,215,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }}
        />

        {/* Cookie icon */}
        <div 
          className="text-[80px] mb-4"
          style={{ 
            filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5))',
            animation: 'float 2s ease-in-out infinite',
          }}
        >
          🥠
        </div>

        {/* Title */}
        <div id="mystika-win-modal-title" className="font-display font-bold text-[24px] text-[var(--gold)] mb-2 tracking-[2px]">
          TU FORTUNA
        </div>

        {/* Category badge */}
        {category && (
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[var(--mystikS)] border border-[var(--mystik)] mb-4">
            <span>{category.emoji}</span>
            <span className="font-mono text-[10px] tracking-[2px] text-[var(--mystik)]">
              {category.name}
            </span>
          </div>
        )}

        {/* Fortune message */}
        <div className="p-4 bg-[var(--bg3)] border border-[var(--border)] rounded-lg mb-4">
          <p className="text-[15px] text-[var(--txt)] leading-[1.8] font-light italic">
            &ldquo;{fortune}&rdquo;
          </p>
        </div>

        {/* Luck number */}
        <div className="mb-6">
          <div className="font-mono text-[9px] tracking-[2px] text-[var(--txt3)] mb-1">TU NUMERO DE SUERTE</div>
          <div className="font-display font-bold text-[36px] text-[var(--gold)]" style={{ textShadow: '0 0 20px rgba(255,215,0,0.4)' }}>
            {luckNumber}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--txt2)] font-mono text-[11px] tracking-[2px] hover:border-[var(--borderH)] transition-all"
          >
            CERRAR
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.share && fortune) {
                navigator.share({
                  title: 'Mi fortuna de Mystika',
                  text: fortune,
                })
              }
            }}
            className="flex-1 py-3 rounded-lg font-mono text-[11px] tracking-[2px] text-[var(--bg0)] transition-all"
            style={{
              background: 'linear-gradient(135deg,var(--gold),#ffdd55)',
            }}
          >
            COMPARTIR
          </button>
        </div>
      </div>
    </div>
  )
}
