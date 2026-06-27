"use client";

import { useState } from "react";
import { PaypalCheckout, type PaypalSuccessContext } from "@/components/payments/paypal-checkout";
import { useTrappedDialog } from "@/hooks/use-trapped-dialog";

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Usuario cerró el modal (cancelar, backdrop, Escape) sin pagar */
  onDismiss?: () => void;
  /** PayPal cancelado en su ventana */
  onPayPalCancel?: () => void;
  /** Error de red, orden o captura — el modal sigue abierto */
  onPaymentError?: (message: string) => void;
  onPaymentSuccess: (ctx: PaypalSuccessContext) => void;
  productId?: string;
  title?: string;
  description?: string;
  price?: number;
}

export function PayModal({
  isOpen,
  onClose,
  onDismiss,
  onPayPalCancel,
  onPaymentError,
  onPaymentSuccess,
  productId = "mystika-orbe",
  title = "Revelar tu Destino",
  description = "Por solo $1 accedes al portal mistico y descubres tu fortuna",
  price = 1,
}: PayModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onDismiss?.();
    onClose();
  };

  const panelRef = useTrappedDialog(isOpen, handleClose);

  if (!isOpen) return null;

  const isOrbe = productId === "mystika-orbe";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(5,3,12,0.85)] backdrop-blur-md" />

      {/* Modal */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mystika-pay-modal-title"
        className="relative w-full sm:max-w-[420px] max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: "linear-gradient(160deg, #130d22 0%, #0d0818 100%)",
          border: "1px solid rgba(179,136,255,0.25)",
          boxShadow:
            "0 0 60px rgba(179,136,255,0.15), 0 -4px 40px rgba(10,6,24,0.9)",
          animation: "popin 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--mystik), var(--gold), var(--mystik), transparent)",
          }}
        />

        {/* Corner stars decoration */}
        <div className="absolute top-4 left-4 text-[var(--mystik3)] text-[10px] opacity-50 select-none">
          ✦
        </div>
        <div className="absolute top-4 right-4 text-[var(--mystik3)] text-[10px] opacity-50 select-none">
          ✦
        </div>

        <div className="p-6 pb-4">
          {/* Header */}
          <div className="text-center mb-6">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
              style={{
                background:
                  "radial-gradient(circle, rgba(179,136,255,0.25) 0%, rgba(179,136,255,0.05) 70%)",
                boxShadow: "0 0 30px rgba(179,136,255,0.2)",
                border: "1px solid rgba(179,136,255,0.2)",
              }}
            >
              🔮
            </div>

            {!isOrbe && (
              <div className="font-mono text-[11px] tracking-[4px] text-[var(--mystik3)] mb-2">
                PORTAL DE PAGO SEGURO
              </div>
            )}
            <div
              id="mystika-pay-modal-title"
              className={[
                "font-display font-black text-[var(--txt)] leading-tight",
                isOrbe
                  ? "text-[28px] tracking-[0.12em] text-[var(--mystik)] mb-3"
                  : "text-[26px] tracking-[1px] mb-2",
              ].join(" ")}
            >
              {title}
            </div>
            {description && (
              <p
                className={[
                  "leading-relaxed max-w-[320px] mx-auto",
                  isOrbe
                    ? "text-[11px] text-[var(--txt3)] font-mono"
                    : "text-[14px] text-[var(--txt2)]",
                ].join(" ")}
              >
                {description}
              </p>
            )}
          </div>

          {/* Price display */}
          <div
            className="flex items-center justify-between p-4 rounded-xl mb-5"
            style={{
              background: "rgba(255,215,0,0.07)",
              border: "1px solid rgba(255,215,0,0.2)",
            }}
          >
            <div>
              <div className="font-mono text-[11px] tracking-[3px] text-[var(--txt2)] mb-1">
                TOTAL A PAGAR
              </div>
              <div className="font-mono text-[11px] tracking-[1px] text-[var(--txt3)]">
                PAGO ÚNCO · SIN SUSCRIPCIÓN
              </div>
            </div>
            <div className="text-right">
              <div
                className="font-display font-black leading-none"
                style={{
                  fontSize: "42px",
                  color: "var(--gold)",
                  textShadow: "0 0 20px rgba(255,215,0,0.4)",
                }}
              >
                <span style={{ fontSize: "20px", verticalAlign: "super" }}>
                  $
                </span>
                {Number.isInteger(price) ? price : price.toFixed(2)}
              </div>
              <div className="font-mono text-[11px] text-[var(--gold3)]">
                USD
              </div>
            </div>
          </div>

          {/* What you get */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[var(--green)] text-base font-bold">✓</span>
              <span className="text-[13px] text-[var(--txt)] font-medium">
                Acceso inmediato
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[var(--green)] text-base font-bold">✓</span>
              <span className="text-[13px] text-[var(--txt)] font-medium">
                Pago 100% seguro
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[var(--green)] text-base font-bold">✓</span>
              <span className="text-[13px] text-[var(--txt)] font-medium">
                Sin datos guardados
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-5"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(179,136,255,0.2), transparent)",
            }}
          />

          {/* Error */}
          {error && (
            <div
              className="rounded-lg p-3 mb-4 text-center"
              style={{
                background: "rgba(255,107,157,0.1)",
                border: "1px solid rgba(255,107,157,0.3)",
              }}
            >
              <span className="text-[var(--rose)] text-[14px]">{error}</span>
            </div>
          )}

          {/* PayPal */}
          <PaypalCheckout
            productId={productId}
            amountUsd={
              productId === "mystika-donacion-custom" ? price : undefined
            }
            onError={(message) => {
              setError(message);
              onPaymentError?.(message);
            }}
            onCancel={() => onPayPalCancel?.()}
            onSuccess={(ctx) => {
              setError(null);
              onPaymentSuccess(ctx);
            }}
          />
        </div>

        {/* Footer sticky */}
        <div
          className="sticky bottom-0 px-6 pb-5 pt-3"
          style={{
            background: "linear-gradient(to top, #0d0818 70%, transparent)",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 rounded-xl font-mono text-[13px] tracking-[2px] transition-all"
            style={{
              color: "var(--txt3)",
              border: "1px solid rgba(179,136,255,0.15)",
              background: "rgba(179,136,255,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(179,136,255,0.35)";
              e.currentTarget.style.color = "var(--txt2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(179,136,255,0.15)";
              e.currentTarget.style.color = "var(--txt3)";
            }}
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}
