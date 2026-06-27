"use client";

import { useState, useEffect } from "react";
import { fortunes, fortuneCategories } from "@/lib/mystika-data";
import { pickSobreVida, ORBE_PRIZE_INFO, type OrbePrizeType } from "@/lib/orbe-data";
import { useTrappedDialog } from "@/hooks/use-trapped-dialog";

interface OrbPrizeModalProps {
  isOpen: boolean;
  prizeType: OrbePrizeType | null;
  onClose: () => void;
}

export function OrbPrizeModal({ isOpen, prizeType, onClose }: OrbPrizeModalProps) {
  const [fortune, setFortune] = useState<string | null>(null);
  const [category, setCategory] = useState<
    (typeof fortuneCategories)[0] | null
  >(null);
  const [luckNumber, setLuckNumber] = useState(0);
  const [sobreText, setSobreText] = useState<string | null>(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const panelRef = useTrappedDialog(isOpen, onClose);

  useEffect(() => {
    if (!isOpen || !prizeType) return;

    setEnvelopeOpen(false);
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 2200);

    if (prizeType === "galleta") {
      const randomCat =
        fortuneCategories[
          Math.floor(Math.random() * fortuneCategories.length)
        ];
      const randomSub =
        randomCat.subcategories[
          Math.floor(Math.random() * randomCat.subcategories.length)
        ];
      setCategory(randomCat);
      const categoryFortunes =
        fortunes[randomSub.key as keyof typeof fortunes];
      if (categoryFortunes?.length) {
        setFortune(
          categoryFortunes[
            Math.floor(Math.random() * categoryFortunes.length)
          ],
        );
      }
      setLuckNumber(Math.floor(Math.random() * 99) + 1);
      setSobreText(null);
    } else {
      setFortune(null);
      setCategory(null);
      setSobreText(pickSobreVida());
      window.setTimeout(() => setEnvelopeOpen(true), 400);
    }

    return () => clearTimeout(t);
  }, [isOpen, prizeType]);

  if (!isOpen || !prizeType) return null;

  const isGalleta = prizeType === "galleta";
  const info = ORBE_PRIZE_INFO[prizeType];

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 bg-[rgba(5,3,10,0.92)] backdrop-blur-sm" />

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: "100%",
                background: ["var(--mystik)", "var(--gold)", "var(--rose)"][
                  i % 3
                ],
                animation: `confetti ${1.2 + Math.random()}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="orb-prize-title"
        className="relative w-full max-w-[340px] bg-[var(--bg2)] border rounded-xl p-4 text-center"
        style={{
          borderColor: isGalleta
            ? "rgba(255,215,0,0.45)"
            : "rgba(255,107,157,0.45)",
          animation: "popin 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          boxShadow: isGalleta
            ? "0 0 40px rgba(255,215,0,0.18)"
            : "0 0 40px rgba(255,107,157,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[40px] leading-none mb-1">{info.icon}</div>
        <div
          id="orb-prize-title"
          className="font-display font-bold text-[18px] mb-0.5 tracking-[1px]"
          style={{ color: info.color }}
        >
          {isGalleta ? "GALLETA DE LA FORTUNA" : "CAJA MISTERIOSA"}
        </div>
        <p className="font-mono text-[11px] text-[var(--txt3)] mb-3 tracking-[1px]">
          {isGalleta ? "Tu mensaje místico" : "Sobre de la vida"}
        </p>

        {isGalleta && fortune && (
          <>
            {category && (
              <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-[var(--mystikS)] border border-[var(--mystik)] mb-3 text-[12px]">
                <span>{category.emoji}</span>
                <span className="font-mono text-[var(--mystik)]">
                  {category.name}
                </span>
              </div>
            )}
            <div className="p-3 bg-[var(--bg3)] border border-[var(--border)] rounded-lg mb-3 text-left">
              <p className="text-[14px] text-[var(--txt)] leading-[1.65] italic">
                &ldquo;{fortune}&rdquo;
              </p>
            </div>
            <div className="mb-4">
              <div className="font-mono text-[10px] text-[var(--txt3)] mb-0.5">
                NÚMERO DE SUERTE
              </div>
              <div className="font-display font-bold text-[28px] text-[var(--gold)]">
                {luckNumber}
              </div>
            </div>
          </>
        )}

        {!isGalleta && sobreText && (
          <div className="mb-4 text-left">
            <div className="text-center mb-2">
              <span className="text-[36px]">{envelopeOpen ? "✉️" : "📨"}</span>
              <div className="font-mono text-[11px] font-bold text-[var(--rose)] tracking-[2px] mt-1">
                SOBRE DE LA VIDA
              </div>
            </div>
            <div
              className={`p-3 rounded-lg border transition-all duration-500 ${
                envelopeOpen ? "opacity-100" : "opacity-0"
              }`}
              style={{
                borderColor: "rgba(255,107,157,0.35)",
                background: "rgba(255,107,157,0.06)",
              }}
            >
              <p className="text-[14px] text-[var(--txt)] leading-[1.6]">
                {sobreText}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-[var(--txt3)] font-mono text-center">
              Mensaje simbólico con buena energía
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--txt2)] font-mono text-[11px] tracking-[1.5px]"
          >
            CERRAR
          </button>
          <button
            type="button"
            onClick={() => {
              const text = isGalleta ? fortune : sobreText;
              if (navigator.share && text) {
                navigator.share({ title: "Mi premio Mystika", text });
              }
            }}
            className="flex-1 py-2.5 rounded-lg font-mono text-[11px] tracking-[1.5px] text-[var(--bg0)]"
            style={{
              background: isGalleta
                ? "linear-gradient(135deg,var(--gold),#ffdd55)"
                : "linear-gradient(135deg,var(--rose),#ff8ab0)",
            }}
          >
            COMPARTIR
          </button>
        </div>
      </div>
    </div>
  );
}
