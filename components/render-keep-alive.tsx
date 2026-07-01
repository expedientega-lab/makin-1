'use client'

import { useEffect } from 'react'
import { CLIENT_KEEP_ALIVE_INTERVAL_MS, KEEP_ALIVE_PATH } from '@/lib/render-keep-alive'

/**
 * Heartbeat invisible: mantiene tráfico HTTP mientras alguien tiene la pestaña abierta.
 * En Render, el ping del servidor (instrumentation.ts) cubre el caso sin visitantes.
 */
export function RenderKeepAlive() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (process.env.NEXT_PUBLIC_ENABLE_RENDER_KEEP_ALIVE === 'false') return

    const ping = () => {
      void fetch(KEEP_ALIVE_PATH, {
        method: 'GET',
        cache: 'no-store',
        keepalive: true,
        headers: { 'x-keep-alive': 'client' },
      }).catch(() => {})
    }

    ping()

    const interval = window.setInterval(ping, CLIENT_KEEP_ALIVE_INTERVAL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') ping()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return null
}
