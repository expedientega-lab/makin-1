import { NextRequest, NextResponse } from 'next/server'
import { fulfillPaypalOrderPayment } from '@/lib/paypal-fulfill'
import { verifyPaypalWebhookSignature, type PaypalWebhookHeaders } from '@/lib/paypal-api'
import { upsertPaymentStatusByOrderId } from '@/lib/payments-store'

export const runtime = 'nodejs'

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID?.trim()

type PaypalWebhookEvent = {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    status?: string
    custom_id?: string
    amount?: { value?: string; currency_code?: string }
    supplementary_data?: {
      related_ids?: { order_id?: string }
    }
    purchase_units?: Array<{
      custom_id?: string
      amount?: { value?: string; currency_code?: string }
      payments?: {
        captures?: Array<{
          id?: string
          status?: string
          amount?: { value?: string; currency_code?: string }
        }>
      }
    }>
  }
}

function readWebhookHeaders(req: NextRequest): PaypalWebhookHeaders | null {
  const transmissionId = req.headers.get('paypal-transmission-id')
  const transmissionTime = req.headers.get('paypal-transmission-time')
  const certUrl = req.headers.get('paypal-cert-url')
  const authAlgo = req.headers.get('paypal-auth-algo')
  const transmissionSig = req.headers.get('paypal-transmission-sig')

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return null
  }

  return {
    transmissionId,
    transmissionTime,
    certUrl,
    authAlgo,
    transmissionSig,
  }
}

async function handleCaptureCompleted(resource: NonNullable<PaypalWebhookEvent['resource']>) {
  const orderId = resource.supplementary_data?.related_ids?.order_id

  if (!orderId) {
    console.warn('PayPal webhook CAPTURE.COMPLETED sin order_id')
    return
  }

  const result = await fulfillPaypalOrderPayment({
    orderId,
    captureId: resource.id,
    paidUsd: resource.amount?.value,
  })

  if (!result.ok) {
    console.warn('PayPal webhook fulfill:', result.reason, orderId)
  }
}

async function handleOrderCompleted(resource: NonNullable<PaypalWebhookEvent['resource']>) {
  const orderId = resource.id
  if (!orderId) return

  const capture = resource.purchase_units?.[0]?.payments?.captures?.[0]
  if (capture?.status !== 'COMPLETED') return

  const result = await fulfillPaypalOrderPayment({
    orderId,
    captureId: capture.id,
    paidUsd: capture.amount?.value ?? resource.purchase_units?.[0]?.amount?.value,
  })

  if (!result.ok) {
    console.warn('PayPal webhook order fulfill:', result.reason, orderId)
  }
}

async function handlePaymentFailed(orderId: string | undefined, status: 'failed' | 'refunded') {
  if (!orderId) return
  await upsertPaymentStatusByOrderId(orderId, status)
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    if (!PAYPAL_WEBHOOK_ID) {
      console.error('PAYPAL_WEBHOOK_ID no configurada')
      return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })
    }

    const headers = readWebhookHeaders(req)
    if (!headers) {
      return NextResponse.json({ error: 'Headers PayPal incompletos' }, { status: 400 })
    }

    const skipVerify =
      process.env.NODE_ENV === 'development' && process.env.PAYPAL_WEBHOOK_SKIP_VERIFY === 'true'

    if (!skipVerify) {
      const valid = await verifyPaypalWebhookSignature(headers, PAYPAL_WEBHOOK_ID, rawBody)
      if (!valid) {
        return NextResponse.json({ error: 'Firma invalida' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody) as PaypalWebhookEvent
    const eventType = event.event_type ?? ''

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handleCaptureCompleted(event.resource ?? {})
        break

      case 'CHECKOUT.ORDER.COMPLETED':
        await handleOrderCompleted(event.resource ?? {})
        break

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        await handlePaymentFailed(
          event.resource?.supplementary_data?.related_ids?.order_id,
          'failed',
        )
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentFailed(
          event.resource?.supplementary_data?.related_ids?.order_id,
          'refunded',
        )
        break

      default:
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}
