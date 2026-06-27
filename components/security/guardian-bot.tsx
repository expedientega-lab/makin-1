'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  isAutomatedBrowser,
  isDevToolsKeyboardEvent,
  isExtractionKeyboardEvent,
} from '@/lib/intrusion-detect'
import {
  createFetchIntegrityWatch,
  createFreezeWatchdog,
  createGeneralApiTracker,
  createPaymentAbuseTracker,
  createRAFFreezeWatchdog,
  createStorageGuard,
  createTabVisibilityGuard,
  createTamperObserver,
  createWorkerFreezeWatchdog,
  isEmbeddedInIframe,
  type GuardianThreat,
} from '@/lib/guardian-detect'
import { isLocalDevServer } from '@/lib/is-local-dev'
import { neutralizeNetwork, purgeClientSecrets } from '@/lib/guardian-purge'
import { ConnectionDeadScreen } from './connection-dead-screen'

const SIZE_THRESHOLD = 200
const CHECK_MS = 1200

/**
 * Bot guardián invisible. Solo actúa ante intrusión real; usuarios normales juegan sin interrupciones.
 */
export function GuardianBot() {
  const [killed, setKilled] = useState(false)
  const triggeredRef = useRef(false)

  const disconnectPage = useCallback(() => {
    purgeClientSecrets()
    neutralizeNetwork()
    setKilled(true)
  }, [])

  const armServerBlock = useCallback((reason: GuardianThreat) => {
    void fetch('/api/security/block', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, silent: true }),
    })
      .then(async (resp) => {
        const data = (await resp.json()) as {
          exempt?: boolean
          preview?: boolean
          dev?: boolean
        }
        if (data.exempt || data.preview || data.dev) return
        void fetch('/api/security/cutoff', {
          method: 'POST',
          credentials: 'include',
          keepalive: true,
        })
      })
      .catch(() => {})
  }, [])

  const silentKill = useCallback(
    (reason: GuardianThreat) => {
      if (triggeredRef.current) return

      const executeKill = () => {
        triggeredRef.current = true
        disconnectPage()
        armServerBlock(reason)
        window.setTimeout(() => {
          window.location.replace(window.location.pathname + window.location.search)
        }, 60)
      }

      if (process.env.NODE_ENV !== 'production') {
        void fetch('/api/security/block', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason, silent: true }),
        })
          .then(async (resp) => {
            const data = (await resp.json()) as {
              exempt?: boolean
              preview?: boolean
              dev?: boolean
            }
            if (data.exempt || data.preview || data.dev) return
            executeKill()
          })
          .catch(() => {})
        return
      }

      executeKill()
    },
    [disconnectPage, armServerBlock],
  )

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return
    if (isLocalDevServer()) return

    if (isAutomatedBrowser()) {
      silentKill('automation')
      return
    }

    if (isEmbeddedInIframe()) {
      silentKill('iframe_embed')
      return
    }

    const tabGuard = createTabVisibilityGuard()
    const isBackgrounded = () => tabGuard.isBackgrounded()
    const onFreeze = () => {
      if (isBackgrounded()) return
      silentKill('freeze')
    }

    const paymentTracker = createPaymentAbuseTracker()
    const apiTracker = createGeneralApiTracker()
    const freezeWatch = createFreezeWatchdog(onFreeze, isBackgrounded)
    const workerFreeze = createWorkerFreezeWatchdog(onFreeze, isBackgrounded)
    const rafFreeze = createRAFFreezeWatchdog(onFreeze, isBackgrounded)
    const storageGuard = createStorageGuard(() => silentKill('storage_tamper'))
    const tamperWatch = createTamperObserver(() => silentKill('tamper'))

    const originalFetch = window.fetch.bind(window)
    const guardedFetch: typeof window.fetch = async (input, init) => {
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const paymentHit = paymentTracker.record(url)
      const apiHit = !paymentHit && apiTracker.record(url)
      if (paymentHit || apiHit) {
        silentKill(paymentHit ? 'payment_abuse' : 'api_flood')
        return Promise.reject(new TypeError('Failed to fetch'))
      }
      return originalFetch(input, init)
    }
    window.fetch = guardedFetch
    const fetchIntegrity = createFetchIntegrityWatch(guardedFetch, () =>
      silentKill('fetch_tamper'),
    )

    const detectBySize = () => {
      const wDiff = window.outerWidth - window.innerWidth
      const hDiff = window.outerHeight - window.innerHeight
      return wDiff > SIZE_THRESHOLD || hDiff > SIZE_THRESHOLD
    }

    const interval = window.setInterval(() => {
      if (triggeredRef.current || isBackgrounded()) return
      if (isEmbeddedInIframe()) {
        silentKill('iframe_embed')
        return
      }
      if (detectBySize()) {
        silentKill('devtools')
      }
    }, CHECK_MS)

    const onKeyDown = (e: KeyboardEvent) => {
      if (triggeredRef.current) return

      if (isExtractionKeyboardEvent(e)) {
        e.preventDefault()
        e.stopPropagation()
        silentKill('devtools')
        return
      }

      if (isDevToolsKeyboardEvent(e)) {
        e.preventDefault()
        e.stopPropagation()
        silentKill('devtools')
      }
    }

    const onContextMenu = (e: MouseEvent) => {
      if (triggeredRef.current) return
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      silentKill('contextmenu')
    }

    const onSelectStart = (e: Event) => {
      if (triggeredRef.current) return
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable='true']")) return
      e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('contextmenu', onContextMenu, true)
    window.addEventListener('selectstart', onSelectStart, true)

    return () => {
      window.clearInterval(interval)
      tabGuard.dispose()
      freezeWatch.dispose()
      workerFreeze.dispose()
      rafFreeze.dispose()
      storageGuard.dispose()
      fetchIntegrity.dispose()
      tamperWatch.dispose()
      window.fetch = originalFetch
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('contextmenu', onContextMenu, true)
      window.removeEventListener('selectstart', onSelectStart, true)
    }
  }, [silentKill])

  if (!killed) return null

  return <ConnectionDeadScreen />
}
