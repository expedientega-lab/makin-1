import {
  isRenderKeepAliveEnabled,
  KEEP_ALIVE_INTERVAL_MS,
  KEEP_ALIVE_PATH,
  resolveKeepAliveBaseUrl,
} from '@/lib/render-keep-alive'

const STARTUP_DELAY_MS = 5_000

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return
  if (!isRenderKeepAliveEnabled()) return

  const baseUrl = resolveKeepAliveBaseUrl()
  if (!baseUrl) return

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
