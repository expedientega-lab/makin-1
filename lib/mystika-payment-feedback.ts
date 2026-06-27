/** Mensajes al cancelar o fallar un pago — el progreso local no se borra. */

function readRuletaWinnings(): number {
  if (typeof window === 'undefined') return 0
  try {
    const n = parseFloat(localStorage.getItem('mystika-ruleta-winnings') || '0')
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

export type PaymentFeedbackKind = 'cancel' | 'error'

export function paymentFeedbackCopy(
  productId: string,
  kind: PaymentFeedbackKind,
): { title: string; description: string } {
  const saved = 'Tu progreso se guardó en este dispositivo.'

  if (productId === 'mystika-ruleta-tercera') {
    const winnings = readRuletaWinnings()
    const accum =
      winnings > 0
        ? ` Tenés $${winnings.toFixed(2)} acumulados.`
        : ' Seguís en el 2.º premio.'
    if (kind === 'cancel') {
      return {
        title: 'Pago cancelado',
        description: `${saved}${accum} Podés pagar el 3.er premio cuando quieras.`,
      }
    }
    return {
      title: 'No se pudo completar el pago',
      description: `${saved}${accum} Reintentá cuando quieras.`,
    }
  }

  if (productId === 'mystika-jackpot') {
    return {
      title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
      description: `${saved} La mesa jackpot sigue disponible.`,
    }
  }

  if (productId === 'mystika-jackpot-five') {
    return {
      title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
      description: `${saved} Podés abrir Ganate $5 cuando quieras.`,
    }
  }

  if (productId === 'mystika-mensaje-unlock') {
    return {
      title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
      description: `${saved} Podés desbloquear el portal cuando quieras por $1 USD.`,
    }
  }

  if (productId === 'mystika-orbe') {
    return {
      title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
      description: `${saved} Podés volver a intentar el acceso al orbe.`,
    }
  }

  if (productId.startsWith('mystika-galleta-')) {
    return {
      title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
      description: `${saved} Elegí otra categoría o reintentá el pago.`,
    }
  }

  if (
    productId === 'mystika-llave-1' ||
    productId === 'mystika-llave-5' ||
    productId === 'mystika-llave-20'
  ) {
    return {
      title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
      description: `${saved} Tus llaves guardadas no se modificaron.`,
    }
  }

  if (productId === 'mystika-cofres' || productId.startsWith('mystika-cofres-')) {
    return {
      title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
      description: `${saved} Los cofres siguen disponibles.`,
    }
  }

  if (productId.startsWith('mystika-donacion')) {
    return {
      title: kind === 'cancel' ? 'Donación cancelada' : 'No se pudo completar la donación',
      description: 'Podés reintentar cuando quieras. PayPal o tarjeta como invitado.',
    }
  }

  if (productId.startsWith('mystika-stiker-')) {
    return {
      title: kind === 'cancel' ? 'Compra cancelada' : 'No se pudo completar la compra',
      description: 'El stiker sigue disponible en la galería cuando quieras.',
    }
  }

  return {
    title: kind === 'cancel' ? 'Pago cancelado' : 'No se pudo completar el pago',
    description: saved,
  }
}
