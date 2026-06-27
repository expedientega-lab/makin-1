export type StikerType = "celular" | "pantalla";

export type StikerItem = {
  id: string;
  name: string;
  tagline: string;
  type: StikerType;
  priceUsd: number;
  emoji: string;
  /** Vista previa en CSS */
  preview: string;
  colors: [string, string, string];
};

export const STIKERS: StikerItem[] = [
  {
    id: "nebula-violeta",
    name: "Nebulosa Violeta",
    tagline: "Niebla cósmica para tu pantalla de bloqueo",
    type: "celular",
    priceUsd: 1,
    emoji: "🌌",
    preview:
      "radial-gradient(ellipse 80% 60% at 30% 20%, #b388ff88 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 80% 90%, #ff6b9d55 0%, transparent 45%), linear-gradient(160deg, #0a0612 0%, #1a0a2e 40%, #0d0520 100%)",
    colors: ["#b388ff", "#ff6b9d", "#0a0612"],
  },
  {
    id: "senal-ovni",
    name: "Señal OVNI",
    tagline: "Haz de luz extraterrestre en tu celular",
    type: "celular",
    priceUsd: 2,
    emoji: "🛸",
    preview:
      "radial-gradient(ellipse 50% 80% at 50% 0%, #00e5ff55 0%, transparent 60%), radial-gradient(circle at 50% 30%, #39ff1433 0%, transparent 40%), linear-gradient(180deg, #050810 0%, #0a1628 50%, #050810 100%)",
    colors: ["#00e5ff", "#39ff14", "#050810"],
  },
  {
    id: "orbe-mistico",
    name: "Orbe Místico",
    tagline: "Esfera de energía para fondo mobile",
    type: "celular",
    priceUsd: 2,
    emoji: "🔮",
    preview:
      "radial-gradient(circle at 50% 45%, #b388ff66 0%, transparent 35%), radial-gradient(ellipse 100% 40% at 50% 100%, #ffd70022 0%, transparent 50%), linear-gradient(145deg, #130d22 0%, #0a0612 100%)",
    colors: ["#b388ff", "#ffd700", "#130d22"],
  },
  {
    id: "aurora-nocturna",
    name: "Aurora Nocturna",
    tagline: "Desktop wallpaper de aurora boreal mística",
    type: "pantalla",
    priceUsd: 3,
    emoji: "✨",
    preview:
      "radial-gradient(ellipse 90% 40% at 20% 60%, #00ff9d44 0%, transparent 50%), radial-gradient(ellipse 80% 35% at 75% 40%, #b388ff55 0%, transparent 45%), linear-gradient(180deg, #020408 0%, #0a1020 60%, #050810 100%)",
    colors: ["#00ff9d", "#b388ff", "#020408"],
  },
  {
    id: "constelacion-oscura",
    name: "Constelación Oscura",
    tagline: "Mapa estelar para monitor o laptop",
    type: "pantalla",
    priceUsd: 3,
    emoji: "🌠",
    preview:
      "radial-gradient(ellipse 60% 50% at 60% 30%, #00e5ff33 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 20% 70%, #ff6b9d28 0%, transparent 50%), linear-gradient(135deg, #08051a 0%, #0f0a24 50%, #060410 100%)",
    colors: ["#00e5ff", "#ff6b9d", "#08051a"],
  },
  {
    id: "portal-mystika",
    name: "Portal Mystika",
    tagline: "Fondo premium de escritorio del archivo",
    type: "pantalla",
    priceUsd: 4,
    emoji: "🌀",
    preview:
      "radial-gradient(ellipse 70% 60% at 50% 50%, #b388ff44 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 50% 50%, #ffd70033 0%, transparent 60%), conic-gradient(from 0deg at 50% 50%, #130d22, #1a0a2e, #0a1628, #130d22)",
    colors: ["#b388ff", "#ffd700", "#130d22"],
  },
];

const STORAGE_KEY = "mystika-stikers-owned";

export function stikerProductId(stikerId: string): string {
  return `mystika-stiker-${stikerId}`;
}

export function stikerIdFromProductId(productId: string): string | null {
  if (!productId.startsWith("mystika-stiker-")) return null;
  return productId.replace("mystika-stiker-", "");
}

export function findStiker(stikerId: string): StikerItem | undefined {
  return STIKERS.find((s) => s.id === stikerId);
}

export function isStikerProduct(productId: string): boolean {
  return productId.startsWith("mystika-stiker-");
}

export function readOwnedStikers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function isStikerOwned(stikerId: string): boolean {
  return readOwnedStikers().includes(stikerId);
}

export function unlockStiker(stikerId: string): void {
  if (typeof window === "undefined") return;
  const owned = readOwnedStikers();
  if (owned.includes(stikerId)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...owned, stikerId]));
}

export function stikerPayCopy(item: StikerItem) {
  const tipo = item.type === "celular" ? "celular" : "escritorio";
  return {
    title: `${item.emoji} ${item.name} — $${item.priceUsd} USD`,
    description: `Fondo de pantalla para ${tipo}. Pagá con PayPal o tarjeta y descargalo al instante.`,
  };
}

function stikerDimensions(type: StikerType): { w: number; h: number } {
  return type === "celular" ? { w: 1080, h: 1920 } : { w: 2560, h: 1440 };
}

function pseudoStars(seed: number, count: number, w: number, h: number): string {
  const rng = (i: number) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const scale = w / 1080;
  return Array.from({ length: count }, (_, i) => {
    const cx = rng(i) * w;
    const cy = rng(i + 3) * h;
    const r = (0.15 + rng(i + 7) * 1.2) * scale;
    const op = 0.3 + rng(i + 11) * 0.7;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(2)}" fill="white" opacity="${op.toFixed(2)}"/>`;
  }).join("");
}

export function buildStikerSvg(item: StikerItem): string {
  const { w, h } = stikerDimensions(item.type);
  const [c1, c2, c3] = item.colors;
  const stars = pseudoStars(item.id.length * 31, item.type === "celular" ? 80 : 120, w, h);
  const uid = item.id.replace(/[^a-z0-9]/gi, "");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g1-${uid}" cx="30%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2-${uid}" cx="75%" cy="85%" r="55%">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3-${uid}" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${c3}"/>
  <rect width="${w}" height="${h}" fill="url(#g1-${uid})"/>
  <rect width="${w}" height="${h}" fill="url(#g2-${uid})"/>
  <rect width="${w}" height="${h}" fill="url(#g3-${uid})"/>
  ${stars}
  <text x="${w / 2}" y="${h * 0.94}" text-anchor="middle" fill="${c1}" opacity="0.35" font-family="monospace" font-size="${Math.round(w * 0.018)}">MYSTIKA ARCHIVE</text>
</svg>`;
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  const isIos =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIos) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 8000);
}

/** Descarga PNG en alta resolución. Solo si el usuario lo compró (salvo skipOwnershipCheck). */
export async function downloadStiker(
  item: StikerItem,
  options?: { skipOwnershipCheck?: boolean },
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!options?.skipOwnershipCheck && !isStikerOwned(item.id)) return false;

  const { w, h } = stikerDimensions(item.type);
  const svg = buildStikerSvg(item);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(false);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(false);
              return;
            }
            triggerFileDownload(blob, `mystika-${item.id}-${item.type}.png`);
            resolve(true);
          },
          "image/png",
          0.92,
        );
      } catch {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = svgDataUrl;
  });
}
