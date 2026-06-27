import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { unblockIp } from '@/lib/ip-block-store'
import { isIpBlockExempt } from '@/lib/ip-security'
import { HARD_CUTOFF_COOKIE } from '@/lib/security-cookies'

export const runtime = 'nodejs'

/** Quita bloqueo de IP y borra la cookie de corte (solo whitelist / dueño). */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!ip || ip === 'desconocida') {
    return NextResponse.json({ error: 'IP no resuelta' }, { status: 400 })
  }

  if (!isIpBlockExempt(ip)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const removed = await unblockIp(ip)

  const response = NextResponse.json({
    ok: true,
    ip,
    removedFromStore: removed,
    cookieCleared: true,
  })
  response.cookies.delete(HARD_CUTOFF_COOKIE)
  return response
}
