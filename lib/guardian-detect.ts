/** Detectores silenciosos del bot guardián (sin efectos secundarios visibles). */

import { isInternalPurge } from '@/lib/guardian-purge'

const PAYMENT_PATHS = [
  '/api/paypal',
  '/api/payments',
  '/api/game/authorize',
  '/api/nowpayments',
]

const SECURITY_API = '/api/security/'

/** Claves que la app usa al jugar — no disparar alarma si las tocan. */
const APP_STORAGE_PREFIXES = [
  'mystika-',
  'mk_',
  'jackpot',
  'ruleta',
  'llave',
  'cofre',
  'orbe',
  'paypal',
  'payment',
]

export type GuardianThreat =
  | 'devtools'
  | 'screenshot'
  | 'contextmenu'
  | 'automation'
  | 'freeze'
  | 'payment_abuse'
  | 'tamper'
  | 'script_injection'
  | 'iframe_embed'
  | 'fetch_tamper'
  | 'storage_tamper'
  | 'api_flood'

export function isPaymentEndpoint(url: string): boolean {
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url
    return PAYMENT_PATHS.some((p) => path.startsWith(p))
  } catch {
    return PAYMENT_PATHS.some((p) => url.includes(p))
  }
}

export function isEmbeddedInIframe(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

export function isAppStorageKey(key: unknown): boolean {
  if (typeof key !== 'string') return false
  const lower = key.toLowerCase()
  return APP_STORAGE_PREFIXES.some((p) => lower.includes(p))
}

/** Borrado desde consola/DevTools, no desde el bundle de la app. */
export function isLikelyConsoleStorageTamper(): boolean {
  if (isInternalPurge()) return false
  const stack = new Error().stack ?? ''
  if (
    stack.includes('guardian-purge') ||
    stack.includes('_next/static') ||
    stack.includes('webpack')
  ) {
    return false
  }
  return /\(eval|VM\d+:<|@debugger|devtools/i.test(stack)
}

export function createPaymentAbuseTracker(maxCalls = 36, windowMs = 45_000) {
  const hits: number[] = []

  return {
    record(url: string): boolean {
      if (!isPaymentEndpoint(url)) return false
      const now = Date.now()
      while (hits.length && now - hits[0] > windowMs) hits.shift()
      hits.push(now)
      return hits.length >= maxCalls
    },
  }
}

/** Límite de abuso — excluye polling de estado de pago. */
export function createGeneralApiTracker(maxCalls = 140, windowMs = 60_000) {
  const hits: number[] = []

  return {
    record(url: string): boolean {
      if (!url.includes('/api/')) return false
      if (url.includes(SECURITY_API)) return false
      if (url.includes('/api/keep-alive')) return false
      if (url.includes('/api/payments/status')) return false
      const now = Date.now()
      while (hits.length && now - hits[0] > windowMs) hits.shift()
      hits.push(now)
      return hits.length >= maxCalls
    },
  }
}

/** Pausa detectores cuando la pestaña está en segundo plano (móvil / multitarea). */
export function createTabVisibilityGuard() {
  let hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden'

  const onChange = () => {
    hidden = document.visibilityState === 'hidden'
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onChange)
  }

  return {
    isBackgrounded: () => hidden,
    dispose() {
      document.removeEventListener('visibilitychange', onChange)
    },
  }
}

export function createFreezeWatchdog(
  onFreeze: () => void,
  isBackgrounded: () => boolean,
  thresholdMs = 8000,
  tickMs = 900,
) {
  let expected = Date.now() + tickMs
  let armed = true

  const interval = setInterval(() => {
    if (!armed || isBackgrounded()) {
      expected = Date.now() + tickMs
      return
    }
    const now = Date.now()
    if (now - expected > thresholdMs) {
      onFreeze()
    }
    expected = now + tickMs
  }, tickMs)

  return {
    dispose() {
      armed = false
      clearInterval(interval)
    },
  }
}

export function createWorkerFreezeWatchdog(
  onFreeze: () => void,
  isBackgrounded: () => boolean,
  maxLagMs = 7500,
) {
  if (typeof Worker === 'undefined') return { dispose: () => {} }

  let armed = true
  let lastPing = Date.now()
  let worker: Worker | null = null
  let url: string | null = null

  try {
    const code = `setInterval(function(){postMessage(1)},500);`
    url = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }))
    worker = new Worker(url)
    worker.onmessage = () => {
      lastPing = Date.now()
    }
  } catch {
    return { dispose: () => {} }
  }

  const interval = setInterval(() => {
    if (!armed || isBackgrounded()) {
      lastPing = Date.now()
      return
    }
    if (Date.now() - lastPing > maxLagMs) onFreeze()
  }, 520)

  return {
    dispose() {
      armed = false
      clearInterval(interval)
      worker?.terminate()
      if (url) URL.revokeObjectURL(url)
    },
  }
}

export function createRAFFreezeWatchdog(
  onFreeze: () => void,
  isBackgrounded: () => boolean,
  maxGapMs = 7000,
) {
  let armed = true
  let last = performance.now()
  let rafId = 0

  const tick = (now: number) => {
    if (!armed) return
    if (!isBackgrounded() && now - last > maxGapMs) onFreeze()
    last = now
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)

  return {
    dispose() {
      armed = false
      cancelAnimationFrame(rafId)
    },
  }
}

export function createFetchIntegrityWatch(
  guardedFetch: typeof window.fetch,
  onTamper: () => void,
  checkMs = 2500,
) {
  let armed = true
  const interval = setInterval(() => {
    if (!armed) return
    if (window.fetch !== guardedFetch) onTamper()
  }, checkMs)

  return {
    dispose() {
      armed = false
      clearInterval(interval)
    },
  }
}

/** Solo alerta si borran claves ajenas a la app o vacían todo desde consola. */
export function createStorageGuard(onTamper: () => void) {
  if (typeof Storage === 'undefined') return { dispose: () => {} }

  const proto = Storage.prototype
  const origRemove = proto.removeItem
  const origClear = proto.clear

  proto.removeItem = function (key: string) {
    if (isInternalPurge() || isAppStorageKey(key) || !isLikelyConsoleStorageTamper()) {
      return origRemove.call(this, key)
    }
    onTamper()
    return origRemove.call(this, key)
  }

  proto.clear = function () {
    if (isInternalPurge() || !isLikelyConsoleStorageTamper()) {
      return origClear.call(this)
    }
    onTamper()
    return origClear.call(this)
  }

  return {
    dispose() {
      proto.removeItem = origRemove
      proto.clear = origClear
    },
  }
}

const TRUSTED_SCRIPT_HOSTS = [
  'paypal.com',
  'sandbox.paypal.com',
  'vercel-insights.com',
  'vercel.app',
  'google-analytics.com',
  'googletagmanager.com',
]

export function createTamperObserver(onTamper: () => void) {
  if (typeof MutationObserver === 'undefined') return { dispose: () => {}, markAnchor: () => {} }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type !== 'childList') continue
      for (const node of m.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue
        const el = node as HTMLElement
        if (el.tagName !== 'SCRIPT') continue
        const src = (el as HTMLScriptElement).src
        if (
          src &&
          !src.includes(window.location.hostname) &&
          !TRUSTED_SCRIPT_HOSTS.some((h) => src.includes(h))
        ) {
          onTamper()
          return
        }
      }
    }
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })

  return {
    markAnchor(_el: HTMLElement) {
      // reservado — PayPal modifica estilos legítimamente; no vigilar anclas
    },
    dispose() {
      observer.disconnect()
    },
  }
}
