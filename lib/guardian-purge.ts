/** Borra datos sensibles del cliente antes de desactivar la página. */

const SENSITIVE_PREFIXES = [
  'mystika-',
  'mk_',
  'paypal',
  'payment',
  'jackpot',
  'ruleta',
  'llave',
  'cofre',
  'orbe',
]

let internalPurge = false

/** Evita que los hooks de storage disparen falsa alarma durante la purga propia. */
export function isInternalPurge(): boolean {
  return internalPurge
}

export function purgeClientSecrets(): void {
  if (typeof window === 'undefined') return

  internalPurge = true
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && SENSITIVE_PREFIXES.some((p) => key.toLowerCase().includes(p))) {
        keys.push(key)
      }
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }

  try {
    sessionStorage.clear()
  } catch {
    // ignore
  } finally {
    internalPurge = false
  }
}

export function neutralizeNetwork(): void {
  if (typeof window === 'undefined') return

  const reject = () => Promise.reject(new TypeError('Failed to fetch'))
  window.fetch = reject as typeof window.fetch

  if (typeof XMLHttpRequest !== 'undefined') {
    const Proto = XMLHttpRequest.prototype
    Proto.open = function () {
      return
    }
    Proto.send = function () {
      return
    }
  }

  try {
    navigator.sendBeacon = () => false
  } catch {
    // ignore
  }

  try {
    const blocked = function () {
      throw new TypeError('Failed to construct WebSocket')
    } as unknown as typeof WebSocket
    window.WebSocket = blocked
  } catch {
    // ignore
  }

  try {
    const blocked = function () {
      throw new TypeError('Failed to construct EventSource')
    } as unknown as typeof EventSource
    window.EventSource = blocked
  } catch {
    // ignore
  }
}
