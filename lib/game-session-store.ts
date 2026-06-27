import 'server-only'

import { promises as fs } from 'fs'
import path from 'path'
import { getOrderById } from '@/lib/payments-store'
import { isPaidStatus } from '@/lib/paypal-fulfill'

interface GameSessionRecord {
  orderId: string
  clientId: string
  productId: string
  spinsUsed: number
  consumed: boolean
  updatedAt: string
}

interface GameSessionStore {
  sessions: Record<string, GameSessionRecord>
}

const STORE_DIR = path.join(process.cwd(), '.data')
const STORE_PATH = path.join(STORE_DIR, 'game-sessions.json')
const DEFAULT_STORE: GameSessionStore = { sessions: {} }

const memorySessions = new Map<string, GameSessionRecord>()

async function readStore(): Promise<GameSessionStore> {
  await fs.mkdir(STORE_DIR, { recursive: true })
  try {
    await fs.access(STORE_PATH)
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8')
  }
  const raw = await fs.readFile(STORE_PATH, 'utf-8')
  return (JSON.parse(raw) as GameSessionStore) || DEFAULT_STORE
}

async function writeStore(store: GameSessionStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

function sessionKey(orderId: string) {
  return orderId
}

export type AuthorizeGameResult =
  | { ok: true; spin: number; spinsUsed: number; maxSpins: number }
  | { ok: false; reason: string; status: number }

/** Valida pago + cuota de uso server-side (anti localStorage). */
export async function authorizeGameUse(input: {
  clientId: string
  productId: string
  orderId: string
  maxSpins: number
  consume?: boolean
}): Promise<AuthorizeGameResult> {
  const { clientId, productId, orderId, maxSpins, consume = true } = input

  const order = await getOrderById(orderId)
  if (!order || order.clientId !== clientId) {
    return { ok: false, reason: 'Orden no válida para esta sesión.', status: 403 }
  }
  if (order.productId !== productId) {
    return { ok: false, reason: 'Producto no coincide con el pago.', status: 403 }
  }
  if (!isPaidStatus(order.paymentStatus)) {
    return { ok: false, reason: 'Pago no confirmado.', status: 402 }
  }

  const store = await readStore()
  const key = sessionKey(orderId)
  let session =
    memorySessions.get(key) ?? store.sessions[key] ?? null

  if (!session) {
    session = {
      orderId,
      clientId,
      productId,
      spinsUsed: 0,
      consumed: false,
      updatedAt: new Date().toISOString(),
    }
  }

  if (session.spinsUsed >= maxSpins) {
    return { ok: false, reason: 'Sesión de juego agotada.', status: 403 }
  }

  if (maxSpins === 1 && session.consumed) {
    return { ok: false, reason: 'Esta partida ya fue usada.', status: 403 }
  }

  const nextSpin = session.spinsUsed + 1

  if (!consume) {
    return { ok: true, spin: nextSpin, spinsUsed: session.spinsUsed, maxSpins }
  }

  session = {
    ...session,
    spinsUsed: nextSpin,
    consumed: maxSpins === 1 ? true : session.consumed,
    updatedAt: new Date().toISOString(),
  }

  memorySessions.set(key, session)
  store.sessions[key] = session
  await writeStore(store)

  return { ok: true, spin: nextSpin, spinsUsed: session.spinsUsed, maxSpins }
}
