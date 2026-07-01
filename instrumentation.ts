import {
  isRenderKeepAliveEnabled,
  KEEP_ALIVE_INTERVAL_MS,
  KEEP_ALIVE_PATH,
  resolveKeepAliveBaseUrl,
} from '@/lib/render-keep-alive'

const STARTUP_DELAY_MS = 5_000
const RELAY_WARM_DELAY_MS = 12_000

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return

  const onRender = process.env.RENDER === 'true'

  if (isRenderKeepAliveEnabled()) {
    const baseUrl = resolveKeepAliveBaseUrl()
    if (baseUrl) {
      const intervalMs = Number(process.env.KEEP_ALIVE_INTERVAL_MS) || KEEP_ALIVE_INTERVAL_MS
      const target = `${baseUrl}${KEEP_ALIVE_PATH}`

      const ping = async () => {
        try {
          await fetch(target, {
            method: 'GET',
            cache: 'no-store',
            headers: { 'x-keep-alive': 'server' },
          })
        } catch {
          /* el servicio puede estar arrancando */
        }
      }

      setTimeout(() => {
        void ping()
        setInterval(() => void ping(), intervalMs)
      }, STARTUP_DELAY_MS)
    }
  }

  if (onRender && process.env.RELAY_AUTOSTART !== 'false') {
    setTimeout(() => {
      void (async () => {
        try {
          const { warmRelayCore, startRelay } = await import('@/lib/relay-engine')
          await warmRelayCore()
          const result = await startRelay()
          if (!result.ok) {
            console.warn('[relay] autostart:', result.message)
          }
        } catch (err) {
          console.warn('[relay] autostart error:', err)
        }
      })()
    }, RELAY_WARM_DELAY_MS)
  }
}
