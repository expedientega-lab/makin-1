import 'server-only'

import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { isIpBlocked } from '@/lib/ip-block-store'
import { isIpBlockExempt } from '@/lib/ip-security'
import { HARD_CUTOFF_COOKIE } from '@/lib/security-cookies'
import { applySecurityHeaders, SECURITY_HEADERS } from '@/lib/security-headers'

export { SECURITY_HEADERS, applySecurityHeaders }

/** Corta la request si la IP está bloqueada (excepto whitelist del dueño). */
export async function blockedIpResponse(
  headers: Headers,
): Promise<NextResponse | null> {
  const ip = getClientIp(headers)
  if (!ip || ip === 'desconocida') return null
  if (isIpBlockExempt(ip)) return null
  if (!(await isIpBlocked(ip))) return null

  return applySecurityHeaders(
    new NextResponse(null, {
      status: 403,
      headers: {
        Connection: 'close',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    }),
  )
}

/** Activa corte de red inmediato al bloquear (no espera al JS del cliente). */
export function withCutoffCookie(response: NextResponse, ip: string): NextResponse {
  response.cookies.set(HARD_CUTOFF_COOKIE, ip, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return applySecurityHeaders(response)
}
