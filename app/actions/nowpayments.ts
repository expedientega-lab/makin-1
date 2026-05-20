'use server'

import { randomUUID } from 'crypto'
import { PRODUCTS } from '@/lib/products'
import { attachInvoiceToOrder, createPendingOrder } from '@/lib/payments-store'
import { getOrCreateMkClientId } from '@/lib/mk-client-id'

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY!

interface InvoiceResponse {
  id: string
  token_id: string
  order_id: string
  order_description: string
  price_amount: number
  price_currency: string
  invoice_url: string
  created_at: string
  updated_at: string
}

export async function createPaymentInvoice(
  productId: string,
  returnPath = '/',
  checkoutMethod: 'card' | 'paypal' = 'card',
): Promise<{ success: boolean; invoiceUrl?: string; error?: string }> {
  const product = PRODUCTS.find((p) => p.id === productId)
  
  if (!product) {
    return { success: false, error: 'Producto no encontrado' }
  }

  const priceAmount = product.priceInCents / 100 // Convert cents to dollars

  try {
    const clientId = await getOrCreateMkClientId()

    const orderId = `${productId}-${Date.now()}-${randomUUID().slice(0, 8)}`
    await createPendingOrder(orderId, clientId, productId)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const normalizedPath = returnPath.startsWith('/') ? returnPath : `/${returnPath}`
    const successUrl = `${baseUrl}${normalizedPath}?payment=processing&orderId=${encodeURIComponent(orderId)}`
    const cancelUrl = `${baseUrl}${normalizedPath}?payment=cancelled`
    const webhookUrl = `${baseUrl}/api/nowpayments/webhook`

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: 'usd',
        order_id: orderId,
        order_description: `${product.description} | Metodo preferido: ${checkoutMethod}`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        ipn_callback_url: webhookUrl,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('NOWPayments error:', errorData)
      return { success: false, error: 'Error al crear el pago' }
    }

    const data: InvoiceResponse = await response.json()
    console.log('[v0] NOWPayments invoice created:', data)
    await attachInvoiceToOrder(orderId, data.id)
    
    return { 
      success: true, 
      invoiceUrl: data.invoice_url 
    }
  } catch (error) {
    console.error('NOWPayments error:', error)
    return { success: false, error: 'Error de conexion con el servicio de pagos' }
  }
}
