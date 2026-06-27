"use client";

import { useState, useRef, useEffect } from "react";
import { DevTestButton } from "./dev-test-button";
import {
  COFRES_ODDS_DISPLAY,
  formatCofreOddsPct,
  pickCofreGalleta,
  type CofreGalletaResult,
} from "@/lib/cofres-data";

const CHEST_PRICES = [1, 5, 10] as const;

function cofreProductId(idx: number) {
  return `mystika-cofres-${idx + 1}`;
}

function CofresOddsPanel({ highlightGalleta }: { highlightGalleta?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 w-full lg:max-w-[280px] shrink-0">
      <p className="font-mono text-[10px] tracking-[3px] text-[var(--mystik3)] text-center mb-3">
        POSIBILIDADES DEL PORTAL
      </p>
      <ul className="space-y-1.5">
        {COFRES_ODDS_DISPLAY.map((item) => {
          const isWon = highlightGalleta && item.ico === "🥠";
          return (
            <li
              key={item.label}
              className={[
                "flex items-center justify-between gap-3 text-[12px] rounded-md px-1.5 py-0.5 -mx-1.5",
                isWon ? "bg-[rgba(255,215,0,0.08)]" : "",
              ].join(" ")}
            >
              <span className="text-[var(--txt2)] flex items-center gap-2 min-w-0">
                <span className="shrink-0">{item.ico}</span>
                <span className="truncate">{item.label}</span>
              </span>
              <span
                className={[
                  "font-mono shrink-0 tracking-[1px]",
                  isWon ? "text-[var(--gold)] font-bold" : "text-[var(--txt3)]",
                ].join(" ")}
              >
                {formatCofreOddsPct(item.pct)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface CofresSectionProps {
  paidChestIndex: number | null;
  onRequestPay: (productId: string, title: string, description: string, price?: number) => void;
  onConsumePaid?: () => void;
  devTestEnabled?: boolean;
  onDevTestGrantPaid?: (chestIndex: number) => void;
}

export function CofresSection({
  paidChestIndex,
  onRequestPay,
  onConsumePaid,
  devTestEnabled,
  onDevTestGrantPaid,
}: CofresSectionProps) {
  const [opening, setOpening] = useState(false);
  const [chestUsed, setChestUsed] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<CofreGalletaResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paidChestIndex !== null) setChestUsed(false);
  }, [paidChestIndex]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const openChest = (idx: number) => {
    if (paidChestIndex !== idx) {
      onRequestPay(
        cofreProductId(idx),
        "COFRES DEL DESTINO",
        `Pagar $${CHEST_PRICES[idx]} USD para abrir el Cofre ${idx + 1}.
La transacción se procesa con el mismo flujo de pago.`,
        CHEST_PRICES[idx],
      );
      return;
    }
    if (opening || chestUsed) return;

    setChestUsed(true);
    setOpening(true);
    setChosen(idx);
    setResult(null);
    setHighlighted(0);

    let steps = 0;
    const maxSteps = 14;
    intervalRef.current = setInterval(() => {
      setHighlighted((h) => ((h ?? 0) + 1) % 3);
      steps += 1;
      if (steps >= maxSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setHighlighted(idx);
        timeoutRef.current = setTimeout(() => {
          setResult(pickCofreGalleta());
          setOpening(false);
          onConsumePaid?.();
          timeoutRef.current = null;
        }, 450);
      }
    }, 95);
  };

  const requestAnotherChest = (idx = 0) => {
    setResult(null);
    setChosen(null);
    setHighlighted(null);
    setChestUsed(false);
    onRequestPay(
      cofreProductId(idx),
      "COFRES DEL DESTINO",
      `Pagar $${CHEST_PRICES[idx]} USD para abrir otro cofre.`,
      CHEST_PRICES[idx],
    );
  };

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      <div className="text-center py-1.5 pb-[18px]">
        <div className="font-mono text-[10px] tracking-[4px] text-[var(--mystik)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          COFRES DEL DESTINO
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-2.5 text-[var(--txt)]"
          style={{ fontSize: "clamp(32px,8vw,52px)" }}
        >
          Elegí un <span className="text-[var(--mystik)]">cofre</span>
        </h2>
        <p className="text-[14px] text-[var(--txt2)] max-w-[420px] mx-auto leading-[1.8]">
          Tres cofres ancestrales vibran con energía distinta. Al abrir el tuyo
          recibís siempre una galleta de la fortuna con mensaje único.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[0, 1, 2].map((i) => {
          const isPaid = paidChestIndex === i;
          const isHot = highlighted === i;
          const isChosen = chosen === i && result !== null;
          return (
            <div key={i} className="flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={!isPaid || opening || chestUsed}
                onClick={() => openChest(i)}
                className={[
                  "group relative isolate overflow-hidden w-full max-w-[220px] rounded-xl border p-6 text-center transition-all duration-300",
                  "min-h-[160px] flex flex-col items-center justify-center gap-2",
                  "disabled:opacity-70 disabled:saturate-[0.85]",
                  isHot
                    ? "border-[var(--mystik)] bg-[var(--mystikS)] shadow-[0_0_24px_rgba(179,136,255,0.35),inset_0_0_28px_rgba(255,225,170,0.14)] scale-[1.02]"
                    : "border-[var(--border)] bg-[var(--bg2)] hover:border-[var(--borderH)] hover:bg-[var(--bg3)] hover:shadow-[0_0_26px_rgba(179,136,255,0.2)]",
                  isChosen ? "ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-[var(--bg0)]" : "",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0 rounded-xl opacity-90 transition-opacity duration-300",
                    isHot ? "opacity-100" : "opacity-80",
                  ].join(" ")}
                  style={{
                    background:
                      "radial-gradient(circle at 50% 100%, rgba(255,198,92,0.2), transparent 58%), radial-gradient(circle at 50% 20%, rgba(173,132,255,0.16), transparent 62%)",
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-3 left-1/2 h-16 w-[140%] -translate-x-1/2 rounded-full blur-xl transition-opacity duration-300"
                  style={{
                    background: isHot
                      ? "radial-gradient(circle, rgba(255,220,140,0.55) 0%, rgba(255,180,96,0.1) 65%, transparent 80%)"
                      : "radial-gradient(circle, rgba(178,136,255,0.25) 0%, rgba(178,136,255,0.06) 55%, transparent 78%)",
                    opacity: isPaid || isHot ? 1 : 0.65,
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-7 top-2 h-8 rounded-full opacity-80 blur-[1px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.05) 55%, transparent 100%)",
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-5 left-1/2 h-10 w-[78%] -translate-x-1/2 rounded-full blur-md"
                  style={{
                    background: isHot
                      ? "radial-gradient(circle, rgba(255,195,95,0.42), transparent 72%)"
                      : "radial-gradient(circle, rgba(165,121,255,0.28), transparent 72%)",
                  }}
                />
                <span
                  className="relative z-[1] text-6xl leading-none transition-transform duration-300"
                  style={{
                    animation: isHot ? "float 0.45s ease-in-out infinite alternate" : undefined,
                    filter: isHot
                      ? "drop-shadow(0 0 16px rgba(255,202,116,0.7)) drop-shadow(0 2px 0 rgba(0,0,0,0.35))"
                      : "drop-shadow(0 2px 0 rgba(0,0,0,0.35))",
                  }}
                >
                  📦
                </span>
                <span className="relative z-[1] font-mono text-[12px] font-medium tracking-[2px] text-[var(--txt)]">
                  COFRE {i + 1}
                </span>
                <span className="relative z-[1] text-[11px] text-[var(--txt2)] tracking-[2px] uppercase">
                  ${CHEST_PRICES[i]} USD
                </span>
                {!isPaid && (
                  <span className="relative z-[1] mt-2 inline-flex rounded-full border border-dashed border-[var(--gold)] bg-[rgba(255,215,0,0.05)] px-3 py-1 text-[10px] font-mono uppercase tracking-[2px] text-[var(--gold)]">
                    Pagar para abrir
                  </span>
                )}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-3 z-[1] text-[12px] opacity-90"
                  style={{
                    textShadow: "0 0 8px rgba(255,220,140,0.7)",
                    animation: isHot ? "blink 0.9s steps(2,end) infinite" : undefined,
                  }}
                >
                  ✦
                </span>
              </button>
              {!isPaid && (
                <button
                  type="button"
                  onClick={() =>
                    onRequestPay(
                      cofreProductId(i),
                      "COFRES DEL DESTINO",
                      `Pagar $${CHEST_PRICES[i]} USD para abrir el Cofre ${i + 1}.`,
                      CHEST_PRICES[i],
                    )
                  }
                  className="w-full max-w-[220px] rounded-full border border-dashed border-[var(--gold)] bg-[rgba(255,215,0,0.05)] py-2 text-[12px] font-mono uppercase tracking-[2px] text-[var(--gold)] transition-all hover:bg-[rgba(255,215,0,0.12)]"
                >
                  PAGAR ${CHEST_PRICES[i]}
                </button>
              )}
              {onDevTestGrantPaid && (
                <div className="w-full flex justify-center">
                  <DevTestButton
                    onClick={() => {
                      try {
                        onDevTestGrantPaid(i);
                      } catch {
                        // ignore
                      }
                      setTimeout(() => openChest(i), 80);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center font-mono text-[12px] font-medium tracking-[2px] text-[var(--txt2)] mb-4">
        {opening
          ? "EL PORTAL ESTÁ ABRIENDO TU COFRE..."
          : paidChestIndex !== null
            ? `TOCÁ EL COFRE ${paidChestIndex + 1} PARA REVELAR`
            : "ELEGÍ UN COFRE Y PAGÁ PARA ABRIR"}
      </p>

      {paidChestIndex === null && devTestEnabled && onDevTestGrantPaid && (
        <div className="flex justify-center">
          <DevTestButton onClick={() => onDevTestGrantPaid(0)} />
        </div>
      )}

      {result && (
        <div className="mt-4 max-w-[720px] mx-auto animate-[fadeup_0.4s_ease]">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <CofresOddsPanel highlightGalleta />
            <div
              className="flex-1 rounded-xl border p-5 sm:p-6 text-center flex flex-col justify-center"
              style={{
                borderColor: "rgba(255,215,0,0.55)",
                background:
                  "linear-gradient(160deg, rgba(255,215,0,0.1) 0%, rgba(12,8,22,0.98) 45%, var(--bg2) 100%)",
                boxShadow:
                  "inset 0 0 40px rgba(255,215,0,0.06), 0 0 28px rgba(255,215,0,0.12)",
              }}
            >
              <div
                className="text-[56px] leading-none mb-3"
                style={{ filter: "drop-shadow(0 0 20px rgba(255,180,80,0.5))" }}
              >
                🥠
              </div>
              <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--mystik3)] mb-3 font-black">
                GALLETA DE LA FORTUNA
              </div>
              <p
                className="font-display font-bold text-[17px] sm:text-[19px] text-[var(--txt)] leading-[1.5] max-w-[360px] mx-auto"
                style={{ overflowWrap: "anywhere" }}
              >
                {result.phrase}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => requestAnotherChest(chosen ?? 0)}
            className="w-full mt-4 py-3 rounded-lg font-mono text-[12px] tracking-[2px] text-[var(--bg0)] transition-all"
            style={{
              background: "linear-gradient(135deg,var(--mystik3),var(--mystik))",
            }}
          >
            PAGAR OTRO COFRE
          </button>
        </div>
      )}
    </div>
  );
}
