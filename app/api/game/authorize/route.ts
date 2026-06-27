import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MK_CLIENT_COOKIE } from '@/lib/mk-client-id'
import { authorizeGameUse } from '@/lib/game-session-store'
import { hasClientPaidForProducts } from '@/lib/payments-store'
import { findProduct } from '@/lib/products'
import { blockedIpResponse } from '@/lib/security-guard'
import { isRateLimited } from '@/lib/security-rate-limit'
import { getClientIp } from '@/lib/client-ip'

export const runtime = 'nodejs'

const MAX_SPINS: Record<string, number> = {
  'mystika-jackpot': 3,
  'mystika-jackpot-five': 1,
}

export async function POST(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const ip = getClientIp(req.headers)
  if (isRateLimited(`game-auth:${ip}`, 60, 60_000)) {
    return NextResponse.json({ ok: false, reason: 'Demasiados intentos' }, { status: 429 })
  }

  const cookieStore = await cookies()
  const clientId = cookieStore.get(MK_CLIENT_COOKIE)?.value
  if (!clientId) {
    return NextResponse.json({ ok: false, reason: 'Sesión inválida' }, { status: 401 })
  }

  let body: { productId?: string; orderId?: string; checkOnly?: boolean }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, reason: 'JSON inválido' }, { status: 400 })
  }

  const productId = body.productId?.trim()
  const orderId = body.orderId?.trim()

  if (!productId || !findProduct(productId)) {
    return NextResponse.json({ ok: false, reason: 'Producto inválido' }, { status: 400 })
  }

  if (productId === 'mystika-ruleta-tercera') {
    const paid = await hasClientPaidForProducts(clientId, [productId])
    return NextResponse.json({
      ok: paid,
      paid,
      reason: paid ? undefined : 'Pago no confirmado para el 3er premio.',
    })
  }

  if (!orderId) {
    return NextResponse.json({ ok: false, reason: 'orderId requerido' }, { status: 400 })
  }

  const maxSpins = MAX_SPINS[productId]
  if (!maxSpins) {
    return NextResponse.json({ ok: false, reason: 'Producto no autorizable' }, { status: 400 })
  }

  const result = await authorizeGameUse({
    clientId,
    productId,
    orderId,
    maxSpins,
    consume: !body.checkOnly,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: result.status })
  }

  return NextResponse.json(result)
}
