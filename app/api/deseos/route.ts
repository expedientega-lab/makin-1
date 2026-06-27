import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateMkClientId } from '@/lib/mk-client-id'
import { pickThreeDeseos } from '@/lib/deseos-pool'
import {
  getActiveIpLock,
  getActiveSession,
  saveSession,
  sessionRemainingMs,
} from '@/lib/deseos-store'
import { blockedIpResponse } from '@/lib/security-guard'

function getIpHash(req: NextRequest): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip')
  if (!ip) return undefined
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

function sessionPayload(session: Awaited<ReturnType<typeof getActiveSession>>) {
  if (!session) {
    return { locked: false as const }
  }
  return {
    locked: true as const,
    name: session.name,
    deseos: session.deseos,
    lockedUntil: session.lockedUntil,
    revealedAt: session.revealedAt,
    remainingMs: sessionRemainingMs(session),
  }
}

export async function GET(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const clientId = await getOrCreateMkClientId()
  const ipHash = getIpHash(req)

  const session = await getActiveSession(clientId)
  if (session) {
    return NextResponse.json(sessionPayload(session))
  }

  if (ipHash) {
    const ipLock = await getActiveIpLock(ipHash)
    if (ipLock && ipLock.clientId !== clientId) {
      return NextResponse.json({
        locked: true,
        lockedUntil: ipLock.lockedUntil,
        remainingMs: Math.max(0, new Date(ipLock.lockedUntil).getTime() - Date.now()),
        reason: 'ip_cooldown' as const,
      })
    }
  }

  return NextResponse.json({ locked: false })
}

export async function POST(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const clientId = await getOrCreateMkClientId()
  const ipHash = getIpHash(req)

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 40) : ''
  if (!name) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const existing = await getActiveSession(clientId)
  if (existing) {
    return NextResponse.json(
      { error: 'cooldown', ...sessionPayload(existing) },
      { status: 429 },
    )
  }

  if (ipHash) {
    const ipLock = await getActiveIpLock(ipHash)
    if (ipLock) {
      return NextResponse.json(
        {
          error: 'cooldown',
          locked: true,
          lockedUntil: ipLock.lockedUntil,
          remainingMs: Math.max(0, new Date(ipLock.lockedUntil).getTime() - Date.now()),
          reason: 'ip_cooldown' as const,
        },
        { status: 429 },
      )
    }
  }

  const deseos = pickThreeDeseos(name)
  const session = await saveSession(clientId, name, deseos, ipHash)

  return NextResponse.json(sessionPayload(session))
}
