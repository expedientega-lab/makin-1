import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MK_CLIENT_COOKIE } from '@/lib/mk-client-id'
import { getOrderById, hasClientPaidForProducts } from '@/lib/payments-store'

const PRODUCT_GROUPS: Record<string, string[]> = {
  mystika: ['mystika-orbe', 'mystika-galleta', 'mystika-ruleta'],
  clawzone: ['clawzone-access'],
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const area = searchParams.get('area')

  const cookieStore = await cookies()
  const clientId = cookieStore.get(MK_CLIENT_COOKIE)?.value

  if (!clientId) {
    return NextResponse.json({ paid: false, status: 'no_client' })
  }

  if (orderId) {
    const order = await getOrderById(orderId)
    if (!order || order.clientId !== clientId) {
      return NextResponse.json({ paid: false, status: 'not_found' })
    }
    const paid = ['finished', 'confirmed', 'sending'].includes(order.paymentStatus)
    return NextResponse.json({
      paid,
      status: order.paymentStatus,
      productId: order.productId,
    })
  }

  if (area && PRODUCT_GROUPS[area]) {
    const paid = await hasClientPaidForProducts(clientId, PRODUCT_GROUPS[area])
    return NextResponse.json({ paid, status: paid ? 'paid' : 'unpaid' })
  }

  return NextResponse.json({ error: 'Falta orderId o area valido' }, { status: 400 })
}
