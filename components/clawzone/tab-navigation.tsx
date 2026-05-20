'use client'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string, requiresPremium: boolean) => void
  hasPaid: boolean
}

const tabs = [
  { id: 'caja', label: '🎁 LA CLAW', premium: false },
  { id: 'galleta', label: '🥠 FORTUNA', premium: true },
  { id: 'ruleta', label: '🎡 RULETA', premium: true },
  { id: 'horoscopo', label: '✦ HORÓSCOPO', premium: false },
]

export function TabNavigation({ activeTab, onTabChange, hasPaid }: TabNavigationProps) {
  return (
    <div className="flex gap-1 mb-7 bg-[var(--bg1)] border border-[var(--border)] rounded-md p-[5px] overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id, tab.premium && !hasPaid)}
          className={`
            flex-shrink-0 py-2.5 px-[18px] font-display font-bold text-sm tracking-[3px]
            cursor-pointer border border-transparent bg-transparent rounded transition-all
            whitespace-nowrap
            ${activeTab === tab.id
              ? 'bg-[rgba(0,212,255,0.12)] text-[var(--neon)] border-[var(--neon2)]'
              : 'text-[var(--txt3)] hover:text-[var(--neon)] hover:bg-[var(--neonG)] hover:border-[var(--border)]'
            }
          `}
          style={
            activeTab === tab.id
              ? {
                  boxShadow: '0 0 20px rgba(0,212,255,0.2),inset 0 0 20px rgba(0,212,255,0.06)',
                  textShadow: '0 0 12px rgba(0,212,255,.6)',
                }
              : {}
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
