"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BOTON_RAPIDO_ACTIVE_WINDOW_MS,
  BOTON_RAPIDO_PRIZE,
  formatCountdown,
  formatMarginMs,
  getCurrentRound,
  getRoundResult,
  getWaitingCount,
  isPressWindowOpen,
  markPlayedRound,
  readPlayedRound,
  type BotonRapidoRoundResult,
} from "@/lib/boton-rapido-data";

type Phase = "idle" | "pressing" | "lost";

const WAIT_LINES_LOCKED = [
  "el botón sigue bloqueado…",
  "miles esperan el momento exacto…",
  "solo se abre en los últimos 10 segundos…",
  "mantenete atento al contador…",
];

const WAIT_LINES_ACTIVE = [
  "¡ahora! el primero gana…",
  "alguien está a punto de tocar…",
  "solo el más rápido gana…",
  "la sala está al límite…",
];

function finishLoss(
  roundId: number,
  setResult: (r: BotonRapidoRoundResult) => void,
  setAlreadyPlayed: (v: boolean) => void,
  setPhase: (p: Phase) => void,
) {
  const roundResult = getRoundResult(roundId);
  markPlayedRound(roundId);
  setResult(roundResult);
  setAlreadyPlayed(true);
  setPhase("lost");
}

export function BotonRapidoSection() {
  const [roundId, setRoundId] = useState(0);
  const [msRemaining, setMsRemaining] = useState(0);
  const [countdown, setCountdown] = useState("00:00:00");
  const [pressCountdown, setPressCountdown] = useState("00:10");
  const [waiting, setWaiting] = useState(3200);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<BotonRapidoRoundResult | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [waitLine, setWaitLine] = useState(WAIT_LINES_LOCKED[0]);
  const prevMsRef = useRef(0);
  const prevRoundRef = useRef(0);

  const syncRound = useCallback(() => {
    const round = getCurrentRound();
    const prevMs = prevMsRef.current;
    const prevRound = prevRoundRef.current;
    const remaining = round.msRemaining;
    const windowOpen = isPressWindowOpen(remaining);

    setRoundId(round.roundId);
    setMsRemaining(remaining);
    setCountdown(formatCountdown(remaining));
    setPressCountdown(formatCountdown(Math.min(remaining, BOTON_RAPIDO_ACTIVE_WINDOW_MS)));
    setWaiting(getWaitingCount(round.roundId));

    const playedRound = readPlayedRound();
    const playedThisRound = playedRound === round.roundId;
    setAlreadyPlayed(playedThisRound);

    if (playedThisRound) {
      setResult(getRoundResult(round.roundId));
      setPhase("lost");
    } else if (round.roundId !== prevRound && prevRound > 0) {
      setPhase("idle");
      setResult(null);
      setAlreadyPlayed(false);
    } else if (
      playedRound !== prevRound &&
      phase !== "pressing" &&
      prevMs > 0 &&
      prevMs <= BOTON_RAPIDO_ACTIVE_WINDOW_MS &&
      remaining > BOTON_RAPIDO_ACTIVE_WINDOW_MS
    ) {
      finishLoss(prevRound, setResult, setAlreadyPlayed, setPhase);
    }

    setWaitLine(
      (windowOpen ? WAIT_LINES_ACTIVE : WAIT_LINES_LOCKED)[
        Math.floor(Date.now() / 4500) %
          (windowOpen ? WAIT_LINES_ACTIVE : WAIT_LINES_LOCKED).length
      ],
    );

    prevMsRef.current = remaining;
    prevRoundRef.current = round.roundId;
  }, [phase]);

  useEffect(() => {
    syncRound();
    const tick = setInterval(syncRound, 200);
    return () => clearInterval(tick);
  }, [syncRound]);

  const windowOpen = isPressWindowOpen(msRemaining);
  const canPress = windowOpen && !alreadyPlayed && phase === "idle";

  const handlePress = useCallback(() => {
    if (!canPress) return;

    setPhase("pressing");

    window.setTimeout(() => {
      finishLoss(roundId, setResult, setAlreadyPlayed, setPhase);
    }, 700 + Math.random() * 500);
  }, [canPress, roundId]);

  const roundResult = result ?? getRoundResult(roundId);
  const locked = !windowOpen && !alreadyPlayed && phase !== "lost";
  const showLost = phase === "lost" || alreadyPlayed;

  const statusText =
    phase === "pressing"
      ? "PROCESANDO TOQUE…"
      : showLost
        ? "RONDA CERRADA PARA VOS"
        : windowOpen
          ? `¡VENTANA ABIERTA! ${pressCountdown} RESTANTES`
          : waitLine.toUpperCase();

  const buttonLabel =
    phase === "pressing"
      ? "…"
      : showLost
        ? "CERRADO"
        : windowOpen
          ? "¡TOCAR!"
          : "BLOQUEADO";

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      <style>{`
        @keyframes boton-rapido-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255,61,0,0.35), 0 12px 0 rgba(0,0,0,0.45); }
          50% { transform: scale(1.04); box-shadow: 0 0 70px rgba(255,145,0,0.55), 0 14px 0 rgba(0,0,0,0.45); }
        }
        @keyframes boton-rapido-ring {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes boton-rapido-scan {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>

      {/* Hero */}
      <div className="text-center mb-6">
        <div className="font-mono text-[10px] sm:text-[11px] tracking-[4px] text-[#ff6b35] flex items-center justify-center gap-3 mb-3">
          <span className="flex-1 max-w-[40px] h-px bg-[rgba(255,107,53,0.4)]" />
          EN VIVO · MULTIJUGADOR
          <span className="flex-1 max-w-[40px] h-px bg-[rgba(255,107,53,0.4)]" />
        </div>
        <h2
          className="font-display font-black tracking-[2px] mb-2"
          style={{ fontSize: "clamp(28px,7vw,48px)" }}
        >
          Botón{" "}
          <span
            className="text-[#ff3d00]"
            style={{ textShadow: "0 0 28px rgba(255,61,0,0.65)" }}
          >
            Rápido
          </span>
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[var(--txt2)] max-w-[520px] mx-auto leading-[1.85]">
          Miles de personas esperan en línea. El botón solo se abre en los{" "}
          <strong className="text-[#ff9100]">últimos 10 segundos</strong> de
          cada ronda. El primero gana{" "}
          <strong className="text-[#00ff9d] font-bold">
            ${BOTON_RAPIDO_PRIZE} USD
          </strong>
          . Un intento por ronda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 max-w-[520px] mx-auto">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "var(--bg2)",
            border: "1px solid rgba(255,61,0,0.25)",
          }}
        >
          <div className="font-mono text-[9px] tracking-[2px] text-[var(--txt3)] mb-1">
            ESPERANDO AHORA
          </div>
          <div
            className="font-display font-black text-[22px] sm:text-[26px] text-[#ff9100]"
            style={{ textShadow: "0 0 16px rgba(255,145,0,0.4)" }}
          >
            {waiting.toLocaleString("es-AR")}
          </div>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "var(--bg2)",
            border: "1px solid rgba(179,136,255,0.25)",
          }}
        >
          <div className="font-mono text-[9px] tracking-[2px] text-[var(--txt3)] mb-1">
            PRÓXIMA RONDA
          </div>
          <div className="font-mono font-black text-[20px] sm:text-[24px] text-[var(--mystik)]">
            {countdown}
          </div>
        </div>
      </div>

      {/* Arena */}
      <div
        className="relative max-w-[560px] mx-auto rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden text-center"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,61,0,0.1) 0%, rgba(10,6,18,0.95) 55%)",
          border: windowOpen
            ? "1px solid rgba(255,145,0,0.55)"
            : "1px solid rgba(255,61,0,0.3)",
          boxShadow: windowOpen
            ? "0 0 56px rgba(255,145,0,0.2)"
            : "0 0 48px rgba(255,61,0,0.1)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-y-0 w-[35%]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,61,0,0.08), transparent)",
              animation: "boton-rapido-scan 4s ease-in-out infinite",
            }}
          />
        </div>

        <p
          className={`font-mono text-[11px] tracking-[2px] mb-5 ${
            windowOpen ? "text-[#ff9100] animate-pulse" : "text-[var(--txt3)]"
          }`}
        >
          {statusText}
        </p>

        <div className="relative inline-flex items-center justify-center mb-4">
          {canPress && (
            <span
              className="absolute inset-0 rounded-full border-2 border-[#ff3d00]"
              style={{ animation: "boton-rapido-ring 1.8s ease-out infinite" }}
              aria-hidden
            />
          )}
          <button
            type="button"
            onClick={handlePress}
            disabled={!canPress}
            className="relative z-[1] w-[clamp(140px,38vw,200px)] h-[clamp(140px,38vw,200px)] rounded-full font-display font-black text-[14px] sm:text-[16px] tracking-[2px] transition-transform disabled:cursor-not-allowed"
            style={{
              background: showLost
                ? "linear-gradient(145deg, #3a3a3a, #1a1a1a)"
                : locked
                  ? "linear-gradient(145deg, #2a2438, #1a1525)"
                  : "linear-gradient(145deg, #ff6b35, #ff3d00, #ff9100)",
              color: showLost || locked ? "var(--txt3)" : "#0a0612",
              border: showLost
                ? "3px solid rgba(255,255,255,0.1)"
                : locked
                  ? "3px solid rgba(179,136,255,0.25)"
                  : "3px solid rgba(255,200,100,0.5)",
              animation: canPress
                ? "boton-rapido-pulse 1.6s ease-in-out infinite"
                : undefined,
              opacity: phase === "pressing" ? 0.7 : 1,
              boxShadow: locked
                ? "inset 0 0 20px rgba(0,0,0,0.4)"
                : undefined,
            }}
          >
            {buttonLabel}
          </button>
        </div>

        <p className="text-[13px] text-[var(--txt2)] font-mono tracking-[1px]">
          {windowOpen ? (
            <>
              Ventana activa:{" "}
              <span className="text-[#ff9100] font-bold">{pressCountdown}</span>
            </>
          ) : (
            <>
              Premio:{" "}
              <span className="text-[#00ff9d] font-bold">
                ${BOTON_RAPIDO_PRIZE} USD
              </span>
            </>
          )}
        </p>
      </div>

      {/* Resultado — siempre pierde */}
      {showLost && (
        <div
          className="max-w-[560px] mx-auto rounded-2xl p-5 sm:p-6 animate-[fadeup_0.4s_ease] mb-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,255,157,0.08) 0%, rgba(10,6,18,0.95) 100%)",
            border: "1px solid rgba(0,255,157,0.35)",
            boxShadow: "0 0 32px rgba(0,255,157,0.08)",
          }}
        >
          <div className="font-mono text-[10px] tracking-[3px] text-[#00ff9d] mb-3 text-center">
            ✦ GANADOR DE ESTA RONDA
          </div>
          <div className="text-center mb-3">
            <span className="text-4xl">{roundResult.flag}</span>
          </div>
          <h3
            className="font-display font-black text-center tracking-[1px] mb-2"
            style={{ fontSize: "clamp(20px,5vw,28px)" }}
          >
            {roundResult.name} ganó ${BOTON_RAPIDO_PRIZE} USD
          </h3>
          <p className="text-center text-[15px] text-[var(--txt)]/90 mb-1">
            Desde {roundResult.city}, {roundResult.country}
          </p>
          <p className="text-center text-[13px] font-mono text-[var(--txt2)]">
            Llegaste{" "}
            <span className="text-[#ff6b35] font-bold">
              {formatMarginMs(roundResult.marginMs)}
            </span>{" "}
            tarde — el botón ya fue tomado.
          </p>
          <p className="text-center text-[12px] text-[var(--txt3)] mt-4 font-mono">
            Nueva ronda en {countdown}
          </p>
        </div>
      )}

      {/* Feed simulado */}
      <div
        className="rounded-xl p-4 overflow-hidden"
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="font-mono text-[9px] tracking-[2px] text-[var(--txt3)] mb-3">
          SALA EN VIVO
        </div>
        <div className="space-y-2 text-[13px] text-[var(--txt2)]">
          <p>
            <span className="text-[#ff9100]">●</span>{" "}
            {waiting.toLocaleString("es-AR")} jugadores conectados esperando el
            botón…
          </p>
          <p>
            <span className="text-[var(--mystik)]">◆</span> El botón se desbloquea
            solo en los últimos 10 segundos de cada hora.
          </p>
          <p className="text-[var(--txt3)] italic">{waitLine}</p>
          {showLost && (
            <p className="text-[#00ff9d]">
              {roundResult.flag} {roundResult.name} de {roundResult.country}{" "}
              fue el más rápido del mundo en esta ronda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
