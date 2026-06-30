import 'server-only'

import path from 'path'
import { readJsonStore, writeJsonStore } from '@/lib/json-file-store'

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

export interface StoredOrder {
  orderId: string
  clientId: string
  productId: string
  paymentStatus: StoredPaymentStatus
  amountUsd?: number
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

/** Caché en memoria: evita pérdida entre create/capture en la misma instancia. */
const memoryOrders = new Map<string, StoredOrder>()

async function ensureStoreExists() {
  return true
}

async function readStore(): Promise<PaymentsStore> {
  await ensureStoreExists()
  return readJsonStore(STORE_DIR, STORE_PATH, DEFAULT_STORE)
}

async function writeStore(store: PaymentsStore): Promise<void> {
  await ensureStoreExists()
  await writeJsonStore(STORE_DIR, STORE_PATH, DEFAULT_STORE, store)
}

function rememberOrder(order: StoredOrder) {
  memoryOrders.set(order.orderId, order)
}

export async function createPendingOrder(
  orderId: string,
  clientId: string,
  productId: string,
  amountUsd?: number,
): Promise<void> {
  const now = new Date().toISOString()
  const order: StoredOrder = {
    orderId,
    clientId,
    productId,
    paymentStatus: 'waiting',
    amountUsd,
    createdAt: now,
    updatedAt: now,
  }
  rememberOrder(order)

  const store = await readStore()
  store.orders[orderId] = order
  await writeStore(store)
}

export async function attachInvoiceToOrder(orderId: string, invoiceId: string): Promise<void> {
  const store = await readStore()
  const order = store.orders[orderId] ?? memoryOrders.get(orderId)
  if (!order) return
  order.invoiceId = invoiceId
  order.updatedAt = new Date().toISOString()
  rememberOrder(order)
  store.orders[orderId] = order
  await writeStore(store)
}

export async function upsertPaymentStatusByOrderId(
  orderId: string,
  paymentStatus: StoredPaymentStatus,
  paymentId?: string,
): Promise<void> {
  const store = await readStore()
  const order = store.orders[orderId] ?? memoryOrders.get(orderId)
  if (!order) return
  order.paymentStatus = paymentStatus
  order.paymentId = paymentId || order.paymentId
  order.updatedAt = new Date().toISOString()
  rememberOrder(order)
  store.orders[orderId] = order
  await writeStore(store)
}

export async function getOrderById(orderId: string): Promise<StoredOrder | null> {
  const cached = memoryOrders.get(orderId)
  if (cached) return cached

  const store = await readStore()
  const order = store.orders[orderId] ?? null
  if (order) rememberOrder(order)
  return order
}

/** Registra una orden ya validada vía PayPal (respaldo si el archivo no persistió). */
export async function ensureOrderRecord(
  orderId: string,
  clientId: string,
  productId: string,
): Promise<StoredOrder> {
  const existing = await getOrderById(orderId)
  if (existing) return existing

  const now = new Date().toISOString()
  const order: StoredOrder = {
    orderId,
    clientId,
    productId,
    paymentStatus: 'waiting',
    createdAt: now,
    updatedAt: now,
  }
  rememberOrder(order)

  const store = await readStore()
  store.orders[orderId] = order
  await writeStore(store)
  return order
}

export async function hasClientPaidForProducts(clientId: string, productIds: string[]): Promise<boolean> {
  const store = await readStore()
  const allOrders = [
    ...Object.values(store.orders),
    ...memoryOrders.values(),
  ]
  return allOrders.some(
    (order) =>
      order.clientId === clientId &&
      productIds.includes(order.productId) &&
      (order.paymentStatus === 'finished' || order.paymentStatus === 'confirmed' || order.paymentStatus === 'sending'),
  )
}
