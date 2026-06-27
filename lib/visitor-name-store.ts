import "server-only"

import { promises as fs } from "fs"
import path from "path"

export interface VisitorNameRecord {
  name: string
  savedAt: string
}

interface VisitorNameStoreFile {
  byKey: Record<string, VisitorNameRecord>
}

const STORE_DIR = path.join(process.cwd(), ".data")
const STORE_PATH = path.join(STORE_DIR, "visitor-names.json")

const DEFAULT_STORE: VisitorNameStoreFile = { byKey: {} }

const memoryCache = new Map<string, VisitorNameRecord>()

async function ensureStoreExists() {
  await fs.mkdir(STORE_DIR, { recursive: true })
  try {
    await fs.access(STORE_PATH)
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf-8")
  }
}

async function readStore(): Promise<VisitorNameStoreFile> {
  await ensureStoreExists()
  const raw = await fs.readFile(STORE_PATH, "utf-8")
  return (JSON.parse(raw) as VisitorNameStoreFile) || DEFAULT_STORE
}

async function writeStore(store: VisitorNameStoreFile): Promise<void> {
  await ensureStoreExists()
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8")
}

export async function getVisitorName(key: string): Promise<VisitorNameRecord | null> {
  if (!key) return null

  const cached = memoryCache.get(key)
  if (cached) return cached

  const store = await readStore()
  const record = store.byKey[key]
  if (!record) return null

  memoryCache.set(key, record)
  return record
}

export async function saveVisitorName(
  key: string,
  name: string,
): Promise<VisitorNameRecord> {
  const record: VisitorNameRecord = {
    name,
    savedAt: new Date().toISOString(),
  }

  memoryCache.set(key, record)

  const store = await readStore()
  store.byKey[key] = record
  await writeStore(store)

  return record
}
