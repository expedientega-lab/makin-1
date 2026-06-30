import 'server-only'

import { promises as fs } from 'fs'

function cloneDefault<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export async function ensureJsonStore<T>(
  storeDir: string,
  storePath: string,
  defaultStore: T,
): Promise<boolean> {
  try {
    await fs.access(storePath)
    return true
  } catch {
    // seguir e intentar crearlo
  }

  try {
    await fs.mkdir(storeDir, { recursive: true })
    await fs.writeFile(storePath, JSON.stringify(defaultStore, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

export async function readJsonStore<T>(
  storeDir: string,
  storePath: string,
  defaultStore: T,
): Promise<T> {
  const ready = await ensureJsonStore(storeDir, storePath, defaultStore)
  if (!ready) return cloneDefault(defaultStore)

  try {
    const raw = await fs.readFile(storePath, 'utf-8')
    return ((JSON.parse(raw) as T) || cloneDefault(defaultStore))
  } catch {
    return cloneDefault(defaultStore)
  }
}

export async function writeJsonStore<T>(
  storeDir: string,
  storePath: string,
  defaultStore: T,
  store: T,
): Promise<boolean> {
  const ready = await ensureJsonStore(storeDir, storePath, defaultStore)
  if (!ready) return false

  try {
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}
