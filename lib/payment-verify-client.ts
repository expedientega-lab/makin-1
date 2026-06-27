/** Verificación client-side contra el servidor — no confiar en localStorage solo. */

export type PaymentStatusResponse = {
  paid: boolean
  status?: string
  productId?: string
}

export async function fetchPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  const response = await fetch(
    `/api/payments/status?orderId=${encodeURIComponent(orderId)}`,
    { cache: 'no-store', credentials: 'include' },
  )
  if (!response.ok) {
    return { paid: false, status: 'error' }
  }
  return (await response.json()) as PaymentStatusResponse
}

export async function fetchProductPaymentStatus(productId: string): Promise<PaymentStatusResponse> {
  const response = await fetch(
    `/api/payments/status?productId=${encodeURIComponent(productId)}`,
    { cache: 'no-store', credentials: 'include' },
  )
  if (!response.ok) {
    return { paid: false, status: 'error' }
  }
  return (await response.json()) as PaymentStatusResponse
}

/** Espera confirmación server-side (capture o webhook) antes de desbloquear en cliente. */
export async function waitForServerPaymentConfirmation(
  orderId: string,
  opts?: { maxAttempts?: number; delayMs?: number },
): Promise<PaymentStatusResponse> {
  const maxAttempts = opts?.maxAttempts ?? 15
  const delayMs = opts?.delayMs ?? 800

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const data = await fetchPaymentStatus(orderId)
    if (data.paid) return data
    if (data.status === 'failed' || data.status === 'expired' || data.status === 'refunded') {
      return data
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  return { paid: false, status: 'timeout' }
}
