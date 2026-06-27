"use client";

import { useEffect, useState } from "react";
import { OrbSearchGame } from "./orb-search-game";
import { OrbMarqueeLights } from "./orb-marquee-lights";
import { OrbLiveFeed } from "./orb-live-feed";
import { OrbSideRail, OrbLedBar } from "./orb-side-rail";
import type { OrbePrizeType } from "@/lib/orbe-data";

interface OrbCasinoStageProps {
  onSpinComplete: (prizeType: OrbePrizeType) => void;
  onExit?: () => void;
}

const PRIZES = [
  { icon: "💵", label: "1 mil", accent: "#ffd700" },
  { icon: "🔮", label: "100", accent: "#b388ff" },
  { icon: "💜", label: "50", accent: "#ff6b9d" },
  { icon: "🥠", label: "Galleta", accent: "#00ff9d" },
];

export function OrbCasinoStage({ onSpinComplete, onExit }: OrbCasinoStageProps) {
  const [entered, setEntered] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hunting, setHunting] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t1 = requestAnimationFrame(() => setEntered(true));
    const t2 = window.setTimeout(() => setShowContent(true), 400);
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(t1);
      clearTimeout(t2);
    };
  }, []);

  const rail = { active: true, frantic: hunting } as const;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center overflow-y-auto overflow-x-hidden"
      style={{
        padding:
          "max(0.75rem, env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right)) max(0.75rem, env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left))",
        minHeight: "100dvh",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, #06040c 0%, #0c0714 38%, #0a0612 100%)",
        }}
        aria-hidden
      />
      <style>{`
        @keyframes orb-casino-enter {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes orb-casino-flash {
          0%, 100% { opacity: 0; }
          45% { opacity: 0.35; }
        }
        @keyframes casino-top-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes orb-header-neon-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .orb-casino-enter { animation: orb-casino-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .orb-casino-flash { animation: orb-casino-flash 0.65s ease-out forwards; }
        .casino-title-main {
          color: #fff9eb;
          -webkit-text-stroke: 1px rgba(20, 10, 5, 0.85);
          paint-order: stroke fill;
          text-shadow:
            0 2px 0 rgba(0, 0, 0, 0.9),
            0 4px 12px rgba(0, 0, 0, 0.75),
            0 0 28px rgba(255, 215, 0, 0.35);
        }
        .casino-title-accent {
          color: #ffd700;
          -webkit-text-stroke: 1px rgba(20, 10, 5, 0.8);
          text-shadow:
            0 2px 0 rgba(0, 0, 0, 0.85),
            0 0 20px rgba(255, 215, 0, 0.4);
        }
        .casino-title-badge {
          color: #ffe566;
          text-shadow: 0 0 12px rgba(255, 215, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.8);
        }
      `}</style>

      {showContent && (
        <div className="pointer-events-none fixed top-[5%] left-0 right-0 h-[3px] overflow-hidden z-0">
          <div
            className="h-full w-[40%]"
            style={{
              background:
                "linear-gradient(90deg, transparent, #ffd700, #b388ff, #00e5ff, transparent)",
              boxShadow: "0 0 16px rgba(255,215,0,0.6)",
              animation: `casino-top-scan ${hunting ? "0.85s" : "2s"} linear infinite`,
            }}
          />
        </div>
      )}

      {!showContent && (
        <div
          className="pointer-events-none fixed inset-0 orb-casino-flash"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(255,215,0,0.3), rgba(179,136,255,0.25), transparent 55%)",
          }}
        />
      )}

      <div
        className={[
          "relative z-10 w-full max-w-[min(720px,100%)] mx-auto flex flex-col gap-2 sm:gap-3",
          entered ? "orb-casino-enter" : "opacity-0",
        ].join(" ")}
      >
        <header className="relative z-20 text-center mx-auto w-full max-w-[480px]">
          <div
            className="relative overflow-hidden rounded-2xl px-4 py-4 sm:py-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,9,24,0.98) 0%, rgba(6,4,12,0.99) 100%)",
              border: "1px solid rgba(255,215,0,0.35)",
              boxShadow:
                "0 0 32px rgba(255,215,0,0.12), 0 0 48px rgba(179,136,255,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background: `
                  radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,215,0,0.12) 0%, transparent 55%),
                  radial-gradient(ellipse 80% 50% at 50% 100%, rgba(179,136,255,0.08) 0%, transparent 50%)
                `,
                animation: "orb-header-neon-pulse 3s ease-in-out infinite",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-[10%] top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #ffd700, #b388ff, transparent)",
                boxShadow: "0 0 10px rgba(255,215,0,0.5)",
              }}
              aria-hidden
            />

            <div className="relative z-[1]">
              <p className="font-mono font-bold text-[10px] sm:text-[11px] tracking-[0.3em] mb-2.5 casino-title-badge">
                ★ PORTAL ENCENDIDO ★
              </p>
              <h2
                className="font-display font-black leading-[1.15] casino-title-main"
                style={{
                  fontSize: "clamp(22px, 5.5vw, 30px)",
                  letterSpacing: "0.04em",
                }}
              >
                BUSCÁ TU PREMIO
              </h2>
              <p
                className="font-display font-black mt-1 casino-title-accent"
                style={{
                  fontSize: "clamp(17px, 4vw, 22px)",
                  letterSpacing: "0.08em",
                }}
              >
                ADENTRO DEL ORBE
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-3 sm:mt-3.5">
                {PRIZES.map((p) => (
                  <span
                    key={p.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-black text-[11px] sm:text-[12px] tracking-wide border transition-transform hover:scale-[1.03]"
                    style={{
                      borderColor: `${p.accent}66`,
                      background: `linear-gradient(180deg, ${p.accent}22, rgba(8,5,14,0.92))`,
                      color: p.accent,
                      boxShadow: `0 0 16px ${p.accent}44, inset 0 1px 0 rgba(255,255,255,0.12)`,
                    }}
                  >
                    <span className="text-sm">{p.icon}</span>
                    {p.label}
                  </span>
                ))}
              </div>

              <OrbLiveFeed adaptive className="mt-3 sm:mt-3.5" />
            </div>
          </div>
        </header>

        {showContent && (
          <div className="relative py-2">
            <div className="relative flex items-center justify-center">
              <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-3 w-full max-w-[540px] mx-auto flex-1 min-w-0">
                <OrbSideRail side="left" {...rail} />

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <OrbLedBar position="top" {...rail} />

                  <OrbMarqueeLights
                    active
                    premium
                    hideBulbs
                    frantic={hunting}
                    className="w-full"
                  >
                    <div
                      className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-300 overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(165deg, rgba(36,20,58,0.97) 0%, rgba(8,5,14,0.99) 48%, rgba(24,14,42,0.97) 100%)",
                        border: hunting
                          ? "2px solid rgba(255,215,0,0.65)"
                          : "2px solid rgba(255,215,0,0.38)",
                        boxShadow: hunting
                          ? "0 0 56px rgba(255,215,0,0.28), 0 0 40px rgba(179,136,255,0.3), inset 0 0 50px rgba(0,0,0,0.35)"
                          : "0 0 36px rgba(179,136,255,0.2), 0 0 24px rgba(255,215,0,0.1), inset 0 0 40px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div
                        className="absolute top-0 left-3 right-3 h-[3px] rounded-full pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,215,0,0.85), rgba(0,229,255,0.6), transparent)",
                          boxShadow: "0 0 12px rgba(255,215,0,0.5)",
                        }}
                        aria-hidden
                      />
                      <OrbSearchGame
                        onComplete={onSpinComplete}
                        onPhaseChange={(p) => setHunting(p === "searching")}
                      />
                    </div>
                  </OrbMarqueeLights>

                  <OrbLedBar position="bottom" {...rail} />
                </div>

                <OrbSideRail side="right" {...rail} />
              </div>
            </div>
          </div>
        )}

        {onExit && showContent && (
          <button
            type="button"
            onClick={onExit}
            className="mx-auto mt-1 font-mono text-[11px] tracking-[0.2em] text-[var(--txt3)] hover:text-[var(--gold)] transition-colors"
          >
            ← Salir
          </button>
        )}
      </div>
    </div>
  );
}
