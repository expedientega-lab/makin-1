export type LlaveTier = 1 | 5 | 20;

export interface LlavesStock {
  1: number;
  5: number;
  20: number;
}

export type LlavePremioKind = "galleta" | "universo";

export interface LlavePrizePreview {
  icon: string;
  label: string;
  color: string;
}

export interface LlaveTierInfo {
  tier: LlaveTier;
  priceUSD: number;
  /** Texto de “jackpot” simbólico que aparece en la carta (no es dinero real). */
  advertisedUSD: number;
  productId: string;
  shortName: string;
  keyColor: string;
  keyShadow: string;
  /** Premios posibles mostrados en la carta (visual). */
  prizes: LlavePrizePreview[];
}

export const LLAVE_TIERS: LlaveTierInfo[] = [
  {
    tier: 1,
    priceUSD: 1,
    advertisedUSD: 5,
    productId: "mystika-llave-1",
    shortName: "Llave cobre",
    keyColor: "linear-gradient(145deg,#b87333,#6a3a12)",
    keyShadow: "0 4px 18px rgba(184,115,51,0.45)",
    prizes: [
      { icon: "💵", label: "$5 USD", color: "#00ff9d" },
      { icon: "✉️", label: "Sobres", color: "#b388ff" },
      { icon: "📦", label: "Caja misteriosa", color: "#ff6b9d" },
      { icon: "🥠", label: "Galleta", color: "#ffd700" },
    ],
  },
  {
    tier: 5,
    priceUSD: 5,
    advertisedUSD: 70,
    productId: "mystika-llave-5",
    shortName: "Llave plata",
    keyColor: "linear-gradient(145deg,#e8ecf2,#8a93a8)",
    keyShadow: "0 4px 22px rgba(200,210,230,0.5)",
    prizes: [
      { icon: "💵", label: "$10 USD", color: "#00ff9d" },
      { icon: "📦", label: "Caja misteriosa", color: "#ff6b9d" },
      { icon: "🥠", label: "Galleta", color: "#ffd700" },
      { icon: "✨", label: "Mensaje del universo", color: "#00e5ff" },
    ],
  },
  {
    tier: 20,
    priceUSD: 20,
    advertisedUSD: 100,
    productId: "mystika-llave-20",
    shortName: "Llave aurum",
    keyColor: "linear-gradient(145deg,#ffe566,#c9a227)",
    keyShadow: "0 4px 26px rgba(255,215,0,0.55)",
    prizes: [
      { icon: "💵", label: "$30 USD", color: "#00ff9d" },
      { icon: "📦", label: "Caja misteriosa", color: "#ff6b9d" },
      { icon: "🥠", label: "Galleta de la suerte", color: "#ffd700" },
      { icon: "✨", label: "Mensaje cósmico", color: "#00e5ff" },
    ],
  },
];

const galletaPorTier: Record<LlaveTier, string[]> = {
  1: [
    "Hoy el universo te guiña: un pequeño gesto tuyo abrirá una puerta grande.",
    "Tu paciencia es orilla quieta: en la quietud llega la buena noticia.",
    "Un número favorito hoy: el que elijas con el corazón.",
    "Alguien cercano recordará algo bueno de vos: dejá que florezca.",
    "La suerte camina con quien camina: un paso al frente y claridad.",
  ],
  5: [
    "La fortuna no grita: susurra. Prestá atención a lo que te repiten con cariño.",
    "Un ciclo se cierra con elegancia y otro empieza con luz propia. Soltá lo que ya cumplió.",
    "Tu intuición tenía razón: confiá en el primer impulso generoso que tengas hoy.",
    "El cosmos guarda un as bajo la manga para vos: aparece cuando menos forceés.",
    "Lo que sembraste en silencio va a mostrar brotes visibles muy pronto.",
    "Un encuentro casual no es casual: llevá la conversación un paso más allá del saludo.",
  ],
  20: [
    "La galleta más cara no promete billetes: promete alineación. Estás en un tramo donde lo invisible ordena lo visible.",
    "El universo te nombra protagonista de un capítulo nuevo: escribí la primera escena con valentía suave, no con prisa.",
    "Lo que buscás con angustia ya te busca en calma: cruzá la mitad del puente y el resto se ilumina solo.",
    "Tu historia tiene un giro noble: lo que te dolió se convierte en brújula, no en ancla.",
    "Un mensaje cósmico claro: merecés espacios donde no tengas que demostrar nada para ser querido.",
    "La abundancia que te corresponde tiene la forma de paz sostenida, no de ruido. Abrí espacio para eso.",
  ],
};

const universoPorTier: Record<LlaveTier, string[]> = {
  1: [
    "El universo te envía un haz breve de claridad: lo suficiente para sonreír y seguir.",
    "Las estrellas acuerdan: hoy merecés un respiro sin culpa.",
    "Energía positiva en camino: abrí la ventana, literal o figurada.",
    "Vibración del día: gratitud pequeña, cambio grande.",
  ],
  5: [
    "El cosmos expande tu campo: lo que pedís con coherencia empieza a encontrar forma en detalles concretos.",
    "Universo en modo aliado: las fricciones de hoy son lija fina que pulen tu propósito.",
    "Onda positiva: tu honestidad con vos mismo es imán de coincidencias favorables.",
    "Mensaje estelar: no estás atrasado, estás en tu tiempo. El resto es ruido de comparación.",
    "El universo recicla la pena en compost: de ahí van a crecer cosas verdes.",
  ],
  20: [
    "Mensaje del universo — frecuencia alta: estás siendo preparado para sostener algo hermoso que todavía no anunciaron los calendarios.",
    "El cosmos te recuerda que la magnitud de tu vida no se mide en pantallas sino en momentos donde fuiste real.",
    "Universo positivo: la versión adulta de tus sueños no es más chica, es más precisa. Afiná el tiro con amor.",
    "Señal cósmica: lo que te hace único es exactamente lo que el mundo necesita que dejes de disculpar.",
    "El universo confirma: tu luz no compite con la de otros; suma. Encendé sin pedir permiso.",
  ],
};

export function pickLlavePremio(tier: LlaveTier): {
  kind: LlavePremioKind;
  text: string;
} {
  const kind: LlavePremioKind = Math.random() < 0.5 ? "galleta" : "universo";
  const pool = kind === "galleta" ? galletaPorTier[tier] : universoPorTier[tier];
  const text = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
  return { kind, text };
}

export function getTierInfo(tier: LlaveTier): LlaveTierInfo {
  return LLAVE_TIERS.find((t) => t.tier === tier) ?? LLAVE_TIERS[0];
}
