import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getOrCreateMkClientId } from "@/lib/mk-client-id"
import { getClientIp } from "@/lib/client-ip"
import { getVisitorName, saveVisitorName } from "@/lib/visitor-name-store"
import { blockedIpResponse } from "@/lib/security-guard"
import { isRateLimited } from "@/lib/security-rate-limit"

function getStorageKey(req: NextRequest, clientId: string): string {
  const ip = getClientIp(req.headers)
  if (ip && ip !== "desconocida") {
    return createHash("sha256").update(ip).digest("hex").slice(0, 32)
  }
  return `client:${clientId}`
}

function sanitizeVisitorName(raw: unknown): string | null {
  if (typeof raw !== "string") return null

  let name = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .replace(/\s+/g, " ")

  if (name.length < 1) return null
  if (name.length > 40) name = name.slice(0, 40)

  return name
}

export async function GET(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const clientId = await getOrCreateMkClientId()
  const key = getStorageKey(req, clientId)
  const record = await getVisitorName(key)

  if (!record) {
    return NextResponse.json({ saved: false as const })
  }

  return NextResponse.json({
    saved: true as const,
    name: record.name,
    savedAt: record.savedAt,
  })
}

export async function POST(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  const clientId = await getOrCreateMkClientId()
  const key = getStorageKey(req, clientId)

  if (isRateLimited(`visitor-name:${key}`, 8, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 })
  }

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 })
  }

  const name = sanitizeVisitorName(body.name)
  if (!name) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })
  }

  const record = await saveVisitorName(key, name)

  return NextResponse.json({
    saved: true as const,
    name: record.name,
    savedAt: record.savedAt,
  })
}
