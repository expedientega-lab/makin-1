'use client'

import { useState } from 'react'
import { PaypalCheckout, type PaypalSuccessContext } from '@/components/payments/paypal-checkout'

interface PayModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: (ctx: PaypalSuccessContext) => void
  productId?: string
}

export function PayModal({ isOpen, onClose, onPaymentSuccess, productId = 'clawzone-access' }: PayModalProps) {
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70">
      <div
        className="max-w-[400px] w-[92%] max-h-[88vh] overflow-y-auto p-4 text-center rounded-xl bg-white border border-black relative font-sans"
        style={{ animation: 'popin .2s ease-out' }}
      >
        <div className="font-semibold text-[15px] text-black mb-2">Pagar ahora</div>
        <div className="text-[12px] text-black/70 leading-[1.5] mb-4">
          Completá tu acceso con un pago unico de $1.
        </div>
        <div
          className="font-bold text-[40px] text-black leading-none mb-1"
        >
          $1
        </div>
        <div className="text-[10px] tracking-[0.5px] text-black/60 mb-3">
          PAGO ÚNICO · SIN RENOVACIÓN
        </div>
        <PaypalCheckout
          productId={productId}
          onError={(message) => setError(message)}
          onSuccess={(ctx) => {
            setError(null)
            onPaymentSuccess(ctx)
          }}
        />
        {error && <div className="text-red-700 text-[12px] mb-3">{error}</div>}
        <div className="sticky bottom-0 bg-white pt-2 mt-3 border-t border-black/10">
          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 border border-black/30 bg-white text-[12px] text-black cursor-pointer transition-colors hover:bg-black/5"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
