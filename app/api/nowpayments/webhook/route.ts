import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { upsertPaymentStatusByOrderId } from '@/lib/payments-store'

const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET

type WebhookStatus =
  | 'waiting'
  | 'confirming'
  | 'confirmed'
  | 'sending'
  | 'finished'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'partially_paid'

interface NowPaymentsWebhookPayload {
  order_id?: string
  payment_id?: number
  payment_status?: WebhookStatus
}

function signPayload(rawBody: string): string {
  if (!NOWPAYMENTS_IPN_SECRET) return ''
  return crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET).update(rawBody).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    if (!NOWPAYMENTS_IPN_SECRET) {
      return NextResponse.json({ error: 'NOWPAYMENTS_IPN_SECRET no configurada' }, { status: 500 })
    }

    const rawBody = await req.text()
    const signature = req.headers.get('x-nowpayments-sig') || ''
    const computedSig = signPayload(rawBody)

    if (!signature || signature.toLowerCase() !== computedSig.toLowerCase()) {
      return NextResponse.json({ error: 'Firma invalida' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as NowPaymentsWebhookPayload

    if (!payload.order_id || !payload.payment_status) {
      return NextResponse.json({ error: 'Payload incompleto' }, { status: 400 })
    }

    await upsertPaymentStatusByOrderId(payload.order_id, payload.payment_status, String(payload.payment_id || ''))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('NOWPayments webhook error:', error)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}
