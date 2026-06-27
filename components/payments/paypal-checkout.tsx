"use client";

import { useEffect, useRef, useState } from "react";
import { waitForServerPaymentConfirmation } from "@/lib/payment-verify-client";

declare global {
  interface Window {
    paypal?: any;
  }
}

export type PaypalSuccessContext = {
  orderId: string;
  productId: string;
};

interface PaypalCheckoutProps {
  productId: string;
  amountUsd?: number;
  onSuccess: (ctx: PaypalSuccessContext) => void;
  onError: (message: string) => void;
  onCancel?: () => void;
}

const SDK_ATTR = "data-paypal-sdk-smart-buttons";

function loadPaypalScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[${SDK_ATTR}="true"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.paypal) resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const params = new URLSearchParams({
      "client-id": clientId,
      currency: "USD",
      intent: "capture",
      components: "buttons",
      locale: "es_ES",
      "enable-funding": "paypal,card",
      "disable-funding": "venmo,paylater",
    });

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.setAttribute(SDK_ATTR, "true");
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPal"));
    document.body.appendChild(script);
  });
}

export function PaypalCheckout({
  productId,
  amountUsd,
  onSuccess,
  onError,
  onCancel,
}: PaypalCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsCleanupRef = useRef<(() => void) | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onCancelRef = useRef(onCancel);
  const productIdRef = useRef(productId);
  const amountUsdRef = useRef(amountUsd);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    productIdRef.current = productId;
  }, [productId]);

  useEffect(() => {
    amountUsdRef.current = amountUsd;
  }, [amountUsd]);

  useEffect(() => {
    let active = true;

    const createOrder = async () => {
      const payload: { productId: string; amountUsd?: number } = {
        productId: productIdRef.current,
      };
      if (amountUsdRef.current !== undefined) {
        payload.amountUsd = amountUsdRef.current;
      }

      const resp = await fetch("/api/paypal/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok || !data.id) {
        const parts = [data.error, data.detail].filter(Boolean);
        throw new Error(
          parts.length ? parts.join(" — ") : "No se pudo crear la orden",
        );
      }
      return data.id as string;
    };

    const captureOrder = async (orderId: string) => {
      const resp = await fetch(`/api/paypal/orders/${orderId}/capture`, {
        method: "POST",
      });
      const data = await resp.json();
      const captured =
        data?.status === "COMPLETED" ||
        data?.purchase_units?.[0]?.payments?.captures?.[0]?.status ===
          "COMPLETED" ||
        data?.verified === true;
      if (!resp.ok || !captured) {
        throw new Error(data.error || "Pago no completado");
      }

      const confirmed = await waitForServerPaymentConfirmation(orderId);
      if (!confirmed.paid) {
        throw new Error(
          "El pago no fue confirmado en el servidor. Esperá unos segundos e intentá de nuevo.",
        );
      }

      onSuccessRef.current({
        orderId,
        productId: confirmed.productId ?? productIdRef.current,
      });
    };

    const init = async () => {
      try {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        if (!clientId) throw new Error("Falta NEXT_PUBLIC_PAYPAL_CLIENT_ID");

        await loadPaypalScript(clientId);
        if (!active || !window.paypal || !containerRef.current) return;

        buttonsCleanupRef.current?.();
        buttonsCleanupRef.current = null;
        containerRef.current.innerHTML = "";

        const paypalButtons = window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "black",
            shape: "rect",
            label: "pay",
            height: 48,
            tagline: false,
          },
          createOrder,
          onApprove: (data: { orderID: string }) => captureOrder(data.orderID),
          onCancel: () => onCancelRef.current?.(),
          onError: (err: unknown) =>
            onErrorRef.current(
              err instanceof Error ? err.message : String(err),
            ),
        });

        if (!paypalButtons.isEligible()) {
          onErrorRef.current("PayPal no esta disponible en este navegador.");
          return;
        }

        await paypalButtons.render(containerRef.current);
        buttonsCleanupRef.current = () => {
          try {
            paypalButtons.close();
          } catch {
            /* ignore */
          }
        };
      } catch (error) {
        onErrorRef.current(
          error instanceof Error ? error.message : "Error al iniciar el pago",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    init();
    return () => {
      active = false;
      buttonsCleanupRef.current?.();
      buttonsCleanupRef.current = null;
    };
  }, [productId, amountUsd]);

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-[var(--mystik)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-[var(--txt3)] font-mono tracking-[1px]">
            Preparando pago seguro...
          </span>
        </div>
      )}
      <div ref={containerRef} className="min-h-[48px] paypal-buttons-host" />
      <p className="text-[13px] text-[var(--txt3)] text-center leading-relaxed">
        Podés pagar con PayPal o tarjeta como invitado. Se abre la ventana
        segura de PayPal y te devuelve aquí al completar.
      </p>
    </div>
  );
}
