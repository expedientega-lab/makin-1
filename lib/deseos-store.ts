import 'server-only'

import { promises as fs } from 'fs'
import path from 'path'
import type { Deseo } from '@/lib/deseos-pool'
import { DESEOS_COOLDOWN_MS } from '@/lib/deseos-constants'

export interface DeseoSession {
  clientId: string
  name: string
  deseos: Deseo[]
  revealedAt: string
  lockedUntil: string
  ipHash?: string
}

interface IpLock {
  lockedUntil: string
  clientId: string
}

interface DeseosStoreFile {
  byClient: Record<string, DeseoSession>
  byIp: Record<string, IpLock>
}

const STORE_DIR = path.join(process.cwd(), '.data')
const STORE_PATH = path.join(STORE_DIR, 'deseos-store.json')

const DEFAULT_STORE: DeseosStoreFile = {
  byClient: {},
  byIp: {},
}

async function ensureStoreExists() {
  await fs.mkdir(STORE_DIR, { recursive: true })
  try {
    await fs.access(STORE_PATH)
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8')
  }
}

async function readStore(): Promise<DeseosStoreFile> {
  await ensureStoreExists()
  const raw = await fs.readFile(STORE_PATH, 'utf-8')
  return (JSON.parse(raw) as DeseosStoreFile) || DEFAULT_STORE
}

async function writeStore(store: DeseosStoreFile): Promise<void> {
  await ensureStoreExists()
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

function isActiveLock(lockedUntil: string, now = Date.now()): boolean {
  return new Date(lockedUntil).getTime() > now
}

function pruneExpired(store: DeseosStoreFile, now = Date.now()) {
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

export async function getActiveSession(clientId: string): Promise<DeseoSession | null> {
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

export async function getActiveIpLock(ipHash: string): Promise<IpLock | null> {
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

export async function saveSession(
  clientId: string,
  name: string,
  deseos: Deseo[],
  ipHash?: string,
): Promise<DeseoSession> {
  const store = await readStore()
  pruneExpired(store)
  const now = Date.now()
  const revealedAt = new Date(now).toISOString()
  const lockedUntil = new Date(now + DESEOS_COOLDOWN_MS).toISOString()

  const session: DeseoSession = {
    clientId,
    name,
    deseos,
    revealedAt,
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

export function sessionRemainingMs(session: DeseoSession, now = Date.now()): number {
  return Math.max(0, new Date(session.lockedUntil).getTime() - now)
}
