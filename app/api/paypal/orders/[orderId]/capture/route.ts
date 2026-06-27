import { NextRequest, NextResponse } from 'next/server'
import { capturePaypalOrder, getPaypalOrder } from '@/lib/paypal-api'
import { amountsMatch, fulfillPaypalOrderPayment } from '@/lib/paypal-fulfill'
import {
  ensureOrderRecord,
  getOrderById,
} from '@/lib/payments-store'
import { findProduct, productPriceUsd } from '@/lib/products'
import {
  DONACION_CUSTOM_PRODUCT_ID,
  expectedDonacionAmountUsd,
  isDonacionProduct,
  parseCustomDonacionAmount,
} from '@/lib/donacion-products'
import { getOrCreateMkClientId } from '@/lib/mk-client-id'
import { blockedIpResponse } from '@/lib/security-guard'

export const runtime = 'nodejs'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

type PaypalCapturePayload = {
  status?: string
  id?: string
  purchase_units?: Array<{
    custom_id?: string
    amount?: { value?: string; currency_code?: string }
    payments?: {
      captures?: Array<{
        id?: string
        amount?: { value?: string; currency_code?: string }
        status?: string
      }>
    }
  }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const blocked = await blockedIpResponse(req.headers)
    if (blocked) return blocked

    const { orderId } = await params
    const sessionClientId = await getOrCreateMkClientId()

    let pending = await getOrderById(orderId)

    if (pending && pending.clientId !== sessionClientId) {
      return NextResponse.json(
        { error: 'Esta orden no pertenece a tu sesión.' },
        { status: 403 },
      )
    }

    if (!pending?.productId) {
      const orderDetails = await getPaypalOrder(orderId)
      const productId = orderDetails.purchase_units?.[0]?.custom_id

      if (!productId || !findProduct(productId)) {
        return NextResponse.json(
          {
            error:
              'No hay una orden pendiente asociada a esta sesión. Volvé a abrir el pago desde esta página e intentá de nuevo.',
          },
          { status: 400 },
        )
      }

      const amountOnOrder = orderDetails.purchase_units?.[0]?.amount?.value
      const expectedFromOrder = isDonacionProduct(productId)
        ? expectedDonacionAmountUsd(
            productId,
            productId === DONACION_CUSTOM_PRODUCT_ID
              ? parseCustomDonacionAmount(amountOnOrder) ?? undefined
              : undefined,
          )
        : productPriceUsd(productId)
      if (
        expectedFromOrder !== null &&
        amountOnOrder &&
        !amountsMatch(amountOnOrder, expectedFromOrder)
      ) {
        return NextResponse.json({ error: 'Monto inconsistente para este producto.' }, { status: 422 })
      }

      const clientId = sessionClientId
      pending = await ensureOrderRecord(orderId, clientId, productId)
    }

    if (!pending) {
      return NextResponse.json({ error: 'No se pudo resolver la orden de pago.' }, { status: 400 })
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
    const paypalCaptureId = capturePayload.purchase_units?.[0]?.payments?.captures?.[0]?.id

    const fulfilled = await fulfillPaypalOrderPayment({
      orderId,
      captureId: paypalCaptureId ?? capturePayload.id,
      paidUsd,
    })

    if (!fulfilled.ok) {
      return NextResponse.json({ error: fulfilled.reason }, { status: fulfilled.status ?? 422 })
    }

    return NextResponse.json({
      ...capturePayload,
      verified: true,
      productId: fulfilled.order.productId,
      orderId,
    })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: 'No se pudo capturar el pago' }, { status: 500 })
  }
}
