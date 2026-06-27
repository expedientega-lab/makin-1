/** Sesión de jackpot: 3 giros por $1 con resultado scripteado. */

export const LS_JACKPOT_SPINS = 'mystika-jackpot-spins-completed'
export const LS_JACKPOT_WINNINGS = 'mystika-jackpot-winnings'
export const LS_JACKPOT_PAID = 'mystika-jackpot-session-paid'
export const LS_JACKPOT_ORDER_ID = 'mystika-jackpot-session-order-id'
export const JACKPOT_TOTAL_SPINS = 3
export const JACKPOT_FIRST_SPIN_WIN = 50

export type JackpotSpinPhase = 1 | 2 | 3

export type JackpotScriptedOutcome = {
  symbols: [string, string, string]
  title: string
  message: string
  extra: string
  color: string
  isTop: boolean
}

export const JACKPOT_SCRIPTED: Record<JackpotSpinPhase, JackpotScriptedOutcome> = {
  1: {
    symbols: ['💜', '💜', '💜'],
    title: '💜 TRIPLE CORAZÓN — +$50',
    message: 'Primer giro: alineaste tres corazones. Sumaste $50 USD al acumulado.',
    extra: 'Seguí en mesa — el portal aún tiene dos giros reservados.',
    color: '#ff6b9d',
    isTop: true,
  },
  2: {
    symbols: ['⭐', '💎', '🌙'],
    title: '❌ SIN PREMIO',
    message: '',
    extra: 'El tablero se reinicia. Queda un giro con sorpresa mística.',
    color: '#ff6b6b',
    isTop: false,
  },
  3: {
    symbols: ['💎', '💎', '🥠'],
    title: '🥠 GALLETA DE LA FORTUNA',
    message:
      'Tercer giro: dos diamantes y la galleta en línea. Tu galleta de la fortuna digital está lista.',
    extra: '✦ Ciclo de 3 giros completado. Podés volver a jugar por $1 ✦',
    color: '#ffd700',
    isTop: true,
  },
}

export function unlockJackpotSession(orderId?: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_JACKPOT_PAID, '1')
    localStorage.setItem(LS_JACKPOT_SPINS, '0')
    localStorage.setItem(LS_JACKPOT_WINNINGS, '0')
    if (orderId) localStorage.setItem(LS_JACKPOT_ORDER_ID, orderId)
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('mystika-jackpot-unlock'))
}

export function readJackpotSessionOrderId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LS_JACKPOT_ORDER_ID)
  } catch {
    return null
  }
}

export function readJackpotSpinsCompleted(): number {
  if (typeof window === 'undefined') return 0
  try {
    const n = parseInt(localStorage.getItem(LS_JACKPOT_SPINS) || '0', 10)
    return Number.isFinite(n)
      ? Math.max(0, Math.min(JACKPOT_TOTAL_SPINS, n))
      : 0
  } catch {
    return 0
  }
}

export function readJackpotWinnings(): number {
  if (typeof window === 'undefined') return 0
  try {
    const n = parseFloat(localStorage.getItem(LS_JACKPOT_WINNINGS) || '0')
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

export function readJackpotSessionPaid(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(LS_JACKPOT_PAID) === '1'
  } catch {
    return false
  }
}

export function persistJackpotSession(
  spinsCompleted: number,
  winnings: number,
  sessionPaid: boolean,
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_JACKPOT_SPINS, String(spinsCompleted))
    localStorage.setItem(LS_JACKPOT_WINNINGS, String(winnings))
    if (sessionPaid) {
      localStorage.setItem(LS_JACKPOT_PAID, '1')
    } else {
      localStorage.removeItem(LS_JACKPOT_PAID)
    }
  } catch {
    // ignore
  }
}

export function resetJackpotSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LS_JACKPOT_SPINS)
    localStorage.removeItem(LS_JACKPOT_WINNINGS)
    localStorage.removeItem(LS_JACKPOT_PAID)
    localStorage.removeItem(LS_JACKPOT_ORDER_ID)
  } catch {
    // ignore
  }
}
