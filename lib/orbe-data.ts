import { displayPrizes } from "./mystika-data";

export type OrbePrizeType = "galleta" | "caja";

/** Nombre mostrado en el modal de pago del orbe */
export const ORBE_DISPLAY_NAME = "ORBE MÍSTICO";

export const ORBE_PAY_PRIZE_HINT = `Podés ganar los premios del orbe: ${displayPrizes.map((p) => p.nm).join(", ")}.`;

export const ORBE_PRIZE_INFO: Record<
  OrbePrizeType,
  { icon: string; label: string; color: string; glow: string }
> = {
  galleta: {
    icon: "🥠",
    label: "Galleta de la fortuna",
    color: "#ffd700",
    glow: "rgba(255,215,0,0.55)",
  },
  caja: {
    icon: "📦",
    label: "Caja misteriosa",
    color: "#ff6b9d",
    glow: "rgba(255,107,157,0.55)",
  },
};

/** Fantasmas que parpadean dentro del orbe al buscar */
export const ORBE_SEARCH_GHOSTS = ["🥠", "📦", "💵", "₿", "💵", "✨", "🥠", "📦"];

export function pickOrbePrizeType(): OrbePrizeType {
  return Math.random() < 0.55 ? "galleta" : "caja";
}

export interface OrbeWheelSegment {
  label: string;
  icon: string;
  color: string;
  prizeType: OrbePrizeType | null;
}

/** Segmentos visuales: solo galleta y caja son premios reales del orbe. */
export const ORBE_WHEEL_SEGMENTS: OrbeWheelSegment[] = [
  { label: "$1,000", icon: "💵", color: "#00ff9d", prizeType: null },
  { label: "Bitcoin", icon: "₿", color: "#f7931a", prizeType: null },
  { label: "Galleta", icon: "🥠", color: "#ffd700", prizeType: "galleta" },
  { label: "$100", icon: "💵", color: "#00e5ff", prizeType: null },
  { label: "Caja", icon: "📦", color: "#ff6b9d", prizeType: "caja" },
  { label: "$1,000", icon: "💵", color: "#00cc7a", prizeType: null },
  { label: "Bitcoin", icon: "₿", color: "#e88a1a", prizeType: null },
  { label: "$100", icon: "💵", color: "#00b8d4", prizeType: null },
];

export const SOBRES_VIDA: string[] = [
  "Un cambio que esperabas llega más rápido de lo que creés. Mantené la calma: el universo ya movió las piezas a tu favor.",
  "Alguien que admira tu forma de ser está a punto de mostrártelo. Esta semana, un gesto pequeño va a hablar fuerte.",
  "Tu energía está atrayendo oportunidades nuevas. Decí que sí a una invitación que normalmente postergarías.",
  "Un proyecto que dejaste en pausa vuelve con buenas noticias. Retomalo con confianza: el timing es el correcto.",
  "La intuición que sentiste anoche no te mintió. Seguí ese hilo dorado aunque no tenga lógica todavía.",
  "Una conversación honesta va a sanar algo que venías cargando. Abrí el corazón sin miedo al resultado.",
  "El esfuerzo silencioso de estos meses empieza a dar frutos visibles. Celebrá aunque sea un paso chico.",
  "Tu presencia ilumina más de lo que imaginás. Hoy alguien va a recordar por qué confía en vos.",
  "Una puerta que parecía cerrada se abre con una llave inesperada. Estate atento a señales en la tarde.",
  "Tu cuerpo pide descanso creativo, no rendirse. Un rato de calma va a devolverte claridad poderosa.",
  "La abundancia no solo es dinero: llega en tiempo, en amor y en paz. Recibí las tres formas con gratitud.",
  "Un reencuentro traerá una sonrisa que necesitabas. Dejá que la emoción fluya sin explicarla.",
];

export function pickOrbePrize(): {
  prizeType: OrbePrizeType;
  segmentIndex: number;
} {
  const winType: OrbePrizeType = Math.random() < 0.55 ? "galleta" : "caja";
  const indices = ORBE_WHEEL_SEGMENTS.map((s, i) =>
    s.prizeType === winType ? i : -1,
  ).filter((i) => i >= 0);
  const segmentIndex = indices[Math.floor(Math.random() * indices.length)];
  return { prizeType: winType, segmentIndex };
}

export function pickSobreVida(): string {
  return SOBRES_VIDA[Math.floor(Math.random() * SOBRES_VIDA.length)];
}
