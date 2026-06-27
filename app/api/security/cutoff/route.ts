import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { isIpBlocked } from '@/lib/ip-block-store'
import { isIpBlockExempt } from '@/lib/ip-security'
import { HARD_CUTOFF_COOKIE } from '@/lib/security-cookies'
import { withCutoffCookie } from '@/lib/security-guard'

export const runtime = 'nodejs'

/** Activa corte total solo si la IP ya está bloqueada. */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!ip || ip === 'desconocida') {
    return NextResponse.json({ error: 'IP no resuelta' }, { status: 400 })
  }

  if (isIpBlockExempt(ip)) {
    return NextResponse.json({ cutoff: false, exempt: true, ip })
  }

  if (!(await isIpBlocked(ip))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  return withCutoffCookie(NextResponse.json({ cutoff: true, ip }), ip)
}
