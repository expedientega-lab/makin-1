import { findProduct } from '@/lib/products'

export const DONACION_CUSTOM_PRODUCT_ID = 'mystika-donacion-custom'

export const DONACION_FIXED_AMOUNTS = [3, 5, 10, 20] as const

export function isDonacionProduct(productId: string): boolean {
  return productId.startsWith('mystika-donacion')
}

export function donacionProductIdForAmount(amountUsd: number): string {
  const rounded = Math.round(amountUsd * 100) / 100
  if ((DONACION_FIXED_AMOUNTS as readonly number[]).includes(rounded)) {
    return `mystika-donacion-${rounded}`
  }
  return DONACION_CUSTOM_PRODUCT_ID
}

export function parseCustomDonacionAmount(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  if (!Number.isFinite(amount)) return null
  const rounded = Math.round(amount * 100) / 100
  if (rounded < 1 || rounded > 9999) return null
  return rounded
}

export function expectedDonacionAmountUsd(
  productId: string,
  storedAmountUsd?: number,
): number | null {
  if (productId === DONACION_CUSTOM_PRODUCT_ID) {
    return storedAmountUsd !== undefined ? storedAmountUsd : null
  }
  const product = findProduct(productId)
  if (!product || !isDonacionProduct(productId)) return null
  return product.priceInCents / 100
}

export function donacionPayCopy(amountUsd: number) {
  const formatted = amountUsd.toLocaleString('es-AR', {
    minimumFractionDigits: amountUsd % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return {
    title: `Donación — $${formatted} USD`,
    description:
      'Pagá con PayPal o tarjeta. Tu aporte te incluye en el sorteo diario por USD 2.000, USD 500 y USD 100.',
  }
}
