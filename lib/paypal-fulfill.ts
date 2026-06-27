import 'server-only'

import { unlockMensajePortal } from '@/lib/mensaje-store'
import { MENSAJE_UNLOCK_PRODUCT_ID } from '@/lib/mensaje-constants'
import {
  expectedDonacionAmountUsd,
  isDonacionProduct,
} from '@/lib/donacion-products'
import {
  getOrderById,
  upsertPaymentStatusByOrderId,
  type StoredOrder,
} from '@/lib/payments-store'
import { findProduct, productPriceUsd } from '@/lib/products'

type StoredPaymentStatus = 'finished' | 'confirmed' | 'sending'

export const PAYPAL_PAID_STATUSES: StoredPaymentStatus[] = ['finished', 'confirmed', 'sending']

const PAID_SET = new Set<string>(PAYPAL_PAID_STATUSES)

export function amountsMatch(paidUsd: string | undefined, expectedUsd: number): boolean {
  if (paidUsd === undefined || paidUsd === '') {
    return process.env.NODE_ENV !== 'production'
  }
  const paid = Number.parseFloat(String(paidUsd))
  const exp = Number.parseFloat(expectedUsd.toFixed(2))
  return Number.isFinite(paid) && Math.abs(paid - exp) < 0.009
}

export function isPaidStatus(status: string): boolean {
  return PAID_SET.has(status)
}

export type FulfillPaypalPaymentInput = {
  orderId: string
  captureId?: string
  paidUsd?: string
}

export type FulfillPaypalPaymentResult =
  | { ok: true; order: StoredOrder; alreadyFulfilled: boolean }
  | { ok: false; reason: string; status?: number }

/** Marca la orden como pagada y aplica desbloqueos server-side (idempotente). */
export async function fulfillPaypalOrderPayment(
  input: FulfillPaypalPaymentInput,
): Promise<FulfillPaypalPaymentResult> {
  const { orderId, captureId, paidUsd } = input

  const order = await getOrderById(orderId)
  if (!order) {
    return { ok: false, reason: 'Orden no registrada', status: 404 }
  }

  if (!findProduct(order.productId)) {
    return { ok: false, reason: 'Producto desconocido', status: 400 }
  }

  if (isPaidStatus(order.paymentStatus)) {
    return { ok: true, order, alreadyFulfilled: true }
  }

  const expectedUsd = isDonacionProduct(order.productId)
    ? expectedDonacionAmountUsd(order.productId, order.amountUsd)
    : productPriceUsd(order.productId)
  if (expectedUsd !== null && paidUsd !== undefined && !amountsMatch(paidUsd, expectedUsd)) {
    return { ok: false, reason: 'Monto inconsistente para este producto', status: 422 }
  }

  await upsertPaymentStatusByOrderId(orderId, 'finished', captureId)

  if (order.productId === MENSAJE_UNLOCK_PRODUCT_ID) {
    await unlockMensajePortal(order.clientId)
  }

  const updated = (await getOrderById(orderId)) ?? order
  return { ok: true, order: updated, alreadyFulfilled: false }
}
