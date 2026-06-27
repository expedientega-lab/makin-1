import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRequestIp } from '@/lib/request-ip'
import { isIpBlockExempt } from '@/lib/ip-security'
import { HARD_CUTOFF_COOKIE } from '@/lib/security-cookies'
import { SECURITY_HEADERS } from '@/lib/security-headers'

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

export function middleware(request: NextRequest) {
  const clientIp = getRequestIp(request.headers)
  const cutoffIp = request.cookies.get(HARD_CUTOFF_COOKIE)?.value

  // IP en whitelist (dueño) — ignorar cookie de corte
  if (isIpBlockExempt(clientIp)) {
    if (cutoffIp) {
      const response = withSecurityHeaders(NextResponse.next())
      response.cookies.delete(HARD_CUTOFF_COOKIE)
      return response
    }
    return withSecurityHeaders(NextResponse.next())
  }

  // Solo corta si la cookie coincide con ESTA IP (cambiar VPN = otra IP = puede entrar)
  if (cutoffIp && cutoffIp === clientIp) {
    return withSecurityHeaders(
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

  return withSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: ['/((?!_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
