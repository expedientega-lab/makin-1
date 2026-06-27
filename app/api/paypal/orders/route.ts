import { NextRequest, NextResponse } from 'next/server'
import { findProduct } from '@/lib/products'
import {
  DONACION_CUSTOM_PRODUCT_ID,
  expectedDonacionAmountUsd,
  isDonacionProduct,
  parseCustomDonacionAmount,
} from '@/lib/donacion-products'
import { createPaypalOrder } from '@/lib/paypal-api'
import { getOrCreateMkClientId } from '@/lib/mk-client-id'
import { createPendingOrder } from '@/lib/payments-store'
import { blockedIpResponse } from '@/lib/security-guard'

export const runtime = 'nodejs'

function formatPaypalRouteError(error: unknown): { error: string; detail?: string } {
  const message = error instanceof Error ? error.message : String(error)
  const shortDetail = message.length > 500 ? `${message.slice(0, 500)}…` : message

  if (message.includes('Faltan PAYPAL_CLIENT_ID') || message.includes('Faltan PAYPAL')) {
    return {
      error:
        'PayPal no esta configurado en el servidor. Agrega PAYPAL_CLIENT_ID y PAYPAL_SECRET en Vercel (o .env.local).',
      detail: shortDetail,
    }
  }

  if (
    message.includes('invalid_client') ||
    message.includes('Unauthorized') ||
    message.toLowerCase().includes('access token')
  ) {
    return {
      error:
        'PayPal rechazó Client ID / Secret (INVALID_CLIENT). Con API Live necesitás las claves de developer.paypal.com con Sandbox DESACTIVADO. Las claves Sandbox nunca sirven contra Live. En Vercel con pruebas: PAYPAL_SANDBOX=true. En local sólo Sandbox: quitá PAYPAL_LIVE_DEV.',
      detail: shortDetail,
    }
  }

  return { error: 'No se pudo crear la orden', detail: shortDetail }
}

export async function POST(req: NextRequest) {
  try {
    const blocked = await blockedIpResponse(req.headers)
    if (blocked) return blocked

    const body = (await req.json()) as { productId?: string; amountUsd?: number }
    const productId = body.productId || 'mystika-orbe'
    const product = findProduct(productId)
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    let amount = product.priceInCents / 100
    let storedAmountUsd: number | undefined

    if (productId === DONACION_CUSTOM_PRODUCT_ID) {
      const customAmount = parseCustomDonacionAmount(body.amountUsd)
      if (customAmount === null) {
        return NextResponse.json(
          { error: 'Monto de donación inválido. Usá entre USD 1 y USD 9.999.' },
          { status: 400 },
        )
      }
      amount = customAmount
      storedAmountUsd = customAmount
    } else if (isDonacionProduct(productId)) {
      storedAmountUsd = amount
    }

    const clientId = await getOrCreateMkClientId()

    const order = (await createPaypalOrder(amount, product.description, productId)) as { id?: string }
    const paypalOrderId = order?.id
    if (!paypalOrderId) {
      throw new Error('PayPal respondio una orden sin id')
    }

    await createPendingOrder(paypalOrderId, clientId, productId, storedAmountUsd)
    return NextResponse.json(order)
  } catch (error) {
    const formatted = formatPaypalRouteError(error)
    console.error('PayPal create order error:', formatted.detail ?? error)
    return NextResponse.json(formatted, { status: 500 })
  }
}
