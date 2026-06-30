import 'server-only'

import path from 'path'
import { readJsonStore, writeJsonStore } from '@/lib/json-file-store'

export interface BlockedIpRecord {
  ip: string
  reason: string
  blockedAt: string
}

interface IpBlockStore {
  blocked: Record<string, BlockedIpRecord>
}

const STORE_DIR = path.join(process.cwd(), '.data')
const STORE_PATH = path.join(STORE_DIR, 'blocked-ips.json')

const DEFAULT_STORE: IpBlockStore = { blocked: {} }

const memoryBlocked = new Map<string, BlockedIpRecord>()

async function ensureStoreExists() {
  return true
}

async function readStore(): Promise<IpBlockStore> {
  await ensureStoreExists()
  return readJsonStore(STORE_DIR, STORE_PATH, DEFAULT_STORE)
}

async function writeStore(store: IpBlockStore): Promise<void> {
  await ensureStoreExists()
  await writeJsonStore(STORE_DIR, STORE_PATH, DEFAULT_STORE, store)
}

function rememberBlocked(record: BlockedIpRecord) {
  memoryBlocked.set(record.ip, record)
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip || ip === 'desconocida') return false

  const cached = memoryBlocked.get(ip)
  if (cached) return true

  const store = await readStore()
  const record = store.blocked[ip]
  if (record) {
    rememberBlocked(record)
    return true
  }
  return false
}

export async function blockIp(ip: string, reason: string): Promise<BlockedIpRecord> {
  const record: BlockedIpRecord = {
    ip,
    reason,
    blockedAt: new Date().toISOString(),
  }

  rememberBlocked(record)

  const store = await readStore()
  store.blocked[ip] = record
  await writeStore(store)

  return record
}

export async function unblockIp(ip: string): Promise<boolean> {
  memoryBlocked.delete(ip)

  const store = await readStore()
  if (!store.blocked[ip]) return false

  delete store.blocked[ip]
  await writeStore(store)
  return true
}
