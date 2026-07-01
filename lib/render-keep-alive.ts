/** Render apaga tras ~2 min sin tráfico — ping cada 45 s para margen seguro. */
export const KEEP_ALIVE_INTERVAL_MS = 45 * 1000

/** Heartbeat del cliente con la misma cadencia cuando hay pestaña abierta. */
export const CLIENT_KEEP_ALIVE_INTERVAL_MS = 45 * 1000

export const KEEP_ALIVE_PATH = '/api/keep-alive'

export function isRenderKeepAliveEnabled(): boolean {
  if (process.env.ENABLE_RENDER_KEEP_ALIVE === 'false') return false
  return process.env.RENDER === 'true' || process.env.ENABLE_RENDER_KEEP_ALIVE === 'true'
}

export function resolveKeepAliveBaseUrl(): string | null {
  const explicit = process.env.KEEP_ALIVE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const renderUrl = process.env.RENDER_EXTERNAL_URL?.trim()
  if (renderUrl) return renderUrl.replace(/\/$/, '')

  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT?.trim() || '3000'
    return `http://127.0.0.1:${port}`
  }

  return null
}
