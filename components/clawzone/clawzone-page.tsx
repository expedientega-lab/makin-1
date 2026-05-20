'use client'

import { useState, useEffect } from 'react'
import { BackgroundCanvas } from './background-canvas'
import { Ticker } from './ticker'
import { Header } from './header'
import { TabNavigation } from './tab-navigation'
import { ClawMachine } from './claw-machine'
import { CajaSection } from './caja-section'
import { GalletaSection } from './galleta-section'
import { RuletaSection } from './ruleta-section'
import { HoroscopoSection } from './horoscopo-section'
import { WinModal } from './win-modal'
import { PayModal } from './pay-modal'
import { prizes, type Prize } from '@/lib/clawzone-data'

export function ClawzonePage() {
  const [activeTab, setActiveTab] = useState('caja')
  const [hasPaid, setHasPaid] = useState(false)
  const [onlineCount, setOnlineCount] = useState(1042)
  const [jackpotAmount, setJackpotAmount] = useState(2847)
  const [boxesOpened, setBoxesOpened] = useState(2847)
  const [stockCount, setStockCount] = useState(38)

  // Modals
  const [winModalOpen, setWinModalOpen] = useState(false)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [wonPrize, setWonPrize] = useState<Prize | null>(null)
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)

  // Live counters
  useEffect(() => {
    const onlineInterval = setInterval(() => {
      setOnlineCount((prev) => {
        let newVal = prev + Math.floor(Math.random() * 7) - 3
        return Math.max(700, Math.min(1800, newVal))
      })
    }, 4200)

    const jackpotInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        setJackpotAmount((prev) => prev + 1)
        setBoxesOpened((prev) => prev + 1)
      }
    }, 5200)

    const stockInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        setStockCount((prev) => Math.max(5, prev - 1))
      }
    }, 7500)

    return () => {
      clearInterval(onlineInterval)
      clearInterval(jackpotInterval)
      clearInterval(stockInterval)
    }
  }, [])

  useEffect(() => {
    let isActive = true
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const bootstrapPaymentState = async () => {
      try {
        const areaStatus = await fetch('/api/payments/status?area=clawzone', { cache: 'no-store' })
        if (areaStatus.ok) {
          const areaData = await areaStatus.json()
          if (isActive && areaData.paid) setHasPaid(true)
        }
      } catch {
        // Ignore transient fetch failures
      }

      const params = new URLSearchParams(window.location.search)
      const paymentState = params.get('payment')
      const orderId = params.get('orderId')

      if (paymentState !== 'processing' || !orderId) return

      setPaymentMessage('Estamos confirmando tu pago...')

      for (let attempt = 0; attempt < 25; attempt++) {
        if (!isActive) return
        try {
          const response = await fetch(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`, { cache: 'no-store' })
          if (response.ok) {
            const data = await response.json()
            if (data.paid) {
              setHasPaid(true)
              setPayModalOpen(false)
              setPaymentMessage(null)
              window.history.replaceState({}, '', window.location.pathname)
              return
            }
            if (data.status === 'failed' || data.status === 'expired' || data.status === 'refunded') {
              setPaymentMessage('El pago no se pudo confirmar. Intenta nuevamente.')
              window.history.replaceState({}, '', window.location.pathname)
              return
            }
          }
        } catch {
          // Keep polling
        }
        await sleep(3000)
      }

      if (isActive) {
        setPaymentMessage('Tu pago sigue pendiente de confirmacion en blockchain. Reintentamos en breve.')
      }
    }

    bootstrapPaymentState()
    return () => {
      isActive = false
    }
  }, [])

  const handleTabChange = (tab: string, requiresPremium: boolean) => {
    if (requiresPremium) {
      setPayModalOpen(true)
    } else {
      setActiveTab(tab)
    }
  }

  const handlePlay = () => {
    if (!hasPaid) {
      setPayModalOpen(true)
      return
    }

    // Select random prize
    let r = Math.random() * 100
    let acc = 0
    let idx = 0
    for (let i = 0; i < prizes.length; i++) {
      acc += prizes[i].p
      if (r < acc) {
        idx = i
        break
      }
    }
    setWonPrize(prizes[idx])
    setTimeout(() => setWinModalOpen(true), 1100)
  }

  const handleRequestPay = () => {
    setPayModalOpen(true)
  }

  return (
    <>
      <BackgroundCanvas />
      <Ticker />

      <div className="relative z-[2] max-w-[860px] mx-auto px-5 pb-[100px]">
        <Header onlineCount={onlineCount} />
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} hasPaid={hasPaid} />
        {paymentMessage && (
          <div className="mb-4 rounded-lg border border-[var(--neon)] bg-[var(--bg2)] p-3 text-center text-[12px] text-[var(--txt2)]">
            {paymentMessage}
          </div>
        )}

        {activeTab === 'caja' && (
          <>
            <ClawMachine />
            <CajaSection
              boxesOpened={boxesOpened}
              jackpotAmount={jackpotAmount}
              stockCount={stockCount}
              onPlay={handlePlay}
            />
          </>
        )}

        {activeTab === 'galleta' && <GalletaSection hasPaid={hasPaid} onRequestPay={handleRequestPay} />}

        {activeTab === 'ruleta' && <RuletaSection hasPaid={hasPaid} onRequestPay={handleRequestPay} />}

        {activeTab === 'horoscopo' && <HoroscopoSection />}
      </div>

      <WinModal isOpen={winModalOpen} onClose={() => setWinModalOpen(false)} prize={wonPrize} />
      <PayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onPaymentSuccess={() => {
          setHasPaid(true)
          setPayModalOpen(false)
        }}
        productId="clawzone-access"
      />
    </>
  )
}
