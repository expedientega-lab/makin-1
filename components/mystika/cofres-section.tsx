"use client";

import { useState, useRef, useEffect } from "react";
import { prizes, type Prize } from "@/lib/clawzone-data";

interface CofresSectionProps {
  hasPaid: boolean;
  onRequestPay: (productId: string, title: string, description: string) => void;
}

function pickPrize(): Prize {
  let r = Math.random() * 100;
  let acc = 0;
  for (const prize of prizes) {
    acc += prize.p;
    if (r <= acc) return prize;
  }
  return prizes[0];
}

export function CofresSection({ hasPaid, onRequestPay }: CofresSectionProps) {
  const [opening, setOpening] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<Prize | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const openChest = (idx: number) => {
    if (!hasPaid) {
      onRequestPay(
        "mystika-cofres",
        "COFRES DEL DESTINO",
        "Por solo $1 abris un cofre cosmico y revelas premios digitales al instante.",
      );
      return;
    }
    if (opening) return;

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
          setResult(pickPrize());
          setOpening(false);
          timeoutRef.current = null;
        }, 450);
      }
    }, 95);
  };

  const playAgain = () => {
    setResult(null);
    setChosen(null);
    setHighlighted(null);
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
          Tres cofres ancestrales vibran con energía distinta. Solo uno guarda
          tu premio digital — el portal decide el resto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[0, 1, 2].map((i) => {
          const isHot = highlighted === i;
          const isChosen = chosen === i && result !== null;
          return (
            <button
              key={i}
              type="button"
              disabled={opening}
              onClick={() => openChest(i)}
              className={[
                "relative rounded-xl border p-6 text-center transition-all duration-200",
                "min-h-[160px] flex flex-col items-center justify-center gap-2",
                "disabled:opacity-70",
                isHot
                  ? "border-[var(--mystik)] bg-[var(--mystikS)] shadow-[0_0_24px_rgba(179,136,255,0.35)] scale-[1.02]"
                  : "border-[var(--border)] bg-[var(--bg2)] hover:border-[var(--borderH)] hover:bg-[var(--bg3)]",
                isChosen ? "ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-[var(--bg0)]" : "",
              ].join(" ")}
            >
              <span
                className="text-6xl leading-none transition-transform"
                style={{
                  animation: isHot ? "float 0.45s ease-in-out infinite alternate" : undefined,
                }}
              >
                📦
              </span>
              <span className="font-mono text-[12px] font-medium tracking-[2px] text-[var(--txt)]">
                COFRE {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center font-mono text-[12px] font-medium tracking-[2px] text-[var(--txt2)] mb-4">
        {opening
          ? "EL PORTAL ESTÁ ABRIENDO TU COFRE..."
          : hasPaid
            ? "TOCÁ UN COFRE PARA REVELAR"
            : "DESBLOQUEÁ EL ACCESO PARA JUGAR"}
      </p>

      {!hasPaid && (
        <button
          type="button"
          onClick={() =>
            onRequestPay(
              "mystika-cofres",
              "COFRES DEL DESTINO",
              "Por solo $1 abris un cofre cosmico y revelas premios digitales al instante.",
            )
          }
          className="w-full py-3 rounded-lg font-mono text-[12px] tracking-[2px] text-[var(--bg0)] transition-all"
          style={{
            background: "linear-gradient(135deg,var(--gold),#ffdd55)",
          }}
        >
          🔒 DESBLOQUEAR — $1
        </button>
      )}

      {result && (
        <div
          className="rounded-xl border p-5 text-center mt-4"
          style={{
            borderColor: result.col,
            background:
              "linear-gradient(135deg, rgba(179,136,255,.08), var(--bg2))",
          }}
        >
          <div className="text-5xl mb-2">{result.ico}</div>
          <div className="font-display text-[24px] font-black mb-1">{result.nm}</div>
          <div className="font-mono text-[12px] tracking-[2px] text-[var(--txt2)] mb-4">
            VALOR ESTIMADO: ${result.v}
          </div>
          <button
            type="button"
            onClick={playAgain}
            className="w-full py-3 rounded-lg font-mono text-[12px] tracking-[2px] text-[var(--bg0)] transition-all"
            style={{
              background: "linear-gradient(135deg,var(--mystik3),var(--mystik))",
            }}
          >
            OTRO COFRE
          </button>
        </div>
      )}
    </div>
  );
}
