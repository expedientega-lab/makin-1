import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { blockIp, isIpBlocked } from '@/lib/ip-block-store'
import { isIpBlockExempt } from '@/lib/ip-security'
import { blockedIpResponse, withCutoffCookie } from '@/lib/security-guard'
import { isRateLimited } from '@/lib/security-rate-limit'

export const runtime = 'nodejs'

const ALLOWED_REASONS = new Set([
  'devtools',
  'contextmenu',
  'inspect',
  'debugger',
  'screenshot',
  'screen_capture',
  'capture',
  'automation',
  'freeze',
  'payment_abuse',
  'tamper',
  'script_injection',
  'guardian',
  'iframe_embed',
  'fetch_tamper',
  'storage_tamper',
  'api_flood',
])

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!ip || ip === 'desconocida') {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        blocked: false,
        exempt: true,
        preview: true,
        ip: 'local-dev',
      })
    }
    return NextResponse.json({ error: 'IP no resuelta' }, { status: 400 })
  }

  if (isRateLimited(`block:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })
  }

  if (isIpBlockExempt(ip)) {
    return NextResponse.json({
      blocked: false,
      exempt: true,
      ip,
      preview: true,
    })
  }

  if (await isIpBlocked(ip)) {
    return withCutoffCookie(
      NextResponse.json({ blocked: true, ip, already: true }),
      ip,
    )
  }

  let reason = 'devtools'
  try {
    const body = (await req.json()) as { reason?: string }
    if (body.reason && ALLOWED_REASONS.has(body.reason)) {
      reason = body.reason
    }
  } catch {
    // default reason
  }

  const record = await blockIp(ip, reason)

  return withCutoffCookie(
    NextResponse.json({
      blocked: true,
      ip: record.ip,
      blockedAt: record.blockedAt,
    }),
    ip,
  )
}
