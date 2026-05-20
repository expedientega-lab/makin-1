"use client";

import { useCallback, useState } from "react";
import {
  LLAVE_TIERS,
  pickLlavePremio,
  type LlavePremioKind,
  type LlaveTier,
  type LlavesStock,
  getTierInfo,
} from "@/lib/llaves-data";
import { DevTestButton } from "./dev-test-button";

interface LlavesSectionProps {
  llaveStock: LlavesStock;
  onConsumeLlave: (tier: LlaveTier) => void;
  onRequestPay: (
    productId: string,
    title: string,
    description: string,
    price: number,
  ) => void;
  devTestEnabled?: boolean;
  onDevGrantLlave?: (tier: LlaveTier) => void;
}

type Phase = "idle" | "inserting" | "unlocking" | "revealed";

export function LlavesSection({
  llaveStock,
  onConsumeLlave,
  onRequestPay,
  devTestEnabled,
  onDevGrantLlave,
}: LlavesSectionProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [usingTier, setUsingTier] = useState<LlaveTier | null>(null);
  const [resultKind, setResultKind] = useState<LlavePremioKind | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  const resetVault = useCallback(() => {
    setPhase("idle");
    setUsingTier(null);
    setResultKind(null);
    setResultText(null);
  }, []);

  const startInsert = (tier: LlaveTier) => {
    if (phase !== "idle" || llaveStock[tier] <= 0) return;
    onConsumeLlave(tier);
    setUsingTier(tier);
    setPhase("inserting");
    window.setTimeout(() => setPhase("unlocking"), 950);
    window.setTimeout(() => {
      const { kind, text } = pickLlavePremio(tier);
      setResultKind(kind);
      setResultText(text);
      setPhase("revealed");
    }, 2100);
  };

  const isSequence = phase === "inserting" || phase === "unlocking";
  const awaitingDismiss = phase === "revealed";

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      <style>{`
        @keyframes llave-secuencia {
          0% { transform: translateY(52px) rotate(-22deg) scale(0.82); opacity: 0; }
          18% { opacity: 1; }
          42% { transform: translateY(-8px) rotate(90deg) scale(1); }
          52% { transform: translateY(-6px) rotate(104deg) scale(1); }
          62% { transform: translateY(-9px) rotate(78deg) scale(1); }
          72% { transform: translateY(-6px) rotate(94deg) scale(1); }
          100% { transform: translateY(-7px) rotate(90deg) scale(1); opacity: 1; }
        }
        @keyframes cofre-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(179,136,255,0.35), inset 0 0 40px rgba(0,0,0,0.65); }
          50% { box-shadow: 0 0 32px 8px rgba(179,136,255,0.45), inset 0 0 50px rgba(90,40,140,0.35); }
        }
        @keyframes slot-rumble {
          0%, 100% { transform: translate(0,0); }
          20% { transform: translate(-1px,1px); }
          40% { transform: translate(1px,-1px); }
          60% { transform: translate(-1px,-1px); }
          80% { transform: translate(1px,1px); }
        }
        .llave-key-run {
          animation: llave-secuencia 2.05s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }
        .llave-cofre-rumble {
          animation: slot-rumble 0.12s linear infinite;
        }
        .llave-cofre-glow {
          animation: cofre-pulse 1.1s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center py-1.5 pb-[18px]">
        <div className="font-mono text-[13px] sm:text-[14px] tracking-[4px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          LLAVES CÓSMICAS
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-2.5"
          style={{ fontSize: "clamp(38px,9vw,60px)" }}
        >
          Comprá tu <span className="text-[var(--mystik)]">llave</span>, metela
          en el cofre
        </h2>
      </div>

      {devTestEnabled && onDevGrantLlave && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {LLAVE_TIERS.map((t) => (
            <DevTestButton
              key={t.tier}
              label={`PROBAR +llave $${t.priceUSD}`}
              onClick={() => onDevGrantLlave(t.tier)}
            />
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {LLAVE_TIERS.map((t) => (
          <div
            key={t.tier}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 flex flex-col items-stretch text-center"
          >
            <div
              className="text-[14px] sm:text-[15px] font-mono tracking-[2px] text-[var(--mystik3)] mb-1"
            >
              {t.shortName.toUpperCase()}
            </div>
            <div className="font-display font-black text-[32px] sm:text-[34px] text-[var(--txt)] mb-0.5">
              ${t.priceUSD}
            </div>
            <div className="text-[14px] sm:text-[15px] text-[var(--gold3)] font-mono mb-2">
              Cofre simbólico hasta USD {t.advertisedUSD}
            </div>
            <p className="text-[16px] sm:text-[17px] text-[var(--txt3)] leading-relaxed mb-3 flex-1">
              {t.description}
            </p>
            <button
              type="button"
              disabled={isSequence}
              onClick={() =>
                onRequestPay(
                  t.productId,
                  `LLAVE CÓSMICA — ${t.shortName}`,
                  `Comprás la llave de USD ${t.priceUSD}. Después la metés en el cofre y recibís una galleta de la fortuna digital o un mensaje positivo del universo.`,
                  t.priceUSD,
                )
              }
              className="w-full py-3 rounded-lg font-mono text-[14px] sm:text-[15px] tracking-[1.5px] text-[var(--bg0)] transition-all disabled:opacity-45"
              style={{
                background:
                  "linear-gradient(135deg,var(--mystik3),var(--mystik))",
              }}
            >
              COMPRAR — ${t.priceUSD}
            </button>
            {llaveStock[t.tier] > 0 && (
              <div className="mt-2 text-[13px] font-mono text-[var(--green)]">
                Tenés {llaveStock[t.tier]} en el bolsillo astral
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cofre / cerradura */}
      <div
        className={[
          "rounded-2xl border-2 p-6 sm:p-8 mb-5 relative overflow-hidden",
          phase === "unlocking" ? "llave-cofre-rumble llave-cofre-glow" : "",
        ].join(" ")}
        style={{
          borderColor: "rgba(179,136,255,0.35)",
          background:
            "linear-gradient(165deg, rgba(22,14,38,0.95) 0%, rgba(8,5,16,0.98) 45%, rgba(12,8,22,1) 100%)",
          boxShadow:
            phase === "unlocking"
              ? undefined
              : "inset 0 2px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 3px)",
          }}
        />

        <div className="relative z-[1] text-center">
          <div className="font-mono text-[13px] sm:text-[14px] tracking-[3px] text-[var(--mystik3)] mb-3">
            COFRE DE INSERCIÓN — LLAVE FÍSICA SIMULADA
          </div>

          <div className="mx-auto max-w-[280px] mb-5">
            <div
              className="relative rounded-xl mx-auto"
              style={{
                height: "188px",
                background:
                  "linear-gradient(180deg, #2a2438 0%, #15101f 55%, #0d0a14 100%)",
                border: "1px solid rgba(120,100,160,0.35)",
                boxShadow: "inset 0 8px 24px rgba(0,0,0,0.75)",
              }}
            >
              {/* Ranura + ojo de cerradura */}
              <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
                <div
                  className="rounded-full mx-auto mb-2"
                  style={{
                    width: "22px",
                    height: "22px",
                    background:
                      "radial-gradient(circle at 35% 30%, #1a1525 0%, #000 70%)",
                    border: "2px solid rgba(90,70,120,0.8)",
                    boxShadow:
                      "inset 0 0 12px #000, 0 0 8px rgba(179,136,255,0.25)",
                  }}
                />
                <div
                  className="h-2 w-[52px] mx-auto rounded-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, #3a3548, #0a0810)",
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.12)",
                  }}
                />
              </div>

              {/* Llave animada */}
              {isSequence && usingTier !== null && (
                  <div
                    className="absolute left-1/2 top-[78%] -translate-x-1/2 w-14 h-14 flex items-center justify-center llave-key-run"
                    aria-hidden
                  >
                    <span
                      className="text-[40px] leading-none block origin-center"
                      style={{
                        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))",
                      }}
                    >
                      🔑
                    </span>
                  </div>
                )}

              {phase === "idle" && (
                <div className="absolute bottom-3 left-0 right-0 text-[13px] sm:text-[14px] font-mono text-[var(--txt3)] px-2 leading-snug">
                  Meté la llave en la ranura inferior. El mecanismo solo acepta
                  llaves pagadas.
                </div>
              )}
              {phase === "unlocking" && (
                <div className="absolute bottom-3 left-0 right-0 text-[13px] sm:text-[14px] font-mono text-[var(--mystik)] animate-pulse leading-snug">
                  Girando tumblers astrales…
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {LLAVE_TIERS.map((t) => {
              const n = llaveStock[t.tier];
              const disabled = isSequence || awaitingDismiss || n <= 0;
              return (
                <button
                  key={t.tier}
                  type="button"
                  disabled={disabled}
                  onClick={() => startInsert(t.tier)}
                  className="px-5 py-3 rounded-lg font-mono text-[14px] sm:text-[15px] tracking-[1px] border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    borderColor: "rgba(179,136,255,0.35)",
                    background: disabled
                      ? "rgba(179,136,255,0.04)"
                      : "rgba(179,136,255,0.12)",
                    color: "var(--txt)",
                  }}
                >
                  Meter llave ${t.priceUSD}
                  {n > 0 ? ` (${n})` : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {phase === "revealed" &&
        resultKind &&
        resultText &&
        usingTier !== null && (
          <div
            className="rounded-xl border p-6 text-center mb-4"
            style={{
              borderColor: "rgba(255,215,0,0.35)",
              background:
                "linear-gradient(135deg, rgba(255,215,0,0.08), var(--bg2))",
            }}
          >
            <div className="text-4xl mb-2">
              {resultKind === "galleta" ? "🥠" : "✨"}
            </div>
            <div className="font-mono text-[13px] sm:text-[14px] tracking-[2px] text-[var(--mystik3)] mb-1">
              {resultKind === "galleta"
                ? "GALLETA DE LA FORTUNA"
                : "MENSAJE DEL UNIVERSO"}
            </div>
            <div className="font-display text-[24px] sm:text-[26px] font-black text-[var(--txt)] mb-2">
              {getTierInfo(usingTier).shortName} · USD {usingTier}
            </div>
            <p className="text-[17px] sm:text-[18px] text-[var(--txt2)] leading-relaxed max-w-[520px] mx-auto mb-4">
              {resultText}
            </p>
            <p className="text-[14px] sm:text-[15px] text-[var(--txt3)] font-mono mb-4">
              Sin transferencias bancarias ni premios en efectivo: solo este
              mensaje, con intención positiva.
            </p>
            <button
              type="button"
              onClick={resetVault}
              className="px-6 py-3 rounded-lg font-mono text-[14px] sm:text-[15px] tracking-[2px]"
              style={{
                color: "var(--bg0)",
                background:
                  "linear-gradient(135deg,var(--gold),#ffdd55)",
              }}
            >
              VOLVER AL COFRE
            </button>
          </div>
        )}
    </div>
  );
}
