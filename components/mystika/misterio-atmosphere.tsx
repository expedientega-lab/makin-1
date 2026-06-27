"use client";

import { useEffect, useMemo, useState } from "react";

const CATEGORY_THEMES: Record<
  string,
  { primary: string; secondary: string; glow: string; label: string }
> = {
  ovnis: {
    primary: "#00e5ff",
    secondary: "#00ff9d",
    glow: "rgba(0,229,255,0.35)",
    label: "SEÑAL AÉREA DETECTADA",
  },
  juego: {
    primary: "#39ff14",
    secondary: "#00e5ff",
    glow: "rgba(57,255,20,0.28)",
    label: "JUEGO EN CURSO",
  },
  donacion: {
    primary: "#ffd700",
    secondary: "#ff9100",
    glow: "rgba(255,215,0,0.35)",
    label: "ENERGÍA RECIBIDA",
  },
  stikers: {
    primary: "#c77dff",
    secondary: "#00e5ff",
    glow: "rgba(199,125,255,0.35)",
    label: "GALERÍA DE FONDOS",
  },
  relatos: {
    primary: "#ff6b9d",
    secondary: "#ffd700",
    glow: "rgba(255,107,157,0.28)",
    label: "NUEVO RELATO INGRESANDO",
  },
};

type LightOrb = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  drift: "a" | "b" | "c";
};

function randomOrbs(count: number, seed: number): LightOrb[] {
  const rng = (i: number) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 8 + rng(i) * 84,
    top: 5 + rng(i + 7) * 90,
    size: 40 + rng(i + 3) * 120,
    delay: rng(i + 11) * 4,
    duration: 6 + rng(i + 5) * 10,
    drift: (["a", "b", "c"] as const)[Math.floor(rng(i + 9) * 3)],
  }));
}

interface MisterioAtmosphereProps {
  category: string;
  hideArchivoLabel?: boolean;
}

export function MisterioAtmosphere({
  category,
  hideArchivoLabel = false,
}: MisterioAtmosphereProps) {
  const [entered, setEntered] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const theme = CATEGORY_THEMES[category] ?? CATEGORY_THEMES.ovnis;

  const orbs = useMemo(
    () => randomOrbs(reducedMotion ? 4 : 9, category.length * 17),
    [category, reducedMotion],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setEntered(false);
    setPulse(true);
    const enter = window.setTimeout(() => setEntered(true), 80);
    const pulseOff = window.setTimeout(() => setPulse(false), 900);
    return () => {
      clearTimeout(enter);
      clearTimeout(pulseOff);
    };
  }, [category]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl -z-0"
      aria-hidden
    >
      <style>{`
        @keyframes misterio-enter-flash {
          0% { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes misterio-orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          33% { transform: translate(12px, -18px) scale(1.08); opacity: 0.55; }
          66% { transform: translate(-8px, 10px) scale(0.95); opacity: 0.4; }
        }
        @keyframes misterio-orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(-14px, 12px) scale(1.12); opacity: 0.5; }
        }
        @keyframes misterio-orb-c {
          0%, 100% { transform: translate(0, 0); opacity: 0.25; }
          25% { transform: translate(6px, 14px); opacity: 0.45; }
          75% { transform: translate(-10px, -8px); opacity: 0.35; }
        }
        @keyframes misterio-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes misterio-flicker {
          0%, 92%, 100% { opacity: 0; }
          93% { opacity: 0.15; }
          94% { opacity: 0.03; }
          95% { opacity: 0.2; }
        }
        @keyframes misterio-pulse-ring {
          0% { transform: scale(0.6); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes misterio-beam {
          0%, 100% { opacity: 0.12; transform: rotate(-12deg) scaleX(0.9); }
          50% { opacity: 0.28; transform: rotate(-8deg) scaleX(1.05); }
        }
        @keyframes misterio-status-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      {/* Entrada / cambio de categoría */}
      <div
        className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
        style={{
          opacity: entered ? 1 : 0,
          background: `radial-gradient(ellipse 90% 60% at 50% 0%, ${theme.glow} 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 80% 100%, ${theme.secondary}18 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 10% 80%, ${theme.primary}12 0%, transparent 45%)`,
        }}
      />

      {pulse && !reducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${theme.primary}40 0%, transparent 50%)`,
            animation: "misterio-enter-flash 0.9s ease-out forwards",
          }}
        />
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 35%, rgba(4,2,10,0.75) 100%)",
        }}
      />

      {/* Haz de luz superior (OVNI / faro) */}
      {!reducedMotion && (
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[min(90%,420px)] h-[55%] opacity-0 transition-opacity duration-700"
          style={{
            opacity: entered ? 1 : 0,
            background: `conic-gradient(from 180deg at 50% 100%, transparent 0deg, ${theme.primary}22 25deg, transparent 50deg, ${theme.secondary}15 75deg, transparent 100deg)`,
            filter: "blur(28px)",
            animation: reducedMotion ? undefined : "misterio-beam 8s ease-in-out infinite",
          }}
        />
      )}

      {/* Orbes flotantes */}
      {orbs.map((orb) => (
        <div
          key={`${category}-${orb.id}`}
          className="absolute rounded-full"
          style={{
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${theme.primary}55 0%, ${theme.secondary}22 40%, transparent 70%)`,
            filter: "blur(20px)",
            animation: reducedMotion
              ? undefined
              : `misterio-orb-${orb.drift} ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}

      {/* Anillo de pulso al entrar */}
      {pulse && !reducedMotion && (
        <div
          className="absolute left-1/2 top-[18%] -translate-x-1/2 w-32 h-32 rounded-full border"
          style={{
            borderColor: theme.primary,
            animation: "misterio-pulse-ring 1.2s ease-out forwards",
          }}
        />
      )}

      {/* Línea de escaneo */}
      {!reducedMotion && (
        <div
          className="absolute left-0 right-0 h-[2px] opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.primary}, ${theme.secondary}, transparent)`,
            boxShadow: `0 0 20px ${theme.primary}`,
            animation: "misterio-scan 7s linear infinite",
          }}
        />
      )}

      {/* Parpadeo CRT ocasional */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.12) 2px,
              rgba(0,0,0,0.12) 4px
            )`,
            animation: "misterio-flicker 11s steps(1) infinite",
          }}
        />
      )}

      {/* Partículas estáticas */}
      <div className="absolute inset-0 opacity-60">
        {Array.from({ length: reducedMotion ? 12 : 28 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 17 + 7) % 100}%`,
              top: `${(i * 23 + 11) % 100}%`,
              width: i % 4 === 0 ? 2 : 1,
              height: i % 4 === 0 ? 2 : 1,
              opacity: 0.15 + (i % 5) * 0.08,
              boxShadow: i % 6 === 0 ? `0 0 6px ${theme.primary}` : undefined,
            }}
          />
        ))}
      </div>

      {/* Barra de estado misteriosa */}
      <div
        className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 opacity-0 transition-opacity duration-500 pointer-events-none"
        style={{ opacity: entered ? 0.9 : 0 }}
      >
        <span
          className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] uppercase truncate"
          style={{
            color: theme.primary,
            animation: reducedMotion ? undefined : "misterio-status-blink 2.4s ease-in-out infinite",
          }}
        >
          ◉ {theme.label}
        </span>
        {!hideArchivoLabel && (
          <span className="font-mono text-[8px] text-[var(--txt3)] tabular-nums shrink-0">
            ARCHIVO · LIVE
          </span>
        )}
      </div>
    </div>
  );
}
