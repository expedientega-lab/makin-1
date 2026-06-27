"use client";

import { useEffect, useMemo, useState } from "react";

const REEL_SYMBOLS = ["💎", "🔮", "⭐", "💜", "🌙", "🥠", "🎯", "🌟"];

interface JackpotReelProps {
  finalSymbol: string;
  spinning: boolean;
  stopped: boolean;
  reelIndex: number;
}

export function JackpotReel({
  finalSymbol,
  spinning,
  stopped,
  reelIndex,
}: JackpotReelProps) {
  const [justLanded, setJustLanded] = useState(false);
  const isRolling = spinning && !stopped;

  const strip = useMemo(() => {
    const cycles = 3 + reelIndex;
    const items: string[] = [];
    for (let c = 0; c < cycles; c++) {
      items.push(...REEL_SYMBOLS);
    }
    items.push(finalSymbol);
    return items;
  }, [finalSymbol, reelIndex]);

  const rollDelay = reelIndex * 0.1
  const stopMs = 1400 + reelIndex * 600
  const rollDuration = (stopMs - rollDelay * 1000) / 1000

  useEffect(() => {
    if (stopped && spinning) {
      setJustLanded(true);
      const t = window.setTimeout(() => setJustLanded(false), 520);
      return () => window.clearTimeout(t);
    }
    if (!spinning) setJustLanded(false);
  }, [stopped, spinning]);

  return (
    <div
      className="flex-1 max-w-[120px] aspect-square rounded-2xl relative overflow-hidden"
      style={{
        background: stopped
          ? "rgba(179, 136, 255, 0.1)"
          : "rgba(255, 255, 255, 0.035)",
        border: justLanded
          ? "2px solid rgba(255, 215, 0, 0.75)"
          : stopped
            ? "1px solid rgba(179, 136, 255, 0.4)"
            : "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: justLanded
          ? "0 0 32px rgba(255, 215, 0, 0.45), inset 0 0 20px rgba(255, 215, 0, 0.08)"
          : isRolling
            ? "inset 0 0 24px rgba(179, 136, 255, 0.12)"
            : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      <style>{`
        @keyframes jackpot-reel-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(-100% + 100% / var(--reel-count))); }
        }
        @keyframes jackpot-reel-land {
          0% { transform: scale(1.12); filter: brightness(1.35); }
          55% { transform: scale(0.94); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes jackpot-reel-shimmer {
          0% { opacity: 0.3; transform: translateX(-100%); }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; transform: translateX(100%); }
        }
      `}</style>

      {/* Máscara superior / inferior */}
      <div
        className="absolute inset-x-0 top-0 h-[18%] z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(8, 5, 14, 0.95) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[18%] z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, rgba(8, 5, 14, 0.95) 0%, transparent 100%)",
        }}
      />

      {/* Línea de pago en este carrete */}
      <div
        className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-[2px] z-[3] pointer-events-none rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.85), transparent)",
          boxShadow: isRolling
            ? "0 0 14px rgba(255, 215, 0, 0.7)"
            : stopped
              ? "0 0 10px rgba(255, 215, 0, 0.45)"
              : "none",
          opacity: spinning ? 1 : 0.35,
        }}
      />

      {isRolling && (
        <div
          className="absolute inset-0 z-[4] pointer-events-none overflow-hidden rounded-2xl"
          aria-hidden
        >
          <div
            className="absolute inset-y-0 w-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
              animation: "jackpot-reel-shimmer 0.55s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {justLanded && (
        <div
          className="absolute inset-0 z-[5] pointer-events-none rounded-2xl"
          style={{
            background: "rgba(255, 215, 0, 0.18)",
            animation: "ping 0.45s ease-out forwards",
          }}
        />
      )}

      <div className="absolute inset-0 overflow-hidden">
        {isRolling ? (
          <div
            className="absolute left-0 right-0 top-0 will-change-transform"
            style={
              {
                height: `${strip.length * 100}%`,
                "--reel-count": strip.length,
                animation: `jackpot-reel-scroll ${rollDuration}s cubic-bezier(0.15, 0.85, 0.25, 1) forwards`,
                animationDelay: `${rollDelay}s`,
              } as React.CSSProperties
            }
          >
            {strip.map((sym, i) => (
              <div
                key={`${sym}-${i}`}
                className="flex items-center justify-center select-none"
                style={{ height: `${100 / strip.length}%` }}
              >
                <span className="text-5xl sm:text-6xl leading-none">{sym}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-5xl sm:text-6xl select-none leading-none"
              style={{
                animation: justLanded
                  ? "jackpot-reel-land 0.45s ease-out"
                  : undefined,
                filter: stopped
                  ? "drop-shadow(0 0 12px rgba(179, 136, 255, 0.35))"
                  : undefined,
              }}
            >
              {spinning || stopped ? finalSymbol : "❓"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
