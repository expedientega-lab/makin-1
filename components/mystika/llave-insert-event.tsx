"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getTierInfo,
  pickLlavePremio,
  type LlavePremioKind,
  type LlaveTier,
} from "@/lib/llaves-data";
import {
  AurumCofreCrown,
  AurumInsertAtmosphere,
  AurumReadyKeyCard,
} from "./llave-insert-aurum-ui";

type Phase = "ready" | "inserting" | "unlocking" | "revealed";

const TIER_ACCENT: Record<LlaveTier, { main: string; glow: string }> = {
  1: { main: "#c97a3a", glow: "rgba(201,122,58,0.65)" },
  5: { main: "#b8c4e8", glow: "rgba(184,196,232,0.7)" },
  20: { main: "#ffd700", glow: "rgba(255,215,0,0.75)" },
};

/** Tiempo total de la barra 0 → 100 % */
const PROGRESS_MS = 4800;
/** Pausa en 100 % antes de mostrar el premio */
const REVEAL_PAUSE_MS = 550;
/** Cuándo pasa de “insertando” a “girando cerradura” */
const UNLOCK_PHASE_MS = 2200;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: 12 + ((i * 17) % 76),
  delay: (i * 0.11) % 1.2,
  dur: 0.9 + (i % 4) * 0.2,
}));

interface LlaveInsertEventProps {
  tier: LlaveTier;
  onConsume: () => void;
  onDone: () => void;
}

export function LlaveInsertEvent({
  tier,
  onConsume,
  onDone,
}: LlaveInsertEventProps) {
  const info = getTierInfo(tier);
  const accent = TIER_ACCENT[tier];
  const isAurum = tier === 20;
  const [phase, setPhase] = useState<Phase>("ready");
  const [resultKind, setResultKind] = useState<LlavePremioKind | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [burst, setBurst] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prev;
    };
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const isSequence = phase === "inserting" || phase === "unlocking";

  useEffect(() => {
    if (phase === "revealed") setProgress(100);
    else if (phase === "ready") setProgress(0);
  }, [phase]);

  useEffect(() => {
    if (!isSequence) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / PROGRESS_MS, 1);
      setProgress(Math.round(easeOutCubic(t) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setProgress(100);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isSequence]);

  const runInsert = useCallback(() => {
    if (phase !== "ready") return;
    clearTimers();
    setBurst((b) => b + 1);
    onConsume();
    setProgress(0);
    setPhase("inserting");

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase("unlocking");
        setBurst((b) => b + 1);
      }, UNLOCK_PHASE_MS),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        const { kind, text } = pickLlavePremio(tier);
        setResultKind(kind);
        setResultText(text);
        setBurst((b) => b + 1);
        setPhase("revealed");
      }, PROGRESS_MS + REVEAL_PAUSE_MS),
    );
  }, [phase, onConsume, tier, clearTimers]);

  const statusLine = useMemo(() => {
    switch (phase) {
      case "ready":
        return {
          text: isAurum
            ? "Ranura dorada energizada — lista para tu llave Aurum"
            : "Ranura energizada — lista para tu llave",
          color: accent.main,
        };
      case "inserting":
        return { text: "◆ INSERTANDO LLAVE ◆", color: "#ff6b9d" };
      case "unlocking":
        return { text: "◆ GIRANDO CERRADURA ASTRAL ◆", color: "#ffd700" };
      default:
        return { text: "", color: accent.main };
    }
  }, [phase, accent.main, isAurum]);

  return (
    <div
      className="fixed inset-0 z-[650] flex items-center justify-center overflow-y-auto p-4"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="llave-insert-title"
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, #08050f 0%, #0c0714 40%, #0a0612 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 38%, ${accent.glow} 0%, transparent 58%)`,
          opacity: isSequence ? 1 : 0.55,
        }}
        aria-hidden
      />

      {isAurum && <AurumInsertAtmosphere active={isSequence || phase === "revealed"} />}

      {isSequence && (
        <div
          key={burst}
          className="pointer-events-none fixed inset-0 llave-insert-flash"
          aria-hidden
        />
      )}

      <style>{`
        @keyframes llave-event-enter {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes llave-secuencia {
          0% { transform: translateY(88px) rotate(-35deg) scale(0.6); opacity: 0; filter: drop-shadow(0 0 0 transparent); }
          12% { opacity: 1; filter: drop-shadow(0 0 20px ${accent.glow}); }
          38% { transform: translateY(-14px) rotate(88deg) scale(1.12); }
          48% { transform: translateY(-10px) rotate(102deg) scale(1.1); }
          58% { transform: translateY(-14px) rotate(76deg) scale(1.1); }
          68% { transform: translateY(-10px) rotate(92deg) scale(1.1); }
          100% { transform: translateY(-11px) rotate(90deg) scale(1.1); opacity: 1; }
        }
        @keyframes llave-slot-pulse {
          0%, 100% { box-shadow: 0 0 12px ${accent.glow}, inset 0 0 8px rgba(0,0,0,0.8); transform: scale(1); }
          50% { box-shadow: 0 0 28px ${accent.glow}, 0 0 48px rgba(179,136,255,0.5), inset 0 0 12px rgba(255,215,0,0.15); transform: scale(1.08); }
        }
        @keyframes llave-beam {
          0% { opacity: 0; height: 0; }
          30% { opacity: 0.9; }
          100% { opacity: 0; height: 72px; }
        }
        @keyframes llave-lock-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes llave-burst-ring {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }
        @keyframes llave-spark-float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(-48px) scale(0.3); opacity: 0; }
        }
        @keyframes llave-cofre-shake {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          15% { transform: translate(-3px,2px) rotate(-0.4deg); }
          30% { transform: translate(3px,-2px) rotate(0.4deg); }
          45% { transform: translate(-2px,-3px) rotate(-0.3deg); }
          60% { transform: translate(2px,3px) rotate(0.3deg); }
        }
        @keyframes llave-insert-flash {
          0% { opacity: 0.55; }
          100% { opacity: 0; }
        }
        @keyframes llave-ready-glow {
          0%, 100% { filter: drop-shadow(0 0 10px ${accent.glow}); transform: translateY(0); }
          50% { filter: drop-shadow(0 0 26px ${accent.glow}); transform: translateY(-4px); }
        }
        @keyframes llave-scan {
          0% { top: 8%; opacity: 0; }
          20% { opacity: 0.85; }
          100% { top: 88%; opacity: 0; }
        }
        .llave-event-panel { animation: llave-event-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .llave-key-run { animation: llave-secuencia 2.8s cubic-bezier(0.33, 1, 0.68, 1) forwards; }
        .llave-slot-live { animation: llave-slot-pulse 0.85s ease-in-out infinite; }
        .llave-cofre-active { animation: llave-cofre-shake 0.35s ease-in-out infinite; }
        .llave-ready-key { animation: llave-ready-glow 1.2s ease-in-out infinite; }
        .llave-insert-flash {
          background: radial-gradient(circle at 50% 45%, ${accent.glow}, transparent 55%);
          animation: llave-insert-flash 0.55s ease-out forwards;
        }
      `}</style>

      <div
        className={[
          "relative w-full llave-event-panel",
          isAurum ? "max-w-[520px]" : "max-w-[420px]",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <div className="text-center mb-4">
          <h2
            id="llave-insert-title"
            className={[
              "font-display font-black tracking-[1px] text-[var(--txt)]",
              isAurum ? "text-[24px] sm:text-[30px]" : "text-[22px] sm:text-[26px]",
            ].join(" ")}
            style={
              isAurum
                ? {
                    textShadow:
                      "0 0 28px rgba(255,215,0,0.25), 0 0 48px rgba(179,136,255,0.12)",
                  }
                : undefined
            }
          >
            {phase === "revealed"
              ? isAurum
                ? "¡Cofre Aurum desbloqueado!"
                : "¡Cofre abierto!"
              : isSequence
                ? isAurum
                  ? "Activando cofre dorado…"
                  : "Activando mecanismo…"
                : isAurum
                  ? "Cofre Aurum — insertá tu llave"
                  : "Insertá tu llave en el cofre"}
          </h2>
          <p
            className={[
              "font-mono mt-2 px-2",
              isAurum ? "text-[11px] tracking-[0.2em] text-[#ffd700]" : "text-[12px] text-[var(--txt3)]",
            ].join(" ")}
          >
            {isAurum ? "LLAVE AURUM · USD 20 · EXPERIENCIA PREMIUM" : `${info.shortName} · USD ${tier}`}
          </p>
        </div>

        {phase === "ready" &&
          (isAurum ? (
            <AurumReadyKeyCard info={info} />
          ) : (
            <div className="flex justify-center mb-5">
              <div
                className="llave-ready-key flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2"
                style={{
                  borderColor: `${accent.main}88`,
                  background: `linear-gradient(145deg, ${accent.glow}, rgba(8,5,14,0.9))`,
                  boxShadow: `0 0 32px ${accent.glow}`,
                }}
              >
                <span className="text-[52px] leading-none">🔑</span>
                <span
                  className="font-mono text-[11px] font-black tracking-wider px-3 py-1 rounded-full"
                  style={{
                    background: info.keyColor,
                    boxShadow: info.keyShadow,
                    color: tier === 1 ? "#fff5eb" : "#0d0f14",
                  }}
                >
                  ${tier} USD
                </span>
              </div>
            </div>
          ))}

        {/* Barra de progreso */}
        {isSequence && (
          <div className="mb-4 px-1">
            <div className="flex justify-between mb-1.5 font-mono text-[10px] font-bold">
              <span style={{ color: accent.main }}>{isAurum ? "MECANISMO AURUM" : "MECANISMO"}</span>
              <span style={{ color: progress > 85 ? "#ffd700" : "#b388ff" }}>
                {progress}%
              </span>
            </div>
            <div
              className={isAurum ? "h-2.5 rounded-full overflow-hidden border" : "h-2 rounded-full overflow-hidden border"}
              style={{
                borderColor: isAurum ? "rgba(255,215,0,0.4)" : "rgba(179,136,255,0.3)",
                background: "rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  background: isAurum
                    ? "linear-gradient(90deg, #c9a227, #ffd700, #fff8dc, #ffd700)"
                    : `linear-gradient(90deg, #b388ff, ${accent.main}, #ffd700)`,
                  boxShadow: isAurum ? "0 0 16px rgba(255,215,0,0.65)" : `0 0 12px ${accent.glow}`,
                }}
              />
            </div>
          </div>
        )}

        {/* Cofre */}
        <div
          className={[
            "rounded-2xl border-2 p-5 sm:p-6 mb-5 relative overflow-hidden transition-all duration-300",
            isSequence ? "llave-cofre-active" : "",
            isAurum ? "border-[rgba(255,215,0,0.45)]" : "",
          ].join(" ")}
          style={{
            borderColor: isAurum
              ? isSequence
                ? "rgba(255,215,0,0.75)"
                : "rgba(255,215,0,0.45)"
              : isSequence
                ? `${accent.main}99`
                : "rgba(179,136,255,0.4)",
            background: isAurum
              ? "linear-gradient(165deg, rgba(42,32,12,0.95) 0%, rgba(14,10,24,0.98) 45%, rgba(8,5,16,1) 100%)"
              : "linear-gradient(165deg, rgba(22,14,38,0.98) 0%, rgba(8,5,16,1) 100%)",
            boxShadow: isAurum
              ? isSequence
                ? "0 0 56px rgba(255,215,0,0.35), 0 0 24px rgba(179,136,255,0.2), 0 16px 48px rgba(0,0,0,0.55)"
                : "0 0 36px rgba(255,215,0,0.18), 0 16px 48px rgba(0,0,0,0.55)"
              : isSequence
                ? `0 0 40px ${accent.glow}, 0 16px 48px rgba(0,0,0,0.55)`
                : "0 16px 48px rgba(0,0,0,0.55)",
          }}
        >
          {isAurum && <AurumCofreCrown />}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)",
            }}
          />
          {isSequence && (
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${accent.main}44, transparent, #b388ff55, transparent)`,
                animation: "llave-lock-spin 2.5s linear infinite",
              }}
              aria-hidden
            />
          )}

          <div className="relative z-[1]">
            <div
              className={[
                "relative rounded-xl mx-auto w-full overflow-hidden flex flex-col",
                phase === "revealed" ? "max-w-none" : isAurum ? "max-w-[340px]" : "max-w-[300px]",
              ].join(" ")}
              style={{
                minHeight: phase === "revealed" ? "min(340px, 52vw)" : "220px",
                background:
                  "linear-gradient(180deg, #2a2438 0%, #15101f 55%, #0d0a14 100%)",
                border: `1px solid ${isSequence || phase === "revealed" ? `${accent.main}66` : "rgba(120,100,160,0.4)"}`,
                boxShadow: "inset 0 8px 32px rgba(0,0,0,0.85)",
              }}
            >
              {phase !== "revealed" && (
                <div
                  className="shrink-0 pt-3 pb-2 px-3 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] text-center font-black border-b"
                  style={{
                    color: isSequence ? accent.main : "var(--mystik3)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {isAurum ? "COFRE AURUM — INSERCIÓN" : "COFRE DE INSERCIÓN"}
                </div>
              )}

              {phase === "revealed" && resultKind && resultText ? (
                <button
                  type="button"
                  onClick={onDone}
                  className="flex-1 flex flex-col items-center justify-center text-center w-full min-h-[300px] sm:min-h-[320px] mx-0 my-0 px-5 py-6 sm:px-7 sm:py-8 rounded-xl border-2 transition-all hover:brightness-105 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                  style={{
                    borderColor: "rgba(255,215,0,0.55)",
                    background:
                      "linear-gradient(160deg, rgba(255,215,0,0.1) 0%, rgba(12,8,22,0.98) 45%, rgba(8,5,14,1) 100%)",
                    boxShadow:
                      "inset 0 0 40px rgba(255,215,0,0.06), 0 0 28px rgba(255,215,0,0.12)",
                  }}
                >
                  <div
                    className="text-[56px] sm:text-[64px] leading-none mb-4 shrink-0 animate-[popin_0.45s_ease]"
                    style={{
                      filter:
                        resultKind === "galleta"
                          ? "drop-shadow(0 0 20px rgba(255,180,80,0.5))"
                          : "drop-shadow(0 0 20px rgba(179,136,255,0.5))",
                    }}
                  >
                    {resultKind === "galleta" ? "🥠" : "✨"}
                  </div>
                  <div className="font-mono text-[11px] sm:text-[12px] tracking-[0.28em] text-[var(--mystik3)] mb-4 shrink-0 font-black">
                    {resultKind === "galleta"
                      ? "GALLETA DE LA FORTUNA"
                      : "MENSAJE DEL UNIVERSO"}
                  </div>
                  <p
                    className="font-display font-bold text-[17px] sm:text-[19px] text-[var(--txt)] leading-[1.45] w-full max-w-[280px] mx-auto uppercase tracking-[0.04em] break-words px-1"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {resultText}
                  </p>
                  <span className="font-mono text-[10px] text-[var(--txt3)] mt-5 tracking-[0.12em]">
                    Tocá para volver a llaves
                  </span>
                </button>
              ) : (
                <div className="relative flex-1 min-h-[160px]">
              {/* Scan line */}
              {phase === "inserting" && (
                <div
                  className="absolute left-[8%] right-[8%] h-[3px] z-[5] pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accent.main}, #fff, ${accent.main}, transparent)`,
                    boxShadow: `0 0 14px ${accent.glow}`,
                    animation: "llave-scan 0.7s linear infinite",
                  }}
                  aria-hidden
                />
              )}

              {/* Partículas */}
              {isSequence &&
                SPARKS.map((s) => (
                  <div
                    key={`${burst}-${s.id}`}
                    className="absolute w-1.5 h-1.5 rounded-full z-[4] pointer-events-none"
                    style={{
                      left: `${s.left}%`,
                      bottom: "18%",
                      background: s.id % 2 === 0 ? accent.main : "#b388ff",
                      boxShadow: `0 0 8px ${accent.glow}`,
                      animation: `llave-spark-float ${s.dur}s ease-out infinite`,
                      animationDelay: `${s.delay}s`,
                    }}
                    aria-hidden
                  />
                ))}

              {/* Burst al girar */}
              {phase === "unlocking" && (
                <div
                  key={`ring-${burst}`}
                  className="absolute left-1/2 top-[40%] w-[40%] aspect-square rounded-full border-2 pointer-events-none z-[3]"
                  style={{
                    borderColor: accent.main,
                    animation: "llave-burst-ring 0.9s ease-out forwards",
                  }}
                  aria-hidden
                />
              )}

              <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 z-[2]">
                <div
                  className={[
                    "rounded-full mx-auto mb-2 transition-all",
                    phase === "ready" || isSequence ? "llave-slot-live" : "",
                  ].join(" ")}
                  style={{
                    width: "30px",
                    height: "30px",
                    background:
                      "radial-gradient(circle at 35% 30%, #2a2040 0%, #000 72%)",
                    border: `2px solid ${isSequence ? accent.main : "rgba(90,70,120,0.9)"}`,
                  }}
                />
                <div
                  className="h-3 w-[64px] mx-auto rounded-sm relative overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, #3a3548, #0a0810)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {phase === "inserting" && (
                    <div
                      className="absolute inset-0 opacity-80"
                      style={{
                        background: `linear-gradient(180deg, transparent, ${accent.main}, transparent)`,
                        animation: "llave-beam 0.6s ease-out infinite",
                      }}
                      aria-hidden
                    />
                  )}
                </div>
              </div>

              {isSequence && (
                <div
                  className="absolute left-1/2 top-[76%] -translate-x-1/2 w-16 h-16 flex items-center justify-center llave-key-run z-[6]"
                  aria-hidden
                >
                  <span
                    className="text-[48px] leading-none"
                    style={{ filter: `drop-shadow(0 0 16px ${accent.glow})` }}
                  >
                    🔑
                  </span>
                </div>
              )}

              <p
                className="absolute bottom-0 left-0 right-0 text-center text-[10px] sm:text-[11px] font-mono font-black px-3 py-2.5 z-[7] tracking-wide border-t"
                style={{
                  color: statusLine.color,
                  textShadow: isSequence ? `0 0 12px ${statusLine.color}` : undefined,
                  borderColor: "rgba(255,255,255,0.06)",
                  background: "rgba(0,0,0,0.35)",
                }}
              >
                {statusLine.text}
              </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {phase === "ready" && (
          <button
            type="button"
            onClick={runInsert}
            className={[
              "w-full rounded-xl font-mono font-black tracking-[2px] text-[var(--bg0)] transition-all hover:-translate-y-0.5 active:scale-[0.98]",
              isAurum ? "py-4 sm:py-[18px] text-[14px] sm:text-[16px]" : "py-4 text-[14px] sm:text-[15px]",
            ].join(" ")}
            style={
              isAurum
                ? {
                    background:
                      "linear-gradient(135deg, #ffe566 0%, #ffd700 35%, #c9a227 70%, #ffe566 100%)",
                    backgroundSize: "220% auto",
                    animation: "ctamove 2.2s linear infinite",
                    boxShadow:
                      "0 10px 0 rgba(0,0,0,0.45), 0 0 40px rgba(255,215,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
                  }
                : {
                    background: `linear-gradient(135deg, ${accent.main}, #ffdd55, ${accent.main})`,
                    backgroundSize: "200% auto",
                    animation: "ctamove 2.5s linear infinite",
                    boxShadow: `0 8px 0 rgba(0,0,0,0.45), 0 0 32px ${accent.glow}`,
                  }
            }
          >
            {isAurum ? "✦ METÉ LA LLAVE AURUM EN EL COFRE ✦" : "🔑 METÉ LA LLAVE EN EL COFRE"}
          </button>
        )}

        {isSequence && (
          <p
            className="text-center font-mono text-[11px] mt-4 font-bold animate-pulse"
            style={{ color: accent.main }}
          >
            ⚡ No cierres — el cofre está procesando tu llave
          </p>
        )}
      </div>
    </div>
  );
}
