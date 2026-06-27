/** Autorización server-side antes de acciones de juego pagas. */

export type GameAuthorizeResponse =
  | { ok: true; spin?: number; spinsUsed?: number; maxSpins?: number; paid?: boolean }
  | { ok: false; reason?: string; paid?: boolean }

export async function authorizeGameAction(
  productId: string,
  orderId: string | null,
  options?: { checkOnly?: boolean },
): Promise<GameAuthorizeResponse> {
  if (!orderId) {
    return { ok: false, reason: 'Sin orden de pago' }
  }

  try {
    const resp = await fetch('/api/game/authorize', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        productId,
        orderId,
        checkOnly: options?.checkOnly ?? false,
      }),
    })
    const data = (await resp.json()) as GameAuthorizeResponse
    return data
  } catch {
    return { ok: false, reason: 'Error de red' }
  }
}

export async function verifyRuletaThirdPaid(): Promise<boolean> {
  try {
    const resp = await fetch('/api/game/authorize', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ productId: 'mystika-ruleta-tercera' }),
    })
    const data = (await resp.json()) as GameAuthorizeResponse
    return Boolean(data.ok && data.paid)
  } catch {
    return false
  }
}

/** Si localStorage dice "pagado" pero el servidor no, limpia la trampa. */
export async function reconcilePaidSession(
  productId: string,
  orderId: string | null,
  clearLocal: () => void,
): Promise<boolean> {
  if (!orderId) {
    clearLocal()
    return false
  }
  const auth = await authorizeGameAction(productId, orderId, { checkOnly: true })
  if (!auth.ok) {
    clearLocal()
    return false
  }
  return true
}
