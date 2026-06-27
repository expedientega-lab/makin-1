"use client";

import type { LlaveTierInfo } from "@/lib/llaves-data";

const TIER_RIM: Record<number, { accent: string; glow: string; bg: string }> = {
  1: {
    accent: "#b87333",
    glow: "rgba(184,115,51,0.55)",
    bg: "linear-gradient(165deg, rgba(184,115,51,0.12) 0%, rgba(8,5,14,0.92) 42%, rgba(12,8,20,0.98) 100%)",
  },
  5: {
    accent: "#c8d4e8",
    glow: "rgba(200,212,232,0.45)",
    bg: "linear-gradient(165deg, rgba(200,212,232,0.1) 0%, rgba(8,5,14,0.92) 42%, rgba(12,8,20,0.98) 100%)",
  },
  20: {
    accent: "#ffd700",
    glow: "rgba(255,215,0,0.55)",
    bg: "linear-gradient(165deg, rgba(255,215,0,0.11) 0%, rgba(8,5,14,0.92) 42%, rgba(12,8,20,0.98) 100%)",
  },
};

interface LlaveTierCardLightsProps {
  tier: LlaveTierInfo;
  onBuy: () => void;
}

export function LlaveTierCardLights({ tier, onBuy }: LlaveTierCardLightsProps) {
  const rim = TIER_RIM[tier.tier] ?? TIER_RIM[1];
  const ledCount = tier.tier === 20 ? 18 : tier.tier === 5 ? 16 : 14;

  return (
    <div className="relative group overflow-visible p-2.5 sm:p-3 h-full">
      <style>{`
        @keyframes llave-led-chase {
          0%, 100% { opacity: 0.25; transform: scale(0.7); filter: brightness(0.5); }
          14% { opacity: 1; transform: scale(1.2); filter: brightness(1.35); }
          28% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes llave-prize-shimmer {
          0%, 100% { box-shadow: 0 0 10px var(--prize-glow); }
          50% { box-shadow: 0 0 18px var(--prize-glow), inset 0 0 12px var(--prize-glow); }
        }
        @keyframes llave-key-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes llave-scan {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateX(200%); opacity: 0; }
        }
      `}</style>

      {/* LED perimeter */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: ledCount }, (_, i) => {
          const perimeter = 2 * (94 + 98);
          const dist = (i / ledCount) * perimeter;
          let left = 3;
          let top = 3;
          if (dist < 94) {
            left = 3 + dist;
            top = 3;
          } else if (dist < 94 + 98) {
            left = 97;
            top = 3 + (dist - 94);
          } else if (dist < 94 * 2 + 98) {
            left = 97 - (dist - 94 - 98);
            top = 97;
          } else {
            left = 3;
            top = 97 - (dist - 94 * 2 - 98);
          }
          const hue =
            i % 4 === 0 ? rim.accent : i % 4 === 1 ? "#b388ff" : i % 4 === 2 ? "#00ff9d" : "#ffd700";
          return (
            <div
              key={i}
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: "clamp(7px, 1.8vw, 10px)",
                height: "clamp(7px, 1.8vw, 10px)",
                background: `radial-gradient(circle at 30% 25%, #fff 0%, ${hue} 50%, ${hue}cc 100%)`,
                border: `1.5px solid ${hue}`,
                boxShadow: `0 0 10px ${hue}99, 0 0 18px ${hue}55`,
                animation: `llave-led-chase ${tier.tier === 20 ? 1.6 : 2}s ease-in-out infinite`,
                animationDelay: `${(i / ledCount) * (tier.tier === 20 ? 1.6 : 2)}s`,
              }}
            />
          );
        })}
      </div>

      <div
        className="relative rounded-xl border p-4 sm:p-[18px] flex h-full flex-col items-stretch text-center overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0_36px_var(--tier-glow)]"
        style={{
          ["--tier-glow" as string]: rim.glow,
          background: rim.bg,
          borderColor: `${rim.accent}55`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 28px ${rim.glow}, 0 8px 32px rgba(0,0,0,0.35)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-80"
          style={{
            background: `linear-gradient(90deg, transparent, ${rim.accent}, #b388ff, ${rim.accent}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden
        >
          <div
            className="absolute inset-y-0 w-[40%]"
            style={{
              background:
                "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              animation: "llave-scan 2.8s ease-in-out infinite",
            }}
          />
        </div>

        <div
          className="relative mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: tier.keyColor,
            boxShadow: `${tier.keyShadow}, inset 0 2px 6px rgba(255,255,255,0.25)`,
            animation: "llave-key-float 3.5s ease-in-out infinite",
          }}
        >
          <span
            className="text-[28px] leading-none"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))" }}
            aria-hidden
          >
            🔑
          </span>
          <span
            className="absolute -inset-1 rounded-full pointer-events-none"
            style={{
              boxShadow: `0 0 20px ${rim.glow}, 0 0 36px ${rim.glow}`,
            }}
          />
        </div>

        <div className="text-[14px] sm:text-[15px] font-mono tracking-[2px] text-[var(--mystik3)] mb-0.5">
          {tier.shortName.toUpperCase()}
        </div>
        <div
          className="font-display font-black text-[32px] sm:text-[36px] mb-0.5"
          style={{
            color: "var(--txt)",
            textShadow: `0 0 24px ${rim.glow}`,
          }}
        >
          ${tier.priceUSD}
        </div>
        <div className="text-[14px] sm:text-[15px] text-[var(--gold3)] font-mono mb-3 min-h-[40px] flex items-center justify-center leading-snug">
          Cofre simbólico hasta USD {tier.advertisedUSD}
        </div>

        <p className="font-mono text-[10px] tracking-[0.15em] text-[var(--mystik3)] mb-2 shrink-0">
          PODÉS GANAR
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4 flex-1 min-h-[168px] content-start">
          {tier.prizes.map((p, pi) => (
            <div
              key={p.label}
              className="flex flex-col items-center justify-center gap-1 h-[78px] px-2 py-2 rounded-lg border relative overflow-hidden"
              style={{
                ["--prize-glow" as string]: `${p.color}44`,
                borderColor: `${p.color}55`,
                background: `${p.color}12`,
                animation: `llave-prize-shimmer ${2.4 + (pi % 3) * 0.4}s ease-in-out infinite`,
                animationDelay: `${pi * 0.35}s`,
              }}
            >
              <span
                className="text-[24px] sm:text-[26px] leading-none relative z-[1] shrink-0"
                style={{ filter: `drop-shadow(0 0 10px ${p.color}88)` }}
                aria-hidden
              >
                {p.icon}
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-mono font-bold leading-tight text-center relative z-[1] line-clamp-2 min-h-[26px] flex items-center"
                style={{ color: p.color }}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onBuy}
          className="relative mt-auto w-full shrink-0 py-3 min-h-[48px] rounded-lg font-mono text-[13px] sm:text-[14px] tracking-[1.5px] text-[var(--bg0)] transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${rim.accent}ee, var(--mystik))`,
            boxShadow: `0 0 20px ${rim.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          COMPRAR — ${tier.priceUSD}
        </button>
      </div>
    </div>
  );
}
