import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getOrCreateMkClientId } from "@/lib/mk-client-id"
import { pickUniversalResponse } from "@/lib/mensaje-universo-data"
import { sanitizeMensajeUniverso } from "@/lib/mensaje-sanitize"
import {
  getActiveMensajeIpLock,
  getActiveMensajeSession,
  mensajeRemainingMs,
  saveMensajeSession,
} from "@/lib/mensaje-store"
import { blockedIpResponse } from "@/lib/security-guard"

function getIpHash(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip")
  if (!ip) return undefined
  return createHash("sha256").update(ip).digest("hex").slice(0, 32)
}

function sessionPayload(session: Awaited<ReturnType<typeof getActiveMensajeSession>>) {
  if (!session) {
    return { locked: false as const }
  }
  return {
    locked: true as const,
    message: session.message,
    response: session.response,
    sentAt: session.sentAt,
    lockedUntil: session.lockedUntil,
    remainingMs: mensajeRemainingMs(session),
  }
}

export async function GET(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const clientId = await getOrCreateMkClientId()
  const ipHash = getIpHash(req)

  const session = await getActiveMensajeSession(clientId)
  if (session) {
    return NextResponse.json(sessionPayload(session))
  }

  if (ipHash) {
    const ipLock = await getActiveMensajeIpLock(ipHash)
    if (ipLock && ipLock.clientId !== clientId) {
      return NextResponse.json({
        locked: true,
        lockedUntil: ipLock.lockedUntil,
        remainingMs: Math.max(0, new Date(ipLock.lockedUntil).getTime() - Date.now()),
        reason: "ip_cooldown" as const,
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

  let body: { message?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 })
  }

  const message = sanitizeMensajeUniverso(body.message)
  if (!message) {
    return NextResponse.json(
      { error: "Mensaje invalido. Escribi entre 1 y 500 caracteres." },
      { status: 400 },
    )
  }

  const existing = await getActiveMensajeSession(clientId)
  if (existing) {
    return NextResponse.json(
      { error: "cooldown", ...sessionPayload(existing) },
      { status: 429 },
    )
  }

  if (ipHash) {
    const ipLock = await getActiveMensajeIpLock(ipHash)
    if (ipLock) {
      return NextResponse.json(
        {
          error: "cooldown",
          locked: true,
          lockedUntil: ipLock.lockedUntil,
          remainingMs: Math.max(0, new Date(ipLock.lockedUntil).getTime() - Date.now()),
          reason: "ip_cooldown" as const,
        },
        { status: 429 },
      )
    }
  }

  const response = pickUniversalResponse()
  const session = await saveMensajeSession(clientId, message, response, ipHash)

  return NextResponse.json(sessionPayload(session))
}
