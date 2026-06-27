import 'server-only'

import { getRequestIp } from '@/lib/request-ip'

/** IP del visitante detrás de Vercel / proxy. */
export function getClientIp(headerStore: Headers): string {
  return getRequestIp(headerStore)
}
