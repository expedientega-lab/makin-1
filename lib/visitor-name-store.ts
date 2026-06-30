import "server-only"

import path from "path"
import { readJsonStore, writeJsonStore } from "@/lib/json-file-store"

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
  return true
}

async function readStore(): Promise<VisitorNameStoreFile> {
  await ensureStoreExists()
  return readJsonStore(STORE_DIR, STORE_PATH, DEFAULT_STORE)
}

async function writeStore(store: VisitorNameStoreFile): Promise<void> {
  await ensureStoreExists()
  await writeJsonStore(STORE_DIR, STORE_PATH, DEFAULT_STORE, store)
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
