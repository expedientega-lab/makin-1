"use client";

import { useCallback, useEffect, useState } from "react";
import { authorizeGameAction, reconcilePaidSession } from "@/lib/game-authorize-client";
import {
  JACKPOT_FIVE_GRID_SIZE,
  JACKPOT_FIVE_MAX_DIGS,
  JACKPOT_FIVE_PLAY_PRICE,
  JACKPOT_FIVE_PRIZE,
  JACKPOT_FIVE_PRODUCT_ID,
  buildMineGrid,
  clearJackpotFiveSession,
  FIXED_MINE_INDICES,
  readJackpotFiveOrderId,
  readJackpotFivePaid,
  relocateTreasure,
  unlockJackpotFiveSession,
  type MineCell,
} from "@/lib/jackpot-five-data";
import { isLocalDevServer } from "@/lib/is-local-dev";
import { MinesLiveFeed } from "./mines-live-feed";

type Phase = "ready" | "playing" | "won" | "lost";

interface JackpotFiveStageProps {
  onClose: () => void;
  onRequestPay: (
    productId: string,
    title: string,
    description: string,
    price: number,
  ) => void;
}

export function JackpotFiveStage({
  onClose,
  onRequestPay,
}: JackpotFiveStageProps) {
  const [entered, setEntered] = useState(false);
  const [paid, setPaid] = useState(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [digCount, setDigCount] = useState(0);
  const [cells, setCells] = useState<MineCell[]>([]);
  const [flash, setFlash] = useState<"hit" | "miss" | "warn" | null>(null);
  const [lastBoomIndex, setLastBoomIndex] = useState<number | null>(null);
  const [devServer, setDevServer] = useState(false);

  const treasureIndex = cells.findIndex((c) => c.kind === "treasure");

  const nearMissLabel = (() => {
    if (lastBoomIndex === null || treasureIndex < 0) {
      return `El tesoro de $${JACKPOT_FIVE_PRIZE} USD estaba en la mina`;
    }
    const size = JACKPOT_FIVE_GRID_SIZE;
    const dist =
      Math.abs((lastBoomIndex % size) - (treasureIndex % size)) +
      Math.abs(Math.floor(lastBoomIndex / size) - Math.floor(treasureIndex / size));
    if (dist === 1) return `¡A 1 casilla de ganar $${JACKPOT_FIVE_PRIZE} USD!`;
    if (dist <= 3) return `¡Muy cerca! El tesoro de $${JACKPOT_FIVE_PRIZE} USD estaba ahí`;
    return `El tesoro de $${JACKPOT_FIVE_PRIZE} USD estaba escondido en la mina`;
  })();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = requestAnimationFrame(() => setEntered(true));
    setPaid(readJackpotFivePaid());
    setDevServer(isLocalDevServer());
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(t);
    };
  }, []);

  useEffect(() => {
    if (!readJackpotFivePaid() || isLocalDevServer()) return
    void reconcilePaidSession(
      JACKPOT_FIVE_PRODUCT_ID,
      readJackpotFiveOrderId(),
      clearJackpotFiveSession,
    ).then((ok) => setPaid(ok))
  }, [])

  useEffect(() => {
    const onUnlock = () => setPaid(true);
    window.addEventListener("mystika-jackpot-five-unlock", onUnlock);
    return () =>
      window.removeEventListener("mystika-jackpot-five-unlock", onUnlock);
  }, []);

  const resetBoard = useCallback(() => {
    setCells(buildMineGrid());
    setDigCount(0);
    setFlash(null);
    setLastBoomIndex(null);
  }, []);

  const startGame = useCallback(() => {
    resetBoard();
    setPhase("playing");
  }, [resetBoard]);

  const handleStart = async () => {
    if (!paid) {
      onRequestPay(
        JACKPOT_FIVE_PRODUCT_ID,
        "GANATE $5 — MINI JUEGO",
        `Pagás $${JACKPOT_FIVE_PLAY_PRICE} USD. Tenés 2 excavaciones: la 1.ª no pasa nada, la 2.ª explota.`,
        JACKPOT_FIVE_PLAY_PRICE,
      );
      return;
    }

    if (devServer) {
      startGame();
      return;
    }

    const orderId = readJackpotFiveOrderId();
    if (!orderId) {
      clearJackpotFiveSession();
      setPaid(false);
      onRequestPay(
        JACKPOT_FIVE_PRODUCT_ID,
        "GANATE $5 — MINI JUEGO",
        `Pagás $${JACKPOT_FIVE_PLAY_PRICE} USD. Tenés 2 excavaciones: la 1.ª no pasa nada, la 2.ª explota.`,
        JACKPOT_FIVE_PLAY_PRICE,
      );
      return;
    }

    const auth = await authorizeGameAction(JACKPOT_FIVE_PRODUCT_ID, orderId);
    if (!auth.ok) {
      clearJackpotFiveSession();
      setPaid(false);
      onRequestPay(
        JACKPOT_FIVE_PRODUCT_ID,
        "GANATE $5 — MINI JUEGO",
        `Pagás $${JACKPOT_FIVE_PLAY_PRICE} USD. Tenés 2 excavaciones: la 1.ª no pasa nada, la 2.ª explota.`,
        JACKPOT_FIVE_PLAY_PRICE,
      );
      return;
    }

    startGame();
  };

  /** 2.ª excavación: bomba donde tocó + tesoro lejos + otra mina al costado. */
  const revealNearMiss = (grid: MineCell[], clickedIndex: number) => {
    const next = grid.map((cell) => ({ ...cell }));
    const treasureIdx = next.findIndex((c) => c.kind === "treasure");

    next[clickedIndex] = { kind: "mine", revealed: true };

    if (treasureIdx >= 0 && treasureIdx !== clickedIndex) {
      next[treasureIdx] = { kind: "treasure", revealed: true };
    }

    const flankMine = FIXED_MINE_INDICES.find((i) => i !== clickedIndex);
    if (flankMine !== undefined && flankMine !== clickedIndex) {
      next[flankMine] = { kind: "mine", revealed: true };
    }

    return next;
  };

  const handleCellClick = (index: number) => {
    if (phase !== "playing") return;

    const cell = cells[index];
    if (cell.revealed) return;

    const next = [...cells];

    if (digCount === 0) {
      setDigCount(1);
      setFlash("warn");
      next[index] = { kind: "empty", revealed: true };
      setCells(relocateTreasure(next, index));
      return;
    }

    setFlash("miss");
    setLastBoomIndex(index);
    setCells(revealNearMiss(next, index));
    window.setTimeout(() => {
      setPhase("lost");
      clearJackpotFiveSession();
      setPaid(false);
    }, 700);
  };

  const handleDevUnlock = () => {
    unlockJackpotFiveSession("local-dev-five");
    setPaid(true);
    setPhase("ready");
    resetBoard();
  };

  const handleDevTestPlay = () => {
    unlockJackpotFiveSession("local-dev-five");
    setPaid(true);
    startGame();
  };

  const handlePlayAgain = () => {
    setPhase("ready");
    resetBoard();
  };

  return (
    <div
      className="fixed inset-0 z-[650] flex items-center justify-center p-3 sm:p-4"
      style={{
        padding:
          "max(0.75rem, env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right)) max(0.75rem, env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left))",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #04030a 0%, #0a0614 45%, #06040c 100%)",
        }}
        aria-hidden
      />
      <style>{`
        @keyframes five-stage-enter {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mine-cell-pop {
          0% { transform: scale(0.85); }
          60% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .five-stage-panel { animation: five-stage-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .mine-cell-reveal { animation: mine-cell-pop 0.25s ease-out forwards; }
        @keyframes mine-led-pulse {
          0%, 100% { opacity: 0.35; filter: brightness(0.85); }
          50% { opacity: 1; filter: brightness(1.2); }
        }
        @keyframes mine-neon-breathe {
          0%, 100% { opacity: 0.88; }
          50% { opacity: 1; }
        }
        .mine-led-dot {
          animation: mine-led-pulse 2.4s ease-in-out infinite;
        }
        .mine-neon-title {
          color: #ffe566;
          text-shadow:
            0 0 1px rgba(255,229,102,0.95),
            0 0 6px rgba(255,215,0,0.45),
            0 0 12px rgba(232,184,74,0.2);
          animation: mine-neon-breathe 3s ease-in-out infinite;
        }
        .mine-neon-prize {
          color: #ffe566;
          text-shadow:
            0 0 1px rgba(255,229,102,0.95),
            0 0 8px rgba(255,215,0,0.5),
            0 0 14px rgba(232,184,74,0.22);
        }
        @keyframes mine-near-miss-pulse {
          0%, 100% { box-shadow: 0 0 14px rgba(255,215,0,0.35); transform: scale(1); }
          50% { box-shadow: 0 0 26px rgba(255,215,0,0.65); transform: scale(1.04); }
        }
        .mine-near-miss-treasure { animation: mine-near-miss-pulse 1.6s ease-in-out infinite; }
      `}</style>

      <div
        className={[
          "relative w-full max-w-[min(480px,100%)] rounded-2xl border overflow-hidden five-stage-panel",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          borderColor: "rgba(255,215,0,0.28)",
          background:
            "linear-gradient(165deg, rgba(255,215,0,0.08) 0%, rgba(8,5,14,0.98) 50%, rgba(12,8,22,0.99) 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,215,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.45)",
        }}
      >
        <div className="relative h-[3px] w-full overflow-hidden" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.15) 20%, rgba(255,229,102,0.55) 50%, rgba(255,215,0,0.15) 80%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-y-0 w-[40%]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,240,150,0.7), transparent)",
              animation: "ctamove 4s linear infinite",
            }}
          />
        </div>

        <div className="relative px-4 py-3.5 sm:px-5 sm:py-4 border-b border-[rgba(255,215,0,0.18)] flex items-center justify-between gap-2">
          <div
            className="absolute bottom-0 left-3 right-3 h-px pointer-events-none flex justify-between gap-[3px]"
            aria-hidden
          >
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className="mine-led-dot flex-1 max-w-[6px] h-[2px] rounded-full"
                style={{
                  background: i % 3 === 0 ? "#ffd700" : "#e8b84a",
                  animationDelay: `${i * 0.18}s`,
                  boxShadow: "0 0 4px rgba(255,215,0,0.35)",
                }}
              />
            ))}
          </div>
          <div>
            <h2 className="font-display font-black text-[20px] sm:text-[22px] tracking-[0.08em] leading-none">
              <span className="text-[var(--txt)]">GANATE </span>
              <span className="mine-neon-title">$5</span>
            </h2>
            <p className="font-mono text-[11px] sm:text-[12px] text-[var(--txt3)] mt-1.5 tracking-[0.08em]">
              Encontrá el tesoro · premio ${JACKPOT_FIVE_PRIZE} USD
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] text-[var(--txt3)] hover:text-[var(--gold)] px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div
            className="flex items-center justify-between gap-3 mb-4 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(255,215,0,0.04)",
              border: "1px solid rgba(255,215,0,0.14)",
              boxShadow: "inset 0 0 12px rgba(255,215,0,0.04)",
            }}
          >
            <div className="flex gap-2">
              {Array.from({ length: JACKPOT_FIVE_MAX_DIGS }, (_, i) => (
                <span
                  key={i}
                  className="text-2xl transition-opacity duration-300"
                  style={{
                    opacity: i < digCount ? 0.25 : 1,
                    filter: i < digCount ? undefined : "drop-shadow(0 0 4px rgba(255,215,0,0.25))",
                  }}
                >
                  {i === 0 ? "⛏️" : "💣"}
                </span>
              ))}
            </div>
            <span className="font-display font-black text-[22px] sm:text-[26px] tracking-[0.06em] mine-neon-prize leading-none">
              ${JACKPOT_FIVE_PRIZE} USD
            </span>
          </div>

          {phase === "won" ? (
            <div className="text-center py-8 sm:py-10 animate-[fadeup_0.4s_ease]">
              <div className="text-5xl mb-3">💎</div>
              <h3
                className="font-display font-black text-[26px] sm:text-[30px] text-[#ffd700] mb-2"
                style={{ textShadow: "0 0 24px rgba(255,215,0,0.5)" }}
              >
                ¡${JACKPOT_FIVE_PRIZE} USD!
              </h3>
              <p className="text-[14px] text-[var(--txt2)] mb-5 max-w-[320px] mx-auto leading-relaxed">
                Encontraste el tesoro en la mina. El portal acreditó tu premio
                en la mesa.
              </p>
              <button
                type="button"
                onClick={handlePlayAgain}
                className="w-full py-3.5 rounded-xl font-mono text-[13px] font-black tracking-[0.15em]"
                style={{
                  background: "linear-gradient(135deg, #e8b84a, #ffd700)",
                  color: "#1a1205",
                }}
              >
                JUGAR DE NUEVO — ${JACKPOT_FIVE_PLAY_PRICE}
              </button>
              {devServer && (
                <button
                  type="button"
                  onClick={handleDevUnlock}
                  title="Solo servidor dev local"
                  className="mt-1.5 w-full py-0.5 rounded border border-dashed border-amber-400/45 bg-amber-500/8 font-mono text-[7px] font-bold tracking-[0.1em] text-amber-200/80 hover:bg-amber-500/15"
                >
                  PROBAR
                </button>
              )}
            </div>
          ) : phase === "lost" ? (
            <div className="text-center py-4 sm:py-6 animate-[fadeup_0.4s_ease]">
              <div className="text-4xl mb-2">💣</div>
              <h3 className="font-display font-black text-[22px] text-[#ff8787] mb-3">
                Mina explotó
              </h3>

              <div
                className="rounded-xl px-3 py-3 mb-4 text-left"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,107,107,0.06) 100%)",
                  border: "1px solid rgba(255,215,0,0.28)",
                  boxShadow: "inset 0 0 20px rgba(255,215,0,0.06)",
                }}
              >
                <p className="font-mono text-[9px] tracking-[0.24em] text-[#ffd700] mb-1.5 text-center">
                  ◆ CASI GANASTE ◆
                </p>
                <p className="font-display font-black text-[15px] sm:text-[17px] text-[#ffe566] text-center leading-snug mb-3">
                  {nearMissLabel}
                </p>

                <div
                  className="grid gap-1 sm:gap-1.5 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${JACKPOT_FIVE_GRID_SIZE}, minmax(0, 1fr))`,
                    maxWidth: "260px",
                  }}
                >
                  {cells.map((cell, index) => {
                    const revealed = cell.revealed || cell.kind === "treasure" || cell.kind === "mine";
                    const isTreasure = cell.kind === "treasure" && revealed;
                    const isMine = cell.kind === "mine" && revealed;

                    return (
                      <div
                        key={index}
                        className={[
                          "aspect-square rounded-md font-mono text-[14px] sm:text-[16px] flex items-center justify-center",
                          isTreasure ? "mine-near-miss-treasure" : "",
                        ].join(" ")}
                        style={{
                          background: !revealed
                            ? "linear-gradient(145deg, rgba(40,30,14,0.85), rgba(16,11,6,0.95))"
                            : isTreasure
                              ? "linear-gradient(145deg, rgba(255,215,0,0.4), rgba(180,140,20,0.28))"
                              : isMine
                                ? "linear-gradient(145deg, rgba(255,80,80,0.4), rgba(80,20,20,0.45))"
                                : "linear-gradient(145deg, rgba(80,60,30,0.5), rgba(30,22,14,0.7))",
                          border: `1px solid ${
                            isTreasure
                              ? "rgba(255,215,0,0.85)"
                              : isMine
                                ? "rgba(255,107,107,0.65)"
                                : revealed
                                  ? "rgba(255,215,0,0.2)"
                                  : "rgba(255,215,0,0.12)"
                          }`,
                          opacity: revealed ? 1 : 0.35,
                        }}
                      >
                        {!revealed ? (
                          <span className="opacity-30 text-[8px]">▪</span>
                        ) : isTreasure ? (
                          "💎"
                        ) : isMine ? (
                          "💣"
                        ) : (
                          <span className="text-[8px] text-[var(--txt3)]">·</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[13px] text-[var(--txt2)] mb-4">
                La 2.ª excavación explotó. Volvé a intentar por $
                {JACKPOT_FIVE_PLAY_PRICE} USD.
              </p>
              <button
                type="button"
                onClick={handlePlayAgain}
                className="w-full py-3.5 rounded-xl font-mono text-[13px] font-black tracking-[0.15em] border"
                style={{
                  borderColor: "rgba(255,215,0,0.4)",
                  color: "#ffd700",
                }}
              >
                REINTENTAR — ${JACKPOT_FIVE_PLAY_PRICE}
              </button>
              {devServer && (
                <button
                  type="button"
                  onClick={handleDevUnlock}
                  title="Solo servidor dev local"
                  className="mt-1.5 w-full py-0.5 rounded border border-dashed border-amber-400/45 bg-amber-500/8 font-mono text-[7px] font-bold tracking-[0.1em] text-amber-200/80 hover:bg-amber-500/15"
                >
                  PROBAR
                </button>
              )}
            </div>
          ) : (
            <>
              {phase === "playing" && (
                <p className="text-center font-mono text-[10px] tracking-[0.2em] text-[var(--txt3)] mb-3">
                  {flash === "miss"
                    ? "¡Boom! Segunda excavación"
                    : digCount === 1
                      ? "Última excavación — la próxima explota"
                      : "Elegí una casilla para excavar"}
                </p>
              )}

              <div
                className="grid gap-1.5 sm:gap-2 mb-4 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${JACKPOT_FIVE_GRID_SIZE}, minmax(0, 1fr))`,
                  maxWidth: "320px",
                }}
              >
                {Array.from({
                  length: JACKPOT_FIVE_GRID_SIZE * JACKPOT_FIVE_GRID_SIZE,
                }).map((_, index) => {
                  const isPlaying = phase === "playing";
                  const cell = isPlaying
                    ? cells[index]
                    : { kind: "empty" as const, revealed: false };
                  const revealed = isPlaying && cell.revealed;
                  const hidden = !revealed;

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!isPlaying || revealed}
                      onClick={() => handleCellClick(index)}
                      className={[
                        "aspect-square rounded-lg font-mono text-[18px] sm:text-[20px] transition-all duration-200",
                        hidden && isPlaying
                          ? "hover:brightness-125 active:scale-95 cursor-pointer"
                          : "cursor-default",
                        revealed ? "mine-cell-reveal" : "",
                      ].join(" ")}
                      style={{
                        background: hidden
                          ? "linear-gradient(145deg, rgba(60,45,20,0.9), rgba(20,14,8,0.95))"
                          : cell.kind === "treasure"
                            ? "linear-gradient(145deg, rgba(255,215,0,0.35), rgba(180,140,20,0.25))"
                            : cell.kind === "mine"
                              ? "linear-gradient(145deg, rgba(255,80,80,0.35), rgba(80,20,20,0.4))"
                              : "linear-gradient(145deg, rgba(80,60,30,0.5), rgba(30,22,14,0.7))",
                        border: `1px solid ${
                          hidden
                            ? "rgba(255,215,0,0.2)"
                            : cell.kind === "treasure"
                              ? "rgba(255,215,0,0.7)"
                              : cell.kind === "mine"
                                ? "rgba(255,107,107,0.6)"
                                : "rgba(255,215,0,0.15)"
                        }`,
                        boxShadow: revealed
                          ? cell.kind === "treasure"
                            ? "0 0 20px rgba(255,215,0,0.45)"
                            : cell.kind === "mine"
                              ? "0 0 16px rgba(255,107,107,0.35)"
                              : undefined
                          : "inset 0 1px 0 rgba(255,255,255,0.04)",
                        opacity: !isPlaying ? 0.45 : 1,
                      }}
                    >
                      {hidden ? (
                        <span className="opacity-40" aria-hidden>
                          ▪
                        </span>
                      ) : cell.kind === "treasure" ? (
                        "💎"
                      ) : cell.kind === "mine" ? (
                        "💣"
                      ) : (
                        <span className="text-[10px] text-[var(--txt3)]">·</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {phase === "ready" && (
                <>
                  <button
                    type="button"
                    onClick={handleStart}
                    className="w-full py-4 sm:py-5 rounded-xl font-mono text-[14px] sm:text-[15px] tracking-[0.2em] font-black transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #e8b84a, #ffd700)",
                      color: "#1a1205",
                      boxShadow: "0 8px 32px rgba(255,215,0,0.35)",
                    }}
                  >
                    {paid
                      ? "▶ ENTRAR A LA MINA"
                      : `JUGAR — $${JACKPOT_FIVE_PLAY_PRICE} USD`}
                  </button>

                  {devServer && (
                    <button
                      type="button"
                      onClick={handleDevTestPlay}
                      title="Solo servidor dev local"
                      className="mt-1.5 w-full py-0.5 rounded border border-dashed border-amber-400/45 bg-amber-500/8 font-mono text-[7px] font-bold tracking-[0.1em] text-amber-200/80 hover:bg-amber-500/15 active:scale-95"
                    >
                      PROBAR
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <MinesLiveFeed />
      </div>
    </div>
  );
}
