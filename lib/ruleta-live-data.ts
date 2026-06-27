/** Feed en vivo de la ruleta — premios de la rueda y ~500 jugadores. */

import { LIVE_PLAYERS_POOL, type LivePlayer } from '@/lib/live-players-pool'

export const RULETA_LIVE_PLAYER_COUNT = 500
export const RULETA_LIVE_PLAYERS: LivePlayer[] = LIVE_PLAYERS_POOL.slice(
  0,
  RULETA_LIVE_PLAYER_COUNT,
)

export type RuletaLiveWin = {
  label: string
  icon: string
  color: string
  hot?: boolean
  weight: number
}

export const RULETA_LIVE_WINS: RuletaLiveWin[] = [
  { label: '$5 USD', icon: '💵', color: '#ffd700', weight: 26 },
  { label: '$20 USD', icon: '💵', color: '#00e5ff', weight: 18 },
  { label: 'Caja misteriosa', icon: '📦', color: '#ff6b9d', weight: 20 },
  { label: '$30 USD', icon: '💵', color: '#00ff9d', hot: true, weight: 7 },
  { label: 'Galleta de la suerte', icon: '🥠', color: '#ffd700', weight: 14 },
  { label: '+$15 acumulado', icon: '📦', color: '#ff6b9d', weight: 16 },
  { label: 'Bonus galleta', icon: '🥠', color: '#ffd700', hot: true, weight: 9 },
  { label: '2.º premio en ruleta', icon: '💵', color: '#00ff9d', weight: 12 },
  { label: '3.er premio · bonus', icon: '🎡', color: '#b388ff', hot: true, weight: 5 },
]

const RULETA_PLAYING: ((p: LivePlayer) => string)[] = [
  (p) => `${p.handle} girando la ruleta`,
  (p) => `${p.handle} pagó $1 en ruleta`,
  (p) => `${p.handle} en vuelta 2`,
  (p) => `${p.handle} tocó GIRAR`,
  (p) => `${p.handle} esperando el puntero`,
  (p) => `${p.handle} en 3.er premio`,
  (p) => (p.place ? `${p.handle} · ${p.place}` : `${p.handle} entró a la ruleta`),
  (p) => `${p.handle} volvió a la mesa`,
  (p) => `${p.handle} sumando al acumulado`,
  (p) => `${p.handle} desbloqueó bonus`,
  (p) => `${p.handle} girando bonus`,
  (p) => `${p.handle} en ruleta del destino`,
]

const ANON_RULETA_WINS = [
  'Jugador {flag} sacó {icon} {prize}',
  'Ruleta {flag}: {icon} {prize}',
  'Ganador {flag} · {icon} {prize}',
  'Nuevo premio en ruleta {flag} · {icon} {prize}',
]

const recentHandles: string[] = []
const RECENT_MEMORY = 80

export function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pickRuletaPlayer(): LivePlayer {
  const pool = RULETA_LIVE_PLAYERS
  if (pool.length <= RECENT_MEMORY) {
    return pool[rnd(0, pool.length - 1)]
  }
  for (let attempt = 0; attempt < 14; attempt++) {
    const candidate = pool[rnd(0, pool.length - 1)]
    if (!recentHandles.includes(candidate.handle)) {
      recentHandles.push(candidate.handle)
      if (recentHandles.length > RECENT_MEMORY) recentHandles.shift()
      return candidate
    }
  }
  const fallback = pool[rnd(0, pool.length - 1)]
  recentHandles.push(fallback.handle)
  if (recentHandles.length > RECENT_MEMORY) recentHandles.shift()
  return fallback
}

export function pickRuletaWin(): RuletaLiveWin {
  const total = RULETA_LIVE_WINS.reduce((s, w) => s + w.weight, 0)
  let r = Math.random() * total
  for (const w of RULETA_LIVE_WINS) {
    r -= w.weight
    if (r <= 0) return w
  }
  return RULETA_LIVE_WINS[0]
}

export function pickRuletaPlayingLine(p: LivePlayer): string {
  const fn = RULETA_PLAYING[rnd(0, RULETA_PLAYING.length - 1)]
  return fn(p)
}

export function pickRuletaAnonWin(flag: string, icon: string, prize: string): string {
  const tpl = ANON_RULETA_WINS[rnd(0, ANON_RULETA_WINS.length - 1)]
  return tpl.replace('{flag}', flag).replace('{icon}', icon).replace('{prize}', prize)
}

export function pickSecsAgo(): number {
  const buckets = [0, 0, 1, 1, 2, 3, 5, 7, 9, 12, 16, 22, 28, 35]
  return buckets[rnd(0, buckets.length - 1)]
}

export function initialRuletaTableCount(): number {
  return rnd(312, 548)
}

export function initialRuletaWinsPerMin(): number {
  return rnd(18, 36)
}
