import type { CSSProperties } from "react";

export type MystikaTabTheme = {
  accent: string;
  accent2: string;
  glow: string;
  bg: string;
};

/** Neón / LED por sección al activar el tab */
export const MYSTIKA_TAB_THEMES: Record<string, MystikaTabTheme> = {
  inicio: {
    accent: "#ffd700",
    accent2: "#ffaa00",
    glow: "rgba(255, 215, 0, 0.55)",
    bg: "rgba(255, 215, 0, 0.14)",
  },
  orbe: {
    accent: "#b388ff",
    accent2: "#7744cc",
    glow: "rgba(179, 136, 255, 0.55)",
    bg: "rgba(179, 136, 255, 0.16)",
  },
  galleta: {
    accent: "#ffb347",
    accent2: "#ff8c00",
    glow: "rgba(255, 179, 71, 0.5)",
    bg: "rgba(255, 179, 71, 0.14)",
  },
  deseos: {
    accent: "#ff6b9d",
    accent2: "#ffd700",
    glow: "rgba(255, 107, 157, 0.5)",
    bg: "rgba(255, 107, 157, 0.12)",
  },
  jackpot: {
    accent: "#00e5ff",
    accent2: "#00ff9d",
    glow: "rgba(0, 229, 255, 0.55)",
    bg: "rgba(0, 229, 255, 0.12)",
  },
  botonrapido: {
    accent: "#ff3d00",
    accent2: "#ff9100",
    glow: "rgba(255, 61, 0, 0.55)",
    bg: "rgba(255, 61, 0, 0.12)",
  },
  llaves: {
    accent: "#e8b84a",
    accent2: "#c9a227",
    glow: "rgba(232, 184, 74, 0.5)",
    bg: "rgba(232, 184, 74, 0.12)",
  },
  ruleta: {
    accent: "#ff2d78",
    accent2: "#ff6b9d",
    glow: "rgba(255, 45, 120, 0.45)",
    bg: "rgba(255, 45, 120, 0.1)",
  },
  cofres: {
    accent: "#ff9f43",
    accent2: "#ff6b35",
    glow: "rgba(255, 159, 67, 0.5)",
    bg: "rgba(255, 159, 67, 0.12)",
  },
  mensaje: {
    accent: "#ff5c8a",
    accent2: "#ff8fab",
    glow: "rgba(255, 92, 138, 0.5)",
    bg: "rgba(255, 92, 138, 0.12)",
  },
  misterio: {
    accent: "#39ff14",
    accent2: "#00ff9d",
    glow: "rgba(57, 255, 20, 0.45)",
    bg: "rgba(57, 255, 20, 0.1)",
  },
};

export function getTabTheme(tabId: string): MystikaTabTheme {
  return MYSTIKA_TAB_THEMES[tabId] ?? MYSTIKA_TAB_THEMES.orbe;
}

export function activeTabStyle(theme: MystikaTabTheme): CSSProperties {
  return {
    background: `linear-gradient(165deg, ${theme.bg} 0%, rgba(8, 5, 14, 0.92) 55%, rgba(12, 7, 22, 0.98) 100%)`,
    borderColor: theme.accent,
    color: theme.accent,
    boxShadow: `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow}, inset 0 0 24px ${theme.bg}, inset 0 1px 0 ${theme.accent}`,
  };
}

export function hoverTabStyle(theme: MystikaTabTheme): CSSProperties {
  return {
    borderColor: `${theme.accent}66`,
    boxShadow: `0 0 12px ${theme.glow}`,
  };
}
