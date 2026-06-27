import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateMkClientId } from '@/lib/mk-client-id'
import { isPaidStatus } from '@/lib/paypal-fulfill'
import { getOrderById, hasClientPaidForProducts } from '@/lib/payments-store'
import { findProduct } from '@/lib/products'
import { blockedIpResponse } from '@/lib/security-guard'

const PRODUCT_GROUPS: Record<string, string[]> = {
  mystika: ['mystika-orbe', 'mystika-galleta', 'mystika-ruleta'],
  clawzone: ['clawzone-access'],
}

export async function GET(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const area = searchParams.get('area')
  const productId = searchParams.get('productId')

  const clientId = await getOrCreateMkClientId()

  if (orderId) {
    const order = await getOrderById(orderId)
    if (!order || order.clientId !== clientId) {
      return NextResponse.json({ paid: false, status: 'not_found' })
    }
    const paid = isPaidStatus(order.paymentStatus)
    return NextResponse.json({
      paid,
      status: order.paymentStatus,
      productId: order.productId,
      orderId: order.orderId,
    })
  }

  if (productId) {
    if (!findProduct(productId)) {
      return NextResponse.json({ error: 'Producto invalido' }, { status: 400 })
    }
    const paid = await hasClientPaidForProducts(clientId, [productId])
    return NextResponse.json({ paid, status: paid ? 'paid' : 'unpaid', productId })
  }

  if (area && PRODUCT_GROUPS[area]) {
    const paid = await hasClientPaidForProducts(clientId, PRODUCT_GROUPS[area])
    return NextResponse.json({ paid, status: paid ? 'paid' : 'unpaid' })
  }

  return NextResponse.json({ error: 'Falta orderId, productId o area valido' }, { status: 400 })
}
