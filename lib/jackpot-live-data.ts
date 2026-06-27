/** Feed en vivo del jackpot — premios y frases creíbles para la mesa. */

import {
  ORBE_LIVE_PLAYERS,
  pickPlayer,
  pickSecsAgo,
  rnd,
  type OrbeLivePlayer,
} from "@/lib/orbe-live-data";

export type JackpotLiveWin = {
  label: string;
  icon: string;
  color: string;
  hot?: boolean;
  weight: number;
};

export const JACKPOT_LIVE_WINS: JackpotLiveWin[] = [
  { label: "Galleta de la fortuna", icon: "🥠", color: "#ffd700", weight: 34 },
  { label: "Galleta de la suerte", icon: "🥠", color: "#ffec8a", weight: 18 },
  { label: "25 USD en línea", icon: "💵", color: "#00e5ff", weight: 14 },
  { label: "50 USD en línea", icon: "💵", color: "#00ff9d", weight: 9 },
  { label: "Triple corazón — 50 USD", icon: "💜", color: "#ff6b9d", weight: 7 },
  { label: "Triple orbe — 100 USD", icon: "🔮", color: "#b388ff", hot: true, weight: 5 },
  { label: "100 USD en mesa", icon: "💵", color: "#ffd700", hot: true, weight: 4 },
  { label: "Bonus galleta extra", icon: "🥠", color: "#ffd700", weight: 6 },
  {
    label: "JACKPOT $1,000 USD",
    icon: "🌙",
    color: "#00ff9d",
    hot: true,
    weight: 1.2,
  },
];

const JACKPOT_PLAYING: ((p: OrbeLivePlayer) => string)[] = [
  (p) => `${p.handle} girando carretes`,
  (p) => `${p.handle} pagó $1 y gira`,
  (p) => `${p.handle} en mesa jackpot`,
  (p) => `${p.handle} esperando 3.er carrete`,
  (p) => `${p.handle} alineó 2 símbolos`,
  (p) => `${p.handle} volvió a la mesa`,
  (p) => (p.place ? `${p.handle} · ${p.place}` : `${p.handle} entró al jackpot`),
  (p) => `${p.handle} tocó GIRAR`,
  (p) => `${p.handle} revisando línea de pago`,
];

const ANON_JACKPOT_WINS = [
  "Jugador {flag} sacó {icon} {prize}",
  "Mesa {flag}: nuevo {icon} {prize}",
  "Ganador {flag} · {icon} {prize}",
];

export function pickJackpotWin(): JackpotLiveWin {
  const total = JACKPOT_LIVE_WINS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of JACKPOT_LIVE_WINS) {
    r -= w.weight;
    if (r <= 0) return w;
  }
  return JACKPOT_LIVE_WINS[0];
}

export function pickJackpotPlayingLine(p: OrbeLivePlayer): string {
  const fn = JACKPOT_PLAYING[rnd(0, JACKPOT_PLAYING.length - 1)];
  return fn(p);
}

export function pickJackpotAnonWin(flag: string, icon: string, prize: string): string {
  const tpl = ANON_JACKPOT_WINS[rnd(0, ANON_JACKPOT_WINS.length - 1)];
  return tpl.replace("{flag}", flag).replace("{icon}", icon).replace("{prize}", prize);
}

export function initialJackpotTableCount(): number {
  return rnd(186, 412);
}

export function initialJackpotWinsPerMin(): number {
  return rnd(14, 28);
}

export { pickPlayer, pickSecsAgo, rnd, ORBE_LIVE_PLAYERS };
