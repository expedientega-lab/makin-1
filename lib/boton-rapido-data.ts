/** Botón Rápido — ronda global cada 1 hora, premio $100 USD. */

export const BOTON_RAPIDO_PRIZE = 100
export const BOTON_RAPIDO_ROUND_MS = 60 * 60 * 1000
export const BOTON_RAPIDO_ACTIVE_WINDOW_MS = 10_000
export const LS_BOTON_RAPIDO_ROUND = "mystika-boton-rapido-round"

export type BotonRapidoWinner = {
  name: string
  flag: string
  city: string
  country: string
}

const WINNERS_POOL: BotonRapidoWinner[] = [
  { name: "Kenji", flag: "🇯🇵", city: "Tokio", country: "Japón" },
  { name: "Amara O.", flag: "🇳🇬", city: "Lagos", country: "Nigeria" },
  { name: "Lukas M.", flag: "🇩🇪", city: "Berlín", country: "Alemania" },
  { name: "Priya S.", flag: "🇮🇳", city: "Mumbai", country: "India" },
  { name: "Oliver K.", flag: "🇬🇧", city: "Londres", country: "Reino Unido" },
  { name: "Sofia R.", flag: "🇪🇸", city: "Madrid", country: "España" },
  { name: "Chen W.", flag: "🇨🇳", city: "Shanghái", country: "China" },
  { name: "Fatima B.", flag: "🇲🇦", city: "Casablanca", country: "Marruecos" },
  { name: "Marco V.", flag: "🇮🇹", city: "Milán", country: "Italia" },
  { name: "Yuki T.", flag: "🇰🇷", city: "Seúl", country: "Corea del Sur" },
  { name: "Ana L.", flag: "🇧🇷", city: "São Paulo", country: "Brasil" },
  { name: "Diego F.", flag: "🇲🇽", city: "CDMX", country: "México" },
  { name: "Camille D.", flag: "🇫🇷", city: "París", country: "Francia" },
  { name: "Ahmed R.", flag: "🇪🇬", city: "El Cairo", country: "Egipto" },
  { name: "Ingrid H.", flag: "🇸🇪", city: "Estocolmo", country: "Suecia" },
  { name: "Raj P.", flag: "🇵🇰", city: "Karachi", country: "Pakistán" },
  { name: "Elena K.", flag: "🇺🇦", city: "Kyiv", country: "Ucrania" },
  { name: "Thabo N.", flag: "🇿🇦", city: "Johannesburgo", country: "Sudáfrica" },
  { name: "Lucía M.", flag: "🇦🇷", city: "Buenos Aires", country: "Argentina" },
  { name: "Mateo C.", flag: "🇨🇴", city: "Bogotá", country: "Colombia" },
]

function seedFromRound(roundId: number): number {
  let s = roundId ^ 0x9e3779b9
  s = Math.imul(s ^ (s >>> 16), 0x7feb352d)
  s = Math.imul(s ^ (s >>> 15), 0x846ca68b)
  return (s ^ (s >>> 16)) >>> 0
}

export type BotonRapidoRound = {
  roundId: number
  startsAt: number
  endsAt: number
  msRemaining: number
}

export function getCurrentRound(now = Date.now()): BotonRapidoRound {
  const roundId = Math.floor(now / BOTON_RAPIDO_ROUND_MS)
  const startsAt = roundId * BOTON_RAPIDO_ROUND_MS
  const endsAt = startsAt + BOTON_RAPIDO_ROUND_MS
  return { roundId, startsAt, endsAt, msRemaining: endsAt - now }
}

export type BotonRapidoRoundResult = BotonRapidoWinner & {
  wonAtMs: number
  marginMs: number
}

export function getRoundResult(roundId: number): BotonRapidoRoundResult {
  const seed = seedFromRound(roundId)
  const winner = WINNERS_POOL[seed % WINNERS_POOL.length]
  const endsAt = (roundId + 1) * BOTON_RAPIDO_ROUND_MS
  const windowOpensAt = endsAt - BOTON_RAPIDO_ACTIVE_WINDOW_MS
  const wonAtMs = windowOpensAt + 50 + (seed % 350)
  const marginMs = 60 + (seed % 940)
  return { ...winner, wonAtMs, marginMs }
}

/** True solo en los últimos 10 s de la ronda — ventana para tocar. */
export function isPressWindowOpen(msRemaining: number): boolean {
  return msRemaining > 0 && msRemaining <= BOTON_RAPIDO_ACTIVE_WINDOW_MS
}

export function msUntilPressWindow(msRemaining: number): number {
  return Math.max(0, msRemaining - BOTON_RAPIDO_ACTIVE_WINDOW_MS)
}

export function getWaitingCount(roundId: number, now = Date.now()): number {
  const seed = seedFromRound(roundId)
  const base = 2400 + (seed % 3800)
  const round = getCurrentRound(now)
  const progress = (now - round.startsAt) / BOTON_RAPIDO_ROUND_MS
  const wave = Math.sin(now / 4200) * 180
  return Math.floor(base + progress * 4200 + wave)
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function formatMarginMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function readPlayedRound(): number | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(LS_BOTON_RAPIDO_ROUND)
  if (!raw) return null
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? n : null
}

export function markPlayedRound(roundId: number): void {
  localStorage.setItem(LS_BOTON_RAPIDO_ROUND, String(roundId))
}
