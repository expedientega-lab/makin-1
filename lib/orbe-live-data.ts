/** Datos y plantillas para el feed en vivo del orbe (aspecto orgánico, no repetitivo). */

import { LIVE_PLAYERS_POOL, type LivePlayer } from "@/lib/live-players-pool";

export type OrbeLivePlayer = LivePlayer;

export const ORBE_LIVE_PLAYERS: OrbeLivePlayer[] = LIVE_PLAYERS_POOL;

export type OrbeLiveWin = {
  text: string;
  icon: string;
  color: string;
  hot?: boolean;
  weight: number;
};

export const ORBE_LIVE_WINS: OrbeLiveWin[] = [
  { text: "Galleta de la suerte", icon: "🥠", color: "#ffd700", weight: 38 },
  { text: "Caja misteriosa", icon: "📦", color: "#ff6b9d", weight: 22 },
  { text: "Mensaje del universo", icon: "✨", color: "#b388ff", weight: 14 },
  { text: "25 dólares", icon: "💵", color: "#00e5ff", weight: 10 },
  { text: "50 dólares", icon: "💵", color: "#00ff9d", weight: 6 },
  { text: "100 dólares", icon: "💵", color: "#00e5ff", hot: true, weight: 5 },
  { text: "100 dólares", icon: "💵", color: "#ffd700", hot: true, weight: 3 },
  { text: "Bitcoin", icon: "₿", color: "#f7931a", hot: true, weight: 1.5 },
  { text: "1 mil dólares", icon: "💰", color: "#00ff9d", hot: true, weight: 0.5 },
];

const PLAYING_TEMPLATES: ((p: OrbeLivePlayer) => string)[] = [
  (p) => `${p.handle} entró al orbe`,
  (p) => `${p.handle} está buscando…`,
  (p) => `${p.handle} tocó el portal`,
  (p) => `${p.handle} en el orbe ahora`,
  (p) => `${p.handle} pagó y juega`,
  (p) => `${p.handle} volvió a intentar`,
  (p) => `${p.handle} abrió el orbe`,
  (p) => `${p.handle} giró el portal`,
  (p) => (p.place ? `${p.handle} · ${p.place}` : `${p.handle} acaba de entrar`),
  (p) => `${p.handle} escaneando premio…`,
  (p) => `${p.handle} 2.ª vuelta en el orbe`,
  (p) => `${p.handle} esperando resultado`,
];

const ANON_WIN_LINES = [
  "Alguien de {flag} ganó {icon} {prize}",
  "Jugador {flag} acaba de sacar {icon} {prize}",
  "Nuevo premio {flag} · {icon} {prize}",
];

const JOIN_PHRASES = [
  (n: number) => `+${n} entraron hace segundos`,
  (n: number) => `+${n} activos recién`,
  (n: number) => `${n} se sumaron al portal`,
  (n: number) => `+${n} en los últimos segundos`,
];

export function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const recentPlayerHandles: string[] = [];
const RECENT_PLAYER_MEMORY = 96;

export function pickPlayer(): OrbeLivePlayer {
  const pool = ORBE_LIVE_PLAYERS;
  if (pool.length <= RECENT_PLAYER_MEMORY) {
    return pool[rnd(0, pool.length - 1)];
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = pool[rnd(0, pool.length - 1)];
    if (!recentPlayerHandles.includes(candidate.handle)) {
      recentPlayerHandles.push(candidate.handle);
      if (recentPlayerHandles.length > RECENT_PLAYER_MEMORY) {
        recentPlayerHandles.shift();
      }
      return candidate;
    }
  }

  const fallback = pool[rnd(0, pool.length - 1)];
  recentPlayerHandles.push(fallback.handle);
  if (recentPlayerHandles.length > RECENT_PLAYER_MEMORY) recentPlayerHandles.shift();
  return fallback;
}

export function pickWin(): OrbeLiveWin {
  const total = ORBE_LIVE_WINS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of ORBE_LIVE_WINS) {
    r -= w.weight;
    if (r <= 0) return w;
  }
  return ORBE_LIVE_WINS[0];
}

export function pickPlayingLine(p: OrbeLivePlayer): string {
  const fn = PLAYING_TEMPLATES[rnd(0, PLAYING_TEMPLATES.length - 1)];
  return fn(p);
}

export function pickJoinPhrase(count: number): string {
  const fn = JOIN_PHRASES[rnd(0, JOIN_PHRASES.length - 1)];
  return fn(count);
}

export function pickAnonWinLine(flag: string, icon: string, prize: string): string {
  const tpl = ANON_WIN_LINES[rnd(0, ANON_WIN_LINES.length - 1)];
  return tpl.replace("{flag}", flag).replace("{icon}", icon).replace("{prize}", prize);
}

/** Segundos creíbles para eventos ya en cola */
export function pickSecsAgo(): number {
  const buckets = [0, 0, 1, 1, 2, 3, 4, 5, 7, 9, 12, 15, 18, 24, 31, 42];
  return buckets[rnd(0, buckets.length - 1)];
}

export function initialActiveCount(): number {
  return rnd(2712, 3094);
}

export function initialWinsPerMin(): number {
  return rnd(11, 19);
}
