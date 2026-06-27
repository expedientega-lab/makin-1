"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ORBE_PRIZE_INFO,
  ORBE_SEARCH_GHOSTS,
  pickOrbePrizeType,
  type OrbePrizeType,
} from "@/lib/orbe-data";

type Phase = "idle" | "searching" | "emerging" | "done";

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  angle: (i / 14) * 360,
  dist: 42 + (i % 3) * 8,
  delay: i * 0.12,
  color: ["#b388ff", "#ffd700", "#ff6b9d", "#00ff9d", "#00e5ff"][i % 5],
}));

interface OrbSearchGameProps {
  onComplete: (prizeType: OrbePrizeType) => void;
  onPhaseChange?: (phase: Phase) => void;
}

export function OrbSearchGame({ onComplete, onPhaseChange }: OrbSearchGameProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [prizeType, setPrizeType] = useState<OrbePrizeType | null>(null);
  const [ghostIdx, setGhostIdx] = useState(0);
  const [scanPct, setScanPct] = useState(0);
  const [statusText, setStatusText] = useState("El portal espera tu jugada");
  const [flash, setFlash] = useState(false);
  const prizeRef = useRef<OrbePrizeType | null>(null);

  const isSearching = phase === "searching";
  const isEmerging = phase === "emerging" || phase === "done";

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (!isSearching) return;
    const ms = Math.max(70, 220 - scanPct * 1.5);
    const ghostTimer = window.setInterval(() => {
      setGhostIdx((i) => (i + 1) % ORBE_SEARCH_GHOSTS.length);
    }, ms);
    return () => clearInterval(ghostTimer);
  }, [isSearching, scanPct]);

  const startSearch = useCallback(() => {
    if (phase !== "idle") return;
    const won = pickOrbePrizeType();
    prizeRef.current = won;
    setPrizeType(won);
    setPhase("searching");
    setScanPct(0);
    setFlash(false);
    setStatusText("🔮 Conectando con el portal…");

    const start = Date.now();
    const duration = 3400;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const pct = Math.round(p * 100);
      setScanPct(pct);
      if (p < 0.2) setStatusText("⚡ Escaneando el orbe…");
      else if (p < 0.45) setStatusText("✨ Energías en movimiento…");
      else if (p < 0.72) setStatusText("🌟 Algo brilla adentro…");
      else if (p < 0.92) setStatusText("🎯 ¡Casi lo tenés!");
      else setStatusText("🎉 ¡PREMIO DETECTADO!");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    window.setTimeout(() => {
      setFlash(true);
      setPhase("emerging");
    }, duration);
    window.setTimeout(() => {
      setPhase("done");
      if (prizeRef.current) onComplete(prizeRef.current);
    }, duration + 1600);
  }, [phase, onComplete]);

  const info = prizeType ? ORBE_PRIZE_INFO[prizeType] : null;
  const showPrize = isEmerging && info !== null;
  const ghostIcon = ORBE_SEARCH_GHOSTS[ghostIdx];
  const ghostPrev = ORBE_SEARCH_GHOSTS[(ghostIdx + 3) % ORBE_SEARCH_GHOSTS.length];

  return (
    <div
      className={[
        "flex flex-col items-center w-full relative",
        isSearching ? "orb-search-active" : "",
        isEmerging ? "orb-search-win" : "",
      ].join(" ")}
    >
      <style>{`
        @keyframes orb-idle-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 32px rgba(179,136,255,0.35), 0 0 48px rgba(255,215,0,0.12); }
          50% { transform: scale(1.04); box-shadow: 0 0 48px rgba(179,136,255,0.5), 0 0 64px rgba(255,215,0,0.2); }
        }
        @keyframes orb-btn-neon {
          0%, 100% { box-shadow: 0 6px 0 #5a4200, 0 12px 36px rgba(255,215,0,0.4), 0 0 32px rgba(255,215,0,0.3), inset 0 2px 0 rgba(255,255,255,0.45); }
          50% { box-shadow: 0 6px 0 #5a4200, 0 14px 44px rgba(255,215,0,0.55), 0 0 48px rgba(255,215,0,0.4), inset 0 2px 0 rgba(255,255,255,0.55); }
        }
        @keyframes orb-hunt-shake {
          0%, 100% { transform: translate(0,0) scale(1); }
          15% { transform: translate(-2px,1px) scale(1.02); }
          30% { transform: translate(2px,-2px) scale(1.03); }
          45% { transform: translate(-1px,-1px) scale(1.02); }
          60% { transform: translate(2px,1px) scale(1.04); }
          75% { transform: translate(-2px,2px) scale(1.03); }
        }
        @keyframes orb-ring-pulse {
          0% { transform: scale(0.92); opacity: 0.7; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        @keyframes orb-mist-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orb-mist-spin-rev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes orb-scan-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orb-ghost-pop {
          0% { opacity: 0.1; transform: translate(-50%,-50%) scale(0.5); }
          40% { opacity: 0.9; transform: translate(-50%,-50%) scale(1.15); }
          100% { opacity: 0.2; transform: translate(-50%,-50%) scale(0.7); }
        }
        @keyframes orb-prize-burst {
          0% { transform: scale(0); opacity: 0; filter: blur(12px); }
          40% { transform: scale(1.25); opacity: 1; filter: blur(0); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes orb-rays {
          from { transform: rotate(0deg); opacity: 0.4; }
          to { transform: rotate(360deg); opacity: 0.7; }
        }
        @keyframes orb-particle-orbit {
          0% { transform: rotate(var(--a)) translateX(var(--d)) rotate(calc(-1 * var(--a))); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: rotate(calc(var(--a) + 180deg)) translateX(var(--d)) rotate(calc(-1 * var(--a) - 180deg)); opacity: 0.3; }
        }
        @keyframes orb-bar-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes orb-flash-overlay {
          0% { opacity: 0; }
          30% { opacity: 0.55; }
          100% { opacity: 0; }
        }
        @keyframes orb-status-glow {
          0%, 100% { text-shadow: 0 0 8px rgba(179,136,255,0.4); }
          50% { text-shadow: 0 0 18px rgba(255,215,0,0.7), 0 0 28px rgba(179,136,255,0.5); }
        }
        @keyframes orb-neon-ring {
          0%, 100% { opacity: 0.65; box-shadow: 0 0 20px rgba(255,215,0,0.35), 0 0 40px rgba(179,136,255,0.25); }
          50% { opacity: 1; box-shadow: 0 0 32px rgba(255,215,0,0.55), 0 0 56px rgba(179,136,255,0.35); }
        }
        .orb-idle-glow { animation: orb-idle-breathe 2.5s ease-in-out infinite; }
        .orb-hunt-shake { animation: orb-hunt-shake 0.35s ease-in-out infinite; }
        .orb-search-active .orb-status-line {
          animation: orb-status-glow 0.6s ease-in-out infinite;
          color: var(--gold) !important;
          font-weight: 700;
        }
        .orb-neon-ring {
          animation: orb-neon-ring 2.2s ease-in-out infinite;
        }
        .orb-casino-label {
          text-shadow: 0 0 10px rgba(179,136,255,0.8), 0 0 20px rgba(255,215,0,0.35);
        }
        .orb-slot-btn {
          text-shadow: 0 1px 0 rgba(0,0,0,0.5);
        }
      `}</style>

      {flash && (
        <div
          className="pointer-events-none fixed inset-0 z-[600]"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,215,0,0.35), rgba(179,136,255,0.2), transparent 65%)",
            animation: "orb-flash-overlay 0.7s ease-out forwards",
          }}
        />
      )}

      <div
        className="relative flex items-center justify-center w-full max-w-[min(280px,78vw)] aspect-square mx-auto"
      >
        {/* Anillo neón casino */}
        <div
          className="absolute inset-[-3%] rounded-full pointer-events-none orb-neon-ring border-[3px]"
          style={{
            borderColor: isSearching
              ? "rgba(255,215,0,0.65)"
              : "rgba(255,215,0,0.4)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-[-6%] rounded-full pointer-events-none border opacity-40"
          style={{ borderColor: "rgba(179,136,255,0.35)" }}
          aria-hidden
        />
        {/* Anillos de pulso al buscar */}
        {isSearching &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full pointer-events-none border-2"
              style={{
                borderColor: "rgba(179,136,255,0.5)",
                animation: `orb-ring-pulse 1.4s ease-out infinite`,
                animationDelay: `${i * 0.45}s`,
              }}
            />
          ))}

        {/* Partículas orbitando */}
        {(isSearching || isEmerging) &&
          PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full pointer-events-none"
              style={{
                marginLeft: -4,
                marginTop: -4,
                background: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                ["--a" as string]: `${p.angle}deg`,
                ["--d" as string]: `${p.dist}%`,
                animation: `orb-particle-orbit ${1.2 + p.delay}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}

        <button
          type="button"
          disabled={phase !== "idle"}
          onClick={startSearch}
          className={[
            "relative rounded-full border-0 p-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]",
            "w-[82%] h-[82%] max-w-none",
            phase === "idle" ? "cursor-pointer orb-idle-glow" : "cursor-default",
            isSearching ? "orb-hunt-shake" : "",
          ].join(" ")}
          aria-label="Buscar premio dentro del orbe"
        >
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: isSearching
                ? "radial-gradient(circle at 40% 30%, rgba(255,215,0,0.35), rgba(179,136,255,0.55) 35%, rgba(40,20,80,0.8) 60%, rgba(5,3,12,0.98))"
                : isEmerging
                  ? `radial-gradient(circle at 50% 50%, ${info?.glow ?? "rgba(179,136,255,0.5)"}, rgba(8,5,16,0.95) 65%)`
                  : "radial-gradient(circle at 35% 28%, rgba(179,136,255,0.45), rgba(60,30,100,0.5) 42%, rgba(8,5,16,0.95) 72%)",
              boxShadow: isSearching
                ? "0 0 60px rgba(179,136,255,0.7), 0 0 100px rgba(255,215,0,0.25), inset 0 0 60px rgba(90,50,140,0.5)"
                : isEmerging
                  ? `0 0 70px ${info?.glow ?? "rgba(179,136,255,0.6)"}, inset 0 0 40px rgba(255,255,255,0.08)`
                  : "0 0 28px rgba(179,136,255,0.3), inset 0 0 40px rgba(0,0,0,0.6)",
              border: `2px solid ${isEmerging ? (info?.color ?? "#b388ff") : "rgba(179,136,255,0.5)"}`,
            }}
          />

          <div
            className="absolute inset-[7%] rounded-full overflow-hidden"
            style={{ background: "rgba(3,2,8,0.65)" }}
          >
            {isSearching && (
              <>
                <div
                  className="absolute inset-[-30%] opacity-60"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, rgba(179,136,255,0.5), transparent, rgba(255,215,0,0.4), transparent, rgba(255,107,157,0.35), transparent)",
                    animation: "orb-mist-spin 1.4s linear infinite",
                  }}
                />
                <div
                  className="absolute inset-[-15%] opacity-35"
                  style={{
                    background:
                      "conic-gradient(from 180deg, transparent, rgba(0,229,255,0.35), transparent)",
                    animation: "orb-mist-spin-rev 2s linear infinite",
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 w-full h-[4px] -ml-[50%] -mt-0.5 origin-center"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.95) 50%, transparent 95%)",
                    animation: "orb-scan-sweep 0.65s linear infinite",
                    boxShadow: "0 0 12px rgba(179,136,255,0.9)",
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 text-[48px] select-none pointer-events-none"
                  style={{
                    animation: "orb-ghost-pop 0.28s ease-out infinite",
                  }}
                >
                  {ghostIcon}
                </div>
                <div
                  className="absolute left-[30%] top-[38%] text-[28px] opacity-40 select-none pointer-events-none blur-[1px]"
                  style={{ animation: "orb-ghost-pop 0.4s ease-out infinite reverse" }}
                >
                  {ghostPrev}
                </div>
                <div
                  className="absolute left-[62%] top-[55%] text-[22px] opacity-30 select-none pointer-events-none"
                  style={{
                    animation: "orb-ghost-pop 0.35s ease-out infinite",
                    animationDelay: "0.1s",
                  }}
                >
                  {ORBE_SEARCH_GHOSTS[(ghostIdx + 5) % ORBE_SEARCH_GHOSTS.length]}
                </div>
              </>
            )}

            {showPrize && info && (
              <>
                <div
                  className="absolute inset-[-20%] opacity-50 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${info.color}88, transparent, ${info.color}55, transparent)`,
                    animation: "orb-rays 3s linear infinite",
                  }}
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{
                    animation:
                      "orb-prize-burst 0.9s cubic-bezier(0.34,1.5,0.64,1) forwards",
                  }}
                >
                  <span
                    className="text-[58px] sm:text-[64px] leading-none"
                    style={{
                      filter: `drop-shadow(0 0 28px ${info.glow}) drop-shadow(0 0 50px ${info.glow})`,
                    }}
                  >
                    {info.icon}
                  </span>
                  <span
                    className="font-display font-black mt-2 tracking-[1px] text-center px-2"
                    style={{
                      fontSize: "clamp(12px, 3.2vw, 15px)",
                      color: info.color,
                      textShadow: `0 0 16px ${info.glow}`,
                    }}
                  >
                    {info.label.toUpperCase()}
                  </span>
                </div>
              </>
            )}

            {phase === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                <span
                  className="text-[32px] sm:text-[36px] leading-none"
                  style={{ filter: "drop-shadow(0 0 12px rgba(179,136,255,0.8))" }}
                >
                  🔮
                </span>
                <span
                  className="font-display font-black tracking-[0.2em] text-[#ffd700] orb-casino-label"
                  style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
                >
                  MIRÁ ADENTRO
                </span>
              </div>
            )}
          </div>
        </button>
      </div>

      {(isSearching || isEmerging) && (
        <div className="w-full max-w-[min(280px,92%)] mt-4 sm:mt-5 px-1">
          <div className="flex justify-between mb-1.5 font-mono text-[11px] font-bold">
            <span style={{ color: "rgba(255,215,0,0.85)" }}>◆ ESCANEO</span>
            <span
              className="font-bold tabular-nums"
              style={{
                color: scanPct > 85 ? "var(--gold)" : "var(--mystik)",
              }}
            >
              {phase === "emerging" ? 100 : scanPct}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full bg-[var(--bg3)] overflow-hidden border relative"
            style={{ borderColor: "rgba(179,136,255,0.35)" }}
          >
            <div
              className="h-full rounded-full relative overflow-hidden transition-[width] duration-100"
              style={{
                width: `${phase === "emerging" ? 100 : scanPct}%`,
                background:
                  scanPct > 80
                    ? "linear-gradient(90deg, #ffdd55, var(--gold), #ff6b9d)"
                    : "linear-gradient(90deg, var(--mystik3), var(--mystik), #d4b8ff)",
                boxShadow: "0 0 14px rgba(179,136,255,0.6)",
              }}
            >
              {isSearching && (
                <div
                  className="absolute inset-0 w-1/2 h-full opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                    animation: "orb-bar-shine 0.9s ease-in-out infinite",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <p
        className={[
          "orb-status-line text-center mt-3 min-h-[1.4em] px-2 font-mono font-bold",
          isSearching ? "text-[#ffd700]" : "text-[var(--txt2)]",
        ].join(" ")}
        style={{
          fontSize: "clamp(13px, 3.4vw, 15px)",
          letterSpacing: "0.06em",
          textShadow: isSearching
            ? "0 0 12px rgba(255,215,0,0.7)"
            : "0 0 8px rgba(179,136,255,0.25)",
        }}
      >
        {statusText}
      </p>

      {phase === "idle" && (
        <button
          type="button"
          onClick={startSearch}
          className="orb-slot-btn mt-4 w-full max-w-[min(300px,100%)] py-3.5 sm:py-4 rounded-xl font-display font-black tracking-[0.15em] text-[#1a0a00] relative overflow-hidden touch-manipulation active:translate-y-[3px] active:shadow-none transition-transform"
          style={{
            fontSize: "clamp(15px, 4.2vw, 18px)",
            background:
              "linear-gradient(180deg, #fff8c8 0%, #ffd700 32%, #e6b800 68%, #9a7500 100%)",
            animation: "orb-btn-neon 2s ease-in-out infinite",
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span aria-hidden className="text-lg">🎰</span>
            BUSCAR EN EL ORBE
          </span>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
              animation: "orb-bar-shine 2s ease-in-out infinite",
            }}
          />
        </button>
      )}

      {phase === "done" && (
        <p
          className="mt-2 font-mono font-bold text-[var(--gold)] animate-pulse"
          style={{ fontSize: "clamp(13px, 3.2vw, 15px)" }}
        >
          🎁 Abriendo tu premio…
        </p>
      )}
    </div>
  );
}
