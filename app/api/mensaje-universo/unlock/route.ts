import { NextRequest, NextResponse } from "next/server"
import { getOrCreateMkClientId } from "@/lib/mk-client-id"
import { MENSAJE_UNLOCK_PRODUCT_ID } from "@/lib/mensaje-constants"
import { unlockMensajePortal } from "@/lib/mensaje-store"
import { getOrderById } from "@/lib/payments-store"
import { blockedIpResponse } from "@/lib/security-guard"

const PAID_STATUSES = new Set(["finished", "confirmed", "sending"])

/** Confirma desbloqueo tras pago confirmado (p. ej. retorno por URL / crypto). PayPal lo aplica en capture. */
export async function POST(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const clientId = await getOrCreateMkClientId()

  let orderId: string | undefined
  try {
    const body = (await req.json()) as { orderId?: string }
    orderId = typeof body.orderId === "string" ? body.orderId.trim() : undefined
  } catch {
    orderId = undefined
  }

  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 })
  }

  const order = await getOrderById(orderId)
  if (
    !order ||
    order.clientId !== clientId ||
    order.productId !== MENSAJE_UNLOCK_PRODUCT_ID ||
    !PAID_STATUSES.has(order.paymentStatus)
  ) {
    return NextResponse.json({ error: "Pago no válido para desbloqueo" }, { status: 402 })
  }

  await unlockMensajePortal(clientId)

  return NextResponse.json({ unlocked: true, locked: false })
}
