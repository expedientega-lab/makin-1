/** Sesión del mini-juego Minas $5 (header). */

export const JACKPOT_FIVE_PRIZE = 5
export const JACKPOT_FIVE_PLAY_PRICE = 1
/** Solo 2 excavaciones: la 1.ª no pasa nada, la 2.ª siempre explota. */
export const JACKPOT_FIVE_MAX_DIGS = 2
export const JACKPOT_FIVE_GRID_SIZE = 5
export const JACKPOT_FIVE_MINE_COUNT = 2

/** Misma grilla para todos — tesoro al centro, 2 minas al lado (casi gana). */
export const FIXED_TREASURE_INDEX = 12
export const FIXED_MINE_INDICES = [11, 13] as const

export const LS_JACKPOT_FIVE_PAID = 'mystika-jackpot-five-paid'
export const LS_JACKPOT_FIVE_ORDER_ID = 'mystika-jackpot-five-order-id'
export const JACKPOT_FIVE_PRODUCT_ID = 'mystika-jackpot-five'

export type MineCellKind = 'empty' | 'mine' | 'treasure'

export interface MineCell {
  kind: MineCellKind
  revealed: boolean
}

export function buildMineGrid(): MineCell[] {
  const total = JACKPOT_FIVE_GRID_SIZE * JACKPOT_FIVE_GRID_SIZE
  const cells: MineCell[] = Array.from({ length: total }, () => ({
    kind: 'empty' as MineCellKind,
    revealed: false,
  }))

  cells[FIXED_TREASURE_INDEX].kind = 'treasure'
  for (const index of FIXED_MINE_INDICES) {
    cells[index].kind = 'mine'
  }

  return cells
}

function cellDistance(a: number, b: number, size: number): number {
  const ar = Math.floor(a / size)
  const ac = a % size
  const br = Math.floor(b / size)
  const bc = b % size
  return Math.abs(ar - br) + Math.abs(ac - bc)
}

/** Mueve el tesoro a la casilla oculta más lejana del click — nunca lo encontrás. */
export function relocateTreasure(
  grid: MineCell[],
  clickedIndex: number,
): MineCell[] {
  const next = grid.map((cell) => ({ ...cell }))
  const treasureIdx = next.findIndex((c) => c.kind === 'treasure')

  if (treasureIdx >= 0) {
    next[treasureIdx] = {
      kind: 'empty',
      revealed: next[treasureIdx].revealed,
    }
  }

  const candidates = next
    .map((cell, i) => ({ cell, i }))
    .filter(
      ({ cell, i }) =>
        i !== clickedIndex && !cell.revealed && cell.kind !== 'mine',
    )

  if (candidates.length === 0) return next

  candidates.sort(
    (a, b) =>
      cellDistance(b.i, clickedIndex, JACKPOT_FIVE_GRID_SIZE) -
      cellDistance(a.i, clickedIndex, JACKPOT_FIVE_GRID_SIZE),
  )

  next[candidates[0].i] = { kind: 'treasure', revealed: false }
  return next
}

export function unlockJackpotFiveSession(orderId?: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_JACKPOT_FIVE_PAID, '1')
    if (orderId) localStorage.setItem(LS_JACKPOT_FIVE_ORDER_ID, orderId)
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('mystika-jackpot-five-unlock'))
}

export function readJackpotFiveOrderId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LS_JACKPOT_FIVE_ORDER_ID)
  } catch {
    return null
  }
}

export function readJackpotFivePaid(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(LS_JACKPOT_FIVE_PAID) === '1'
  } catch {
    return false
  }
}

export function clearJackpotFiveSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LS_JACKPOT_FIVE_PAID)
    localStorage.removeItem(LS_JACKPOT_FIVE_ORDER_ID)
  } catch {
    // ignore
  }
}
