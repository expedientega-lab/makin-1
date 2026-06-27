"use client";

const SIDE_COLORS = [
  "#ffd700",
  "#ffec8a",
  "#b388ff",
  "#ff6b9d",
  "#00ff9d",
  "#00e5ff",
  "#ffd700",
  "#b388ff",
];

function CasinoBulb({
  color,
  active,
  delay,
  size = 12,
}: {
  color: string;
  active: boolean;
  delay: number;
  size?: number;
}) {
  return (
    <div
      className="rounded-full flex-shrink-0 relative"
      style={{
        width: size,
        height: size,
        background: active
          ? `radial-gradient(circle at 32% 28%, #fff 0%, ${color} 38%, ${color}99 100%)`
          : "radial-gradient(circle at 30% 25%, #3a3048 0%, #14101c 70%)",
        border: active ? `2px solid ${color}` : "2px solid rgba(45,38,58,0.9)",
        boxShadow: active
          ? `0 0 ${size * 0.9}px ${color}, 0 0 ${size * 1.6}px ${color}99, inset 0 -2px 4px rgba(0,0,0,0.35)`
          : "inset 0 2px 4px rgba(0,0,0,0.55)",
        animation: active ? "casino-bulb-chase 1.1s ease-in-out infinite" : undefined,
        animationDelay: active ? `${delay}s` : undefined,
      }}
    />
  );
}

interface OrbCasinoSideLightsProps {
  side: "left" | "right";
  active: boolean;
  frantic?: boolean;
  className?: string;
}

/** Columnas verticales — solo tablet/desktop */
export function OrbCasinoSideLights({
  side,
  active,
  frantic = false,
  className = "",
}: OrbCasinoSideLightsProps) {
  const count = 12;
  const chaseDur = frantic ? 0.55 : 1.1;
  const isLeft = side === "left";
  const label = isLeft ? "PREMIO" : "JACKPOT";

  return (
    <div
      className={[
        "relative hidden sm:flex flex-shrink-0 flex-col items-center justify-center",
        "w-[44px] md:w-[56px] self-stretch min-h-[260px] md:min-h-[300px]",
        className,
      ].join(" ")}
      aria-hidden
    >
      <style>{`
        @keyframes casino-bulb-chase {
          0%, 100% { opacity: 0.35; transform: scale(0.82); filter: brightness(0.65); }
          35% { opacity: 1; transform: scale(1.12); filter: brightness(1.35); }
          55% { opacity: 0.95; transform: scale(1); }
        }
        @keyframes casino-neon-flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.85; }
          94% { opacity: 1; }
        }
      `}</style>

      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          border: "2px solid rgba(255,215,0,0.35)",
          background:
            "linear-gradient(180deg, rgba(255,215,0,0.12) 0%, rgba(12,8,22,0.92) 45%, rgba(179,136,255,0.1) 100%)",
          boxShadow:
            "inset 0 0 20px rgba(179,136,255,0.15), 0 0 24px rgba(0,0,0,0.5), 4px 0 28px rgba(255,215,0,0.08)",
        }}
      />

      <div className="relative z-[1] flex flex-col items-center justify-between h-full py-4 md:py-5 gap-2">
        <span
          className="font-display font-black text-[9px] md:text-[10px] tracking-[0.15em] text-center leading-tight"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            color: "#ffd700",
            textShadow:
              "0 0 8px rgba(255,215,0,0.9), 0 0 16px rgba(255,215,0,0.5), 0 0 24px rgba(179,136,255,0.4)",
            animation: active ? "casino-neon-flicker 4s ease-in-out infinite" : undefined,
            opacity: active ? 1 : 0.4,
          }}
        >
          ★ {label}
        </span>

        <div className="flex flex-col items-center gap-2 md:gap-2.5 flex-1 justify-center">
          {Array.from({ length: count }, (_, i) => (
            <CasinoBulb
              key={i}
              color={SIDE_COLORS[i % SIDE_COLORS.length]}
              active={active}
              delay={(i * chaseDur) / count + (isLeft ? 0 : 0.25)}
              size={11}
            />
          ))}
        </div>

        <span
          className="font-mono text-[7px] md:text-[8px] tracking-[0.2em]"
          style={{
            color: "rgba(179,136,255,0.85)",
            textShadow: "0 0 6px rgba(179,136,255,0.6)",
            opacity: active ? 0.9 : 0.35,
          }}
        >
          MYSTIKA
        </span>
      </div>
    </div>
  );
}

interface OrbCasinoLedBarProps {
  active: boolean;
  frantic?: boolean;
  position: "top" | "bottom";
}

/** Franja LED horizontal — móvil */
export function OrbCasinoLedBar({
  active,
  frantic = false,
  position,
}: OrbCasinoLedBarProps) {
  const count = 14;
  const chaseDur = frantic ? 0.45 : 0.95;
  const label = position === "top" ? "◆ PREMIO ◆" : "◆ JACKPOT ◆";

  return (
    <div
      className="relative w-full h-[38px] sm:h-[42px] flex sm:hidden items-center rounded-xl overflow-hidden flex-shrink-0"
      aria-hidden
    >
      <style>{`
        @keyframes casino-bulb-chase {
          0%, 100% { opacity: 0.35; transform: scale(0.82); filter: brightness(0.65); }
          35% { opacity: 1; transform: scale(1.12); filter: brightness(1.35); }
          55% { opacity: 0.95; transform: scale(1); }
        }
      `}</style>
      <div
        className="absolute inset-0"
        style={{
          border: "1px solid rgba(255,215,0,0.3)",
          background:
            position === "top"
              ? "linear-gradient(90deg, rgba(255,215,0,0.14), rgba(18,10,32,0.95) 50%, rgba(179,136,255,0.12))"
              : "linear-gradient(90deg, rgba(179,136,255,0.12), rgba(18,10,32,0.95) 50%, rgba(255,215,0,0.14))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      />
      <span
        className="relative z-[1] font-display font-black text-[9px] tracking-[0.2em] px-2.5 shrink-0"
        style={{
          color: "#ffd700",
          textShadow: "0 0 10px rgba(255,215,0,0.8)",
        }}
      >
        {label}
      </span>
      <div className="relative z-[1] flex flex-1 items-center justify-center gap-1.5 px-2">
        {Array.from({ length: count }, (_, i) => (
          <CasinoBulb
            key={i}
            color={SIDE_COLORS[i % SIDE_COLORS.length]}
            active={active}
            delay={(i * chaseDur) / count}
            size={9}
          />
        ))}
      </div>
    </div>
  );
}
