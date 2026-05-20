import 'server-only'

import { promises as fs } from 'fs'
import path from 'path'

type StoredPaymentStatus =
  | 'waiting'
  | 'confirming'
  | 'confirmed'
  | 'sending'
  | 'finished'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'partially_paid'

interface StoredOrder {
  orderId: string
  clientId: string
  productId: string
  paymentStatus: StoredPaymentStatus
  invoiceId?: string
  paymentId?: string
  createdAt: string
  updatedAt: string
}

interface PaymentsStore {
  orders: Record<string, StoredOrder>
}

const STORE_DIR = path.join(process.cwd(), '.data')
const STORE_PATH = path.join(STORE_DIR, 'payments-store.json')

const DEFAULT_STORE: PaymentsStore = {
  orders: {},
}

async function ensureStoreExists() {
  await fs.mkdir(STORE_DIR, { recursive: true })
  try {
    await fs.access(STORE_PATH)
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8')
  }
}

async function readStore(): Promise<PaymentsStore> {
  await ensureStoreExists()
  const raw = await fs.readFile(STORE_PATH, 'utf-8')
  return (JSON.parse(raw) as PaymentsStore) || DEFAULT_STORE
}

async function writeStore(store: PaymentsStore): Promise<void> {
  await ensureStoreExists()
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

export async function createPendingOrder(orderId: string, clientId: string, productId: string): Promise<void> {
  const store = await readStore()
  const now = new Date().toISOString()
  store.orders[orderId] = {
    orderId,
    clientId,
    productId,
    paymentStatus: 'waiting',
    createdAt: now,
    updatedAt: now,
  }
  await writeStore(store)
}

export async function attachInvoiceToOrder(orderId: string, invoiceId: string): Promise<void> {
  const store = await readStore()
  const order = store.orders[orderId]
  if (!order) return
  order.invoiceId = invoiceId
  order.updatedAt = new Date().toISOString()
  await writeStore(store)
}

export async function upsertPaymentStatusByOrderId(
  orderId: string,
  paymentStatus: StoredPaymentStatus,
  paymentId?: string,
): Promise<void> {
  const store = await readStore()
  const order = store.orders[orderId]
  if (!order) return
  order.paymentStatus = paymentStatus
  order.paymentId = paymentId || order.paymentId
  order.updatedAt = new Date().toISOString()
  await writeStore(store)
}

export async function getOrderById(orderId: string): Promise<StoredOrder | null> {
  const store = await readStore()
  return store.orders[orderId] ?? null
}

export async function hasClientPaidForProducts(clientId: string, productIds: string[]): Promise<boolean> {
  const store = await readStore()
  return Object.values(store.orders).some(
    (order) =>
      order.clientId === clientId &&
      productIds.includes(order.productId) &&
      (order.paymentStatus === 'finished' || order.paymentStatus === 'confirmed' || order.paymentStatus === 'sending'),
  )
}
