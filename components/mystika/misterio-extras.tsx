"use client";

import { useEffect, useState } from "react";
import {
  DONACION_CUSTOM_PRODUCT_ID,
  donacionPayCopy,
  donacionProductIdForAmount,
} from "@/lib/donacion-products";
import { MisterioFpsGame } from "./misterio-fps-game";

const DONACION_DAILY_PRIZES = [
  {
    amount: 2000,
    label: "Gran Premio",
    emoji: "👑",
    color: "#ffd700",
    glow: "rgba(255,215,0,0.45)",
  },
  {
    amount: 500,
    label: "Premio Mayor",
    emoji: "💎",
    color: "#00e5ff",
    glow: "rgba(0,229,255,0.4)",
  },
  {
    amount: 100,
    label: "Premio Diario",
    emoji: "💵",
    color: "#00ff9d",
    glow: "rgba(0,255,157,0.4)",
  },
];

const DONACION_TIERS = [
  { amount: 3, emoji: "✨", label: "Chispa", desc: "Una chispa de energía para el portal" },
  { amount: 5, emoji: "🌙", label: "Luna", desc: "Mantiene la frecuencia una noche más" },
  { amount: 10, emoji: "🔮", label: "Orbe", desc: "Potencia las visiones del archivo" },
  { amount: 20, emoji: "🛸", label: "Señal", desc: "Desbloquea transmisiones especiales" },
];

type DonacionPayHandler = (
  productId: string,
  title: string,
  description: string,
  price?: number,
) => void;

function parseCustomAmountInput(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  const amount = parseFloat(normalized);
  if (!normalized || Number.isNaN(amount)) return null;
  if (amount < 1 || amount > 9999) return null;
  return Math.round(amount * 100) / 100;
}

function openDonacionPay(amountUsd: number, onRequestPay?: DonacionPayHandler) {
  if (!onRequestPay) return;
  const productId = donacionProductIdForAmount(amountUsd);
  const { title, description } = donacionPayCopy(amountUsd);
  onRequestPay(productId, title, description, amountUsd);
}

export function MisterioJuegoPanel() {
  return <MisterioFpsGame />;
}

interface MisterioDonacionPanelProps {
  onRequestPay?: DonacionPayHandler;
}

export function MisterioDonacionPanel({ onRequestPay }: MisterioDonacionPanelProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [thanks, setThanks] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    const onSuccess = (event: Event) => {
      const detail = (event as CustomEvent<{ amount?: number }>).detail;
      if (typeof detail?.amount !== "number") return;
      setSelected(detail.amount);
      setThanks(true);
      window.setTimeout(() => {
        setThanks(false);
        setSelected(null);
      }, 5000);
    };

    window.addEventListener("mystika-donacion-success", onSuccess);
    return () => window.removeEventListener("mystika-donacion-success", onSuccess);
  }, []);

  const handleCustomDonate = () => {
    const amount = parseCustomAmountInput(customAmount);
    if (amount === null) {
      const normalized = customAmount.replace(",", ".").trim();
      const parsed = parseFloat(normalized);
      if (!normalized || Number.isNaN(parsed)) {
        setCustomError("Ingresá un monto válido.");
      } else if (parsed < 1) {
        setCustomError("El mínimo es USD 1.");
      } else {
        setCustomError("El máximo es USD 9.999.");
      }
      return;
    }

    setCustomError(null);
    setCustomAmount(String(amount));
    openDonacionPay(amount, onRequestPay);
  };

  return (
    <div
      className="rounded-2xl border p-6 sm:p-8 mb-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, rgba(255,215,0,0.08) 0%, rgba(8,5,14,0.96) 50%)",
        borderColor: "rgba(255,215,0,0.3)",
        boxShadow: "0 0 40px rgba(255,215,0,0.08)",
      }}
    >
      <div className="font-mono text-[10px] tracking-[3px] text-[#ffd700] mb-2">
        ✦ ENERGÍA PARA EL PORTAL
      </div>
      <h3 className="font-display font-black text-[22px] sm:text-[26px] text-[var(--txt)] mb-2">
        Doná y participá por premios increíbles
      </h3>
      <p className="text-[14px] sm:text-[15px] text-[var(--txt2)] leading-[1.85] mb-5 max-w-[560px]">
        Cada donación te incluye automáticamente en el sorteo diario del portal.
        Pagá con PayPal o tarjeta de débito/crédito como invitado. Además de
        mantener Mystika activo, competís todos los días por premios en efectivo
        reales.
      </p>

      <div
        className="rounded-xl border p-4 sm:p-5 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(8,5,14,0.95) 100%)",
          borderColor: "rgba(255,215,0,0.28)",
        }}
      >
        <div className="font-mono text-[10px] tracking-[3px] text-[#ffd700] mb-3 text-center">
          ✦ PREMIOS DIARIOS ✦
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DONACION_DAILY_PRIZES.map((prize) => (
            <div
              key={prize.amount}
              className="rounded-xl p-4 text-center relative overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: `1px solid ${prize.color}55`,
                boxShadow: `0 0 24px ${prize.glow}`,
              }}
            >
              <div className="text-2xl mb-1">{prize.emoji}</div>
              <div
                className="font-display font-black text-[24px] sm:text-[26px] leading-none mb-1"
                style={{ color: prize.color }}
              >
                ${prize.amount.toLocaleString("es-AR")}
              </div>
              <div className="font-mono text-[10px] tracking-[1px] text-[var(--txt3)]">
                {prize.label}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[12px] sm:text-[13px] text-[var(--txt2)] text-center mt-4 leading-[1.7]">
          <strong className="text-[#ffd700]">Al donar, ya estás participando.</strong>{" "}
          Todos los días se sortean USD 2.000, USD 500 y USD 100 entre quienes
          aportaron energía al portal.
        </p>
      </div>

      {thanks ? (
        <div
          className="text-center py-10 rounded-xl animate-[fadeup_0.4s_ease]"
          style={{
            background: "rgba(255,215,0,0.1)",
            border: "1px solid rgba(255,215,0,0.35)",
          }}
        >
          <div className="text-5xl mb-3">💫</div>
          <p className="font-display font-black text-[20px] text-[#ffd700] mb-2">
            ¡Ya estás participando!
          </p>
          <p className="text-[14px] text-[var(--txt2)] mb-2">
            Gracias por aportar ${selected?.toLocaleString("es-AR")} USD al portal Mystika.
          </p>
          <p className="text-[13px] text-[var(--txt2)] leading-[1.75] max-w-[360px] mx-auto">
            Tu donación te incluyó en el sorteo diario por{" "}
            <strong className="text-[#ffd700]">USD 2.000</strong>,{" "}
            <strong className="text-[#00e5ff]">USD 500</strong> y{" "}
            <strong className="text-[#00ff9d]">USD 100</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {DONACION_TIERS.map((tier) => (
            <button
              key={tier.amount}
              type="button"
              onClick={() => openDonacionPay(tier.amount, onRequestPay)}
              className="rounded-xl p-4 text-center transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
              style={{
                background: "rgba(255,215,0,0.06)",
                border: "1px solid rgba(255,215,0,0.25)",
              }}
            >
              <div className="text-2xl mb-1">{tier.emoji}</div>
              <div className="font-display font-black text-[18px] text-[#ffd700]">
                ${tier.amount}
              </div>
              <div className="font-mono text-[10px] tracking-[1px] text-[var(--mystik3)] mt-1">
                {tier.label}
              </div>
              <div className="font-mono text-[9px] tracking-[0.5px] text-[#ffd700]/80 mt-2 leading-tight">
                Participás por premios diarios
              </div>
            </button>
          ))}

          <div
            className="rounded-xl p-4 text-center col-span-2 sm:col-span-1"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.25)",
            }}
          >
            <div className="text-2xl mb-1">💫</div>
            <div className="font-mono text-[10px] tracking-[1px] text-[var(--mystik3)] mb-2">
              Tu monto
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="font-display font-black text-[16px] text-[#ffd700]">$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value.replace(/[^\d.,]/g, ""));
                  setCustomError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomDonate();
                }}
                className="w-full max-w-[88px] rounded-lg border bg-[rgba(8,5,14,0.85)] px-2 py-1.5 text-center font-display font-black text-[16px] text-[#ffd700] outline-none focus:border-[#ffd700]"
                style={{ borderColor: customError ? "#ff6b9d" : "rgba(255,215,0,0.35)" }}
                aria-label="Monto de donación personalizado en USD"
              />
            </div>
            <button
              type="button"
              onClick={handleCustomDonate}
              className="w-full rounded-lg py-1.5 font-mono text-[10px] tracking-[1px] text-[#ffd700] transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "rgba(255,215,0,0.14)",
                border: "1px solid rgba(255,215,0,0.35)",
              }}
            >
              Donar
            </button>
            <div className="font-mono text-[9px] tracking-[0.5px] text-[#ffd700]/80 mt-2 leading-tight">
              Participás por premios diarios
            </div>
            {customError && (
              <p className="font-mono text-[9px] text-[#ff6b9d] mt-1.5 leading-tight">
                {customError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
