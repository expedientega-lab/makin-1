import "server-only"

import { promises as fs } from "fs"
import path from "path"
import type { UniversalResponse } from "@/lib/mensaje-universo-data"
import { MENSAJE_COOLDOWN_MS } from "@/lib/mensaje-constants"

export interface MensajeSession {
  clientId: string
  message: string
  response: UniversalResponse
  sentAt: string
  lockedUntil: string
  ipHash?: string
}

interface IpLock {
  lockedUntil: string
  clientId: string
}

interface MensajeStoreFile {
  byClient: Record<string, MensajeSession>
  byIp: Record<string, IpLock>
}

const STORE_DIR = path.join(process.cwd(), ".data")
const STORE_PATH = path.join(STORE_DIR, "mensaje-universo-store.json")

const DEFAULT_STORE: MensajeStoreFile = {
  byClient: {},
  byIp: {},
}

async function ensureStoreExists() {
  await fs.mkdir(STORE_DIR, { recursive: true })
  try {
    await fs.access(STORE_PATH)
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf-8")
  }
}

async function readStore(): Promise<MensajeStoreFile> {
  await ensureStoreExists()
  const raw = await fs.readFile(STORE_PATH, "utf-8")
  return (JSON.parse(raw) as MensajeStoreFile) || DEFAULT_STORE
}

async function writeStore(store: MensajeStoreFile): Promise<void> {
  await ensureStoreExists()
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8")
}

function isActiveLock(lockedUntil: string, now = Date.now()): boolean {
  return new Date(lockedUntil).getTime() > now
}

function pruneExpired(store: MensajeStoreFile, now = Date.now()) {
  for (const [clientId, session] of Object.entries(store.byClient)) {
    if (!isActiveLock(session.lockedUntil, now)) {
      delete store.byClient[clientId]
    }
  }
  for (const [ipHash, lock] of Object.entries(store.byIp)) {
    if (!isActiveLock(lock.lockedUntil, now)) {
      delete store.byIp[ipHash]
    }
  }
}

export async function getActiveMensajeSession(
  clientId: string,
): Promise<MensajeSession | null> {
  const store = await readStore()
  pruneExpired(store)
  const session = store.byClient[clientId]
  if (!session || !isActiveLock(session.lockedUntil)) {
    if (session) {
      delete store.byClient[clientId]
      await writeStore(store)
    }
    return null
  }
  return session
}

export async function getActiveMensajeIpLock(
  ipHash: string,
): Promise<IpLock | null> {
  const store = await readStore()
  pruneExpired(store)
  const lock = store.byIp[ipHash]
  if (!lock || !isActiveLock(lock.lockedUntil)) {
    if (lock) {
      delete store.byIp[ipHash]
      await writeStore(store)
    }
    return null
  }
  return lock
}

export async function saveMensajeSession(
  clientId: string,
  message: string,
  response: UniversalResponse,
  ipHash?: string,
): Promise<MensajeSession> {
  const store = await readStore()
  pruneExpired(store)
  const now = Date.now()
  const sentAt = new Date(now).toISOString()
  const lockedUntil = new Date(now + MENSAJE_COOLDOWN_MS).toISOString()

  const session: MensajeSession = {
    clientId,
    message,
    response,
    sentAt,
    lockedUntil,
    ipHash,
  }

  store.byClient[clientId] = session
  if (ipHash) {
    store.byIp[ipHash] = { lockedUntil, clientId }
  }
  await writeStore(store)
  return session
}

export function mensajeRemainingMs(session: MensajeSession, now = Date.now()): number {
  return Math.max(0, new Date(session.lockedUntil).getTime() - now)
}

/** Quita el cooldown tras pago de desbloqueo ($1). */
export async function unlockMensajePortal(clientId: string): Promise<void> {
  const store = await readStore()
  delete store.byClient[clientId]
  for (const [hash, lock] of Object.entries(store.byIp)) {
    if (lock.clientId === clientId) {
      delete store.byIp[hash]
    }
  }
  await writeStore(store)
}
