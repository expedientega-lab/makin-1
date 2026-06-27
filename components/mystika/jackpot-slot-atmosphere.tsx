"use client";

import { useEffect, useMemo, useState } from "react";

type Star = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

function randomStars(count: number, seed: number): Star[] {
  const rng = (i: number) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const colors = ["#ffffff", "#b388ff", "#00e5ff", "#00ff9d", "#c8d4ff"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 1 + rng(i) * 98,
    top: 1 + rng(i + 5) * 98,
    size: rng(i + 2) > 0.88 ? 2.5 : rng(i + 2) > 0.55 ? 1.5 : 1,
    delay: rng(i + 11) * 6,
    duration: 2.2 + rng(i + 3) * 3.8,
    color: colors[Math.floor(rng(i + 7) * colors.length)],
  }));
}

interface JackpotSlotAtmosphereProps {
  /** Más brillo y partículas durante el giro */
  intense?: boolean;
}

export function JackpotSlotAtmosphere({ intense = false }: JackpotSlotAtmosphereProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const stars = useMemo(
    () => randomStars(reducedMotion ? 10 : 28, 777),
    [reducedMotion],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl"
      aria-hidden
    >
      <style>{`
        @keyframes jackpot-star-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          40% { opacity: 0.95; transform: scale(1.25); }
          70% { opacity: 0.4; transform: scale(1); }
        }
        @keyframes jackpot-ambient-pulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.75; }
        }
        @keyframes jackpot-dust-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-12px) translateX(6px); opacity: 0.55; }
        }
        @keyframes jackpot-scan-sweep {
          0% { transform: translateY(-120%); opacity: 0; }
          8% { opacity: 0.35; }
          92% { opacity: 0.2; }
          100% { transform: translateY(120%); opacity: 0; }
        }
        @keyframes jackpot-neon-flicker {
          0%, 100% { opacity: 1; }
          91% { opacity: 1; }
          92% { opacity: 0.88; }
          93% { opacity: 1; }
          94% { opacity: 0.92; }
        }
      `}</style>

      {/* Nebulosa de fondo */}
      <div
        className="absolute inset-0"
        style={{
          background: intense
            ? `radial-gradient(ellipse 85% 58% at 50% 36%, rgba(179,136,255,0.24) 0%, transparent 60%),
               radial-gradient(ellipse 70% 46% at 14% 78%, rgba(255,215,0,0.14) 0%, transparent 52%),
               radial-gradient(ellipse 58% 40% at 86% 18%, rgba(0,255,157,0.10) 0%, transparent 48%),
               radial-gradient(ellipse 40% 30% at 60% 60%, rgba(255,255,255,0.05) 0%, transparent 65%)`
            : `radial-gradient(ellipse 78% 48% at 50% 38%, rgba(179,136,255,0.16) 0%, transparent 62%),
               radial-gradient(ellipse 55% 38% at 16% 82%, rgba(255,215,0,0.10) 0%, transparent 55%),
               radial-gradient(ellipse 50% 34% at 86% 18%, rgba(0,255,157,0.07) 0%, transparent 55%)`,
          animation: reducedMotion ? undefined : "jackpot-ambient-pulse 4s ease-in-out infinite",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(4,2,10,0.65) 100%)",
        }}
      />

      {/* Estrellas */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            background: star.color,
            boxShadow:
              star.size > 1.5
                ? `0 0 ${star.size * 3}px ${star.color}, 0 0 ${star.size * 6}px ${star.color}88`
                : `0 0 4px ${star.color}`,
            animation: reducedMotion
              ? undefined
              : `jackpot-star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Polvo / chispas flotantes */}
      {!reducedMotion &&
        Array.from({ length: intense ? 10 : 6 }).map((_, i) => (
          <span
            key={`dust-${i}`}
            className="absolute rounded-full bg-white/40"
            style={{
              left: `${12 + (i * 19) % 76}%`,
              top: `${18 + (i * 27) % 64}%`,
              width: 2,
              height: 2,
              animation: `jackpot-dust-float ${5 + (i % 4)}s ease-in-out ${i * 0.7}s infinite`,
            }}
          />
        ))}

      {/* Barrido de luz (sensación “en vivo”) */}
      {!reducedMotion && (
        <div
          className="absolute left-0 right-0 h-[40%] opacity-0"
          style={{
            background:
            "linear-gradient(180deg, transparent, rgba(255,215,0,0.08) 40%, rgba(179,136,255,0.10) 58%, transparent)",
            animation: `jackpot-scan-sweep ${intense ? 5 : 9}s linear infinite`,
          }}
        />
      )}

      {/* Parpadeo sutil tipo neón */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 mix-blend-screen opacity-[0.03]"
          style={{
            background:
              "linear-gradient(90deg, rgba(179,136,255,0.55), rgba(255,215,0,0.25), rgba(0,255,157,0.25))",
            animation: "jackpot-neon-flicker 14s steps(1) infinite",
          }}
        />
      )}
    </div>
  );
}
