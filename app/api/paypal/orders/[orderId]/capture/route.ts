import { NextRequest, NextResponse } from 'next/server'
import { capturePaypalOrder } from '@/lib/paypal-api'
import { PRODUCTS } from '@/lib/products'
import { getOrderById, upsertPaymentStatusByOrderId } from '@/lib/payments-store'

export const runtime = 'nodejs'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

type PaypalCapturePayload = {
  status?: string
  id?: string
  purchase_units?: Array<{
    amount?: { value?: string; currency_code?: string }
    payments?: {
      captures?: Array<{ id?: string; amount?: { value?: string; currency_code?: string }; status?: string }>
    }
  }>
}

function paypalExpectedAmountUsd(productId: string): number | null {
  const product = PRODUCTS.find((p) => p.id === productId)
  return product ? product.priceInCents / 100 : null
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params

    const pending = await getOrderById(orderId)
    if (!pending) {
      return NextResponse.json(
        {
          error:
            'No hay una orden pendiente asociada a esta sesión. Abrí el cobro desde esta página (no recargando en otro equipo) e intentá de nuevo.',
        },
        { status: 400 },
      )
    }

    const capturePayload = (await capturePaypalOrder(orderId)) as PaypalCapturePayload
    const captureStatus =
      capturePayload.status ??
      capturePayload.purchase_units?.[0]?.payments?.captures?.[0]?.status

    if (captureStatus !== 'COMPLETED') {
      console.error('PayPal capture no completado:', captureStatus, orderId)
      return NextResponse.json(
        { error: 'El cobro no se completó en PayPal.', status: captureStatus },
        { status: 422 },
      )
    }

    const paidUsd = capturePayload.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value
    const expectedUsd = paypalExpectedAmountUsd(pending.productId)

    if (paidUsd !== undefined && expectedUsd !== null) {
      const paid = Number.parseFloat(String(paidUsd))
      const exp = Number.parseFloat(expectedUsd.toFixed(2))
      const ok = Number.isFinite(paid) && Math.abs(paid - exp) < 0.009
      if (!ok) {
        console.error('PayPal capture monto inconsistente:', { orderId, paidUsd, expectedUsd: exp })
        return NextResponse.json({ error: 'Monto inconsistente para este producto.' }, { status: 422 })
      }
    }

    const paypalCaptureId = capturePayload.purchase_units?.[0]?.payments?.captures?.[0]?.id
    await upsertPaymentStatusByOrderId(orderId, 'finished', paypalCaptureId ?? capturePayload.id)

    return NextResponse.json(capturePayload)
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: 'No se pudo capturar el pago' }, { status: 500 })
  }
}
