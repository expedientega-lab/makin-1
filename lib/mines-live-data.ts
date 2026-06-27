/** Feed en vivo del mini-juego Ganate $5 (minas). */

import { LIVE_PLAYERS_POOL, type LivePlayer } from "@/lib/live-players-pool";

export type MinesLivePlayer = LivePlayer;

/** ~300 usuarios para rotación creíble. */
export const MINES_LIVE_PLAYERS: MinesLivePlayer[] = LIVE_PLAYERS_POOL.slice(0, 300);

export type MinesLiveWin = {
  label: string;
  icon: string;
  color: string;
  hot?: boolean;
  weight: number;
};

export const MINES_LIVE_WINS: MinesLiveWin[] = [
  { label: "$5 USD", icon: "💎", color: "#ffd700", hot: true, weight: 52 },
  { label: "tesoro $5", icon: "💎", color: "#ffe566", weight: 28 },
  { label: "$5 en la mina", icon: "⛏️", color: "#e8b84a", weight: 14 },
  { label: "premio $5 USD", icon: "💵", color: "#ffd700", weight: 6 },
];

const MINES_PLAYING: ((p: MinesLivePlayer) => string)[] = [
  (p) => `${p.handle} excavando…`,
  (p) => `${p.handle} entró a la mina`,
  (p) => `${p.handle} buscando tesoro`,
  (p) => `${p.handle} pagó $1 y juega`,
  (p) => `${p.handle} en Ganate $5`,
  (p) => (p.place ? `${p.handle} · ${p.place}` : `${p.handle} tocó una casilla`),
  (p) => `${p.handle} 1.ª excavación`,
  (p) => `${p.handle} abrió la mina`,
];

const ANON_MINES_WINS = [
  "Jugador {flag} ganó {icon} {prize}",
  "Mina {flag}: {icon} {prize}",
  "Ganador {flag} · {icon} {prize}",
];

export function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const recentHandles: string[] = [];
const RECENT_MEMORY = 48;

export function pickMinesPlayer(): MinesLivePlayer {
  const pool = MINES_LIVE_PLAYERS;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = pool[rnd(0, pool.length - 1)];
    if (!recentHandles.includes(candidate.handle)) {
      recentHandles.push(candidate.handle);
      if (recentHandles.length > RECENT_MEMORY) recentHandles.shift();
      return candidate;
    }
  }
  return pool[rnd(0, pool.length - 1)];
}

export function pickMinesWin(): MinesLiveWin {
  const total = MINES_LIVE_WINS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of MINES_LIVE_WINS) {
    r -= w.weight;
    if (r <= 0) return w;
  }
  return MINES_LIVE_WINS[0];
}

export function pickMinesPlayingLine(p: MinesLivePlayer): string {
  const fn = MINES_PLAYING[rnd(0, MINES_PLAYING.length - 1)];
  return fn(p);
}

export function pickMinesAnonWin(flag: string, icon: string, prize: string): string {
  const tpl = ANON_MINES_WINS[rnd(0, ANON_MINES_WINS.length - 1)];
  return tpl.replace("{flag}", flag).replace("{icon}", icon).replace("{prize}", prize);
}

export function pickSecsAgo(): number {
  return rnd(3, 58);
}

export function initialMinesActiveCount(): number {
  return rnd(42, 118);
}

export function initialMinesWinsPerMin(): number {
  return rnd(6, 16);
}
