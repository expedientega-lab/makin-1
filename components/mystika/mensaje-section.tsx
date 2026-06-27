"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import type { UniversalResponse } from "@/lib/mensaje-universo-data";
import {
  MENSAJE_MAX_LENGTH,
  MENSAJE_UNLOCK_PRICE_USD,
  MENSAJE_UNLOCK_PRODUCT_ID,
} from "@/lib/mensaje-constants";
import {
  fetchMensajeStatus,
  hydrateMensajeFromCache,
  writeMensajeCache,
  type MensajeStatus,
} from "@/lib/mensaje-client-cache";

const particles = ["✦", "✧", "⋆", "·", "★", "☆", "✶", "✷"];

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function applyLockedStatus(
  status: MensajeStatus,
  setMessage: (m: string) => void,
  setResponse: (r: UniversalResponse | null) => void,
  setSent: (s: boolean) => void,
  setLockedUntil: (t: number | null) => void,
): boolean {
  if (!status.locked || !status.lockedUntil) return false;
  const until = new Date(status.lockedUntil).getTime();
  if (until <= Date.now()) return false;
  if (status.message) setMessage(status.message);
  if (status.response) setResponse(status.response);
  setSent(true);
  setLockedUntil(until);
  return true;
}

function MensajeUnlockCard({
  onUnlock,
  embedded = false,
}: {
  onUnlock: () => void;
  embedded?: boolean;
}) {
  return (
    <div
      className={embedded ? "pt-5 mt-5 border-t text-center" : "max-w-[400px] mx-auto rounded-xl border p-4 text-center"}
      style={
        embedded
          ? { borderColor: "rgba(255,215,0,0.2)" }
          : {
              borderColor: "rgba(255,215,0,0.35)",
              background:
                "linear-gradient(165deg, rgba(255,215,0,0.08) 0%, rgba(8,5,14,0.92) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }
      }
    >
      <p
        className={`font-mono tracking-[0.28em] text-[var(--gold3)] mb-2 ${embedded ? "text-[11px]" : "text-[9px]"}`}
      >
        DESBLOQUEO RÁPIDO
      </p>
      <p
        className={`text-[var(--txt)] leading-relaxed mb-1 ${embedded ? "text-[15px]" : "text-[13px]"}`}
      >
        ¿No querés esperar 24 horas?
      </p>
      <p
        className={`text-[var(--txt2)] leading-relaxed mb-4 ${embedded ? "text-[14px]" : "text-[12px]"}`}
      >
        Pagá{" "}
        <span className="text-[var(--gold)] font-semibold">
          ${MENSAJE_UNLOCK_PRICE_USD} USD
        </span>{" "}
        y el portal se abre al instante para otro mensaje.
      </p>
      <button
        type="button"
        onClick={onUnlock}
        className={`w-full rounded-lg font-mono tracking-[0.18em] font-black transition-all hover:brightness-110 active:scale-[0.98] ${embedded ? "py-3.5 text-[14px]" : "py-3 text-[12px]"}`}
        style={{
          background: "linear-gradient(135deg, #ffe566, #ffd700, #c9a227)",
          color: "#1a1205",
          boxShadow: "0 0 20px rgba(255,215,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        ⚡ DESBLOQUEAR — ${MENSAJE_UNLOCK_PRICE_USD} USD
      </button>
      <p
        className={`mt-3 text-[var(--txt3)] font-mono tracking-[0.08em] ${embedded ? "text-[11px]" : "text-[10px]"}`}
      >
        Pago seguro · un mensaje extra al confirmar
      </p>
    </div>
  );
}

interface MensajeSectionProps {
  onRequestPay?: (
    productId: string,
    title: string,
    description: string,
    price?: number,
  ) => void;
}

export function MensajeSection({ onRequestPay }: MensajeSectionProps) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState<UniversalResponse | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const syncedRef = useRef(false);

  useLayoutEffect(() => {
    const cached = hydrateMensajeFromCache();
    if (cached.message) setMessage(cached.message);
    if (cached.response) setResponse(cached.response);
    if (cached.lockedUntil) setLockedUntil(cached.lockedUntil);
    if (cached.sent) setSent(true);
  }, []);

  const syncFromServer = useCallback(async () => {
    const status = await fetchMensajeStatus();
    if (applyLockedStatus(status, setMessage, setResponse, setSent, setLockedUntil)) {
      return status;
    }
    setLockedUntil(null);
    if (!status.locked) {
      setSent(false);
      setResponse(null);
    }
    return status;
  }, []);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    void syncFromServer();
  }, [syncFromServer]);

  useEffect(() => {
    const onUnlock = () => {
      setLockedUntil(null);
      setSent(false);
      setResponse(null);
      setMessage("");
      setSubmitError(null);
      void syncFromServer();
    };
    window.addEventListener("mystika-mensaje-unlock", onUnlock);
    return () => window.removeEventListener("mystika-mensaje-unlock", onUnlock);
  }, [syncFromServer]);

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setSent(false);
        setResponse(null);
        setMessage("");
        setCountdown("");
        syncFromServer();
        return;
      }
      setCountdown(formatCountdown(remaining));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, syncFromServer]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleUnlockPay = () => {
    onRequestPay?.(
      MENSAJE_UNLOCK_PRODUCT_ID,
      "DESBLOQUEO — MENSAJE AL UNIVERSO",
      `Pagás $${MENSAJE_UNLOCK_PRICE_USD} USD para enviar otro mensaje al universo sin esperar las 24 horas del cooldown.`,
      MENSAJE_UNLOCK_PRICE_USD,
    );
  };

  const handleSend = async () => {
    if (!message.trim() || isSending || isLocked) return;

    setSubmitError(null);
    setIsSending(true);
    setShowParticles(true);

    try {
      const res = await fetch("/api/mensaje-universo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = (await res.json()) as MensajeStatus;

      if (applyLockedStatus(data, setMessage, setResponse, setSent, setLockedUntil)) {
        if (res.status === 429) {
          setSubmitError(
            data.reason === "ip_cooldown"
              ? "Desde esta conexión ya se envió un mensaje hoy. Volvé en 24 horas."
              : "Ya enviaste tu mensaje al universo. Solo podés enviar uno cada 24 horas.",
          );
        }
        return;
      }

      if (!res.ok) {
        setSubmitError(
          data.error === "cooldown"
            ? "Ya usaste tu mensaje de hoy. Esperá 24 horas."
            : "No se pudo enviar. Intentá de nuevo.",
        );
        return;
      }

      if (data.message && data.response) {
        setMessage(data.message);
        setResponse(data.response);
        setSent(true);
        if (data.lockedUntil) {
          setLockedUntil(new Date(data.lockedUntil).getTime());
        }
        writeMensajeCache(data);
      }
    } catch {
      setSubmitError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      <div className="text-center py-1.5 pb-5">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-3">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          PORTAL DE DESEOS
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-3"
          style={{ fontSize: "clamp(28px,7vw,46px)" }}
        >
          Mensaje al{" "}
          <span
            className="text-[var(--mystik)]"
            style={{ textShadow: "0 0 24px rgba(179,136,255,.6)" }}
          >
            Universo
          </span>
        </h2>
        <p className="text-[13px] text-[var(--txt2)] max-w-[360px] mx-auto leading-[1.8] font-light">
          Escribí lo que deseás, necesitás o soñás. El cosmos escucha —{" "}
          <span className="text-[var(--mystik)] font-medium">un mensaje cada 24 horas</span>.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-700"
            style={{
              background:
                "radial-gradient(circle, rgba(179,136,255,0.3) 0%, rgba(179,136,255,0.05) 70%)",
              boxShadow: sent
                ? "0 0 60px rgba(179,136,255,0.7), 0 0 120px rgba(179,136,255,0.3)"
                : "0 0 30px rgba(179,136,255,0.3)",
              animation: isSending ? "pulse 0.6s ease-in-out infinite" : undefined,
            }}
          >
            {isSending ? "🌀" : sent ? "💌" : "🌌"}
          </div>
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((p, i) => (
                <span
                  key={i}
                  className="absolute text-[var(--mystik)] font-bold"
                  style={{
                    fontSize: `${8 + (i % 4) * 2}px`,
                    top: `${(i * 17) % 100}%`,
                    left: `${(i * 23) % 100}%`,
                    animation: `fadeup ${0.8 + (i % 3) * 0.2}s ease forwards`,
                    animationDelay: `${i * 0.12}s`,
                    opacity: 0.9,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLocked && countdown && (
        <div
          className="max-w-[440px] mx-auto mb-5 rounded-xl border p-5 text-center"
          style={{
            borderColor: "rgba(179,136,255,0.35)",
            background: "rgba(179,136,255,0.08)",
          }}
        >
          <p className="font-mono text-[11px] tracking-[3px] text-[var(--mystik3)] mb-2">
            PRÓXIMO MENSAJE EN
          </p>
          <p
            className="font-mono text-[32px] font-black tabular-nums text-[var(--mystik)]"
            style={{ textShadow: "0 0 20px rgba(179,136,255,0.4)" }}
          >
            {countdown}
          </p>
          <p className="text-[13px] text-[var(--txt3)] mt-2 leading-relaxed">
            El portal registra un mensaje por persona cada 24 horas. Volvé cuando el
            contador llegue a cero.
          </p>
          {onRequestPay && (
            <MensajeUnlockCard embedded onUnlock={handleUnlockPay} />
          )}
        </div>
      )}

      {!sent ? (
        <div className="animate-[fadeup_0.3s_ease]">
          <div
            className="relative rounded-xl border overflow-hidden mb-4 transition-all"
            style={{
              borderColor: message.trim() ? "rgba(179,136,255,0.5)" : "var(--border)",
              boxShadow: message.trim() ? "0 0 20px rgba(179,136,255,0.1)" : "none",
              background: "var(--bg2)",
            }}
          >
            <div className="px-4 pt-3 pb-1">
              <label className="font-mono text-[9px] tracking-[3px] text-[var(--mystik3)]">
                TU MENSAJE AL UNIVERSO
              </label>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribí tu deseo, tu sueño, lo que necesitás que el universo escuche hoy..."
              maxLength={MENSAJE_MAX_LENGTH}
              rows={5}
              className="w-full px-4 pb-4 pt-1 bg-transparent resize-none outline-none text-[14px] text-[var(--txt)] leading-[1.7] placeholder:text-[var(--txt3)]"
              style={{ fontFamily: "inherit" }}
              disabled={isSending || isLocked}
            />
            <div className="px-4 pb-2 flex justify-end">
              <span className="text-[10px] text-[var(--txt3)] font-mono">
                {message.length}/{MENSAJE_MAX_LENGTH}
              </span>
            </div>
          </div>

          <p className="text-center text-[11px] text-[var(--txt3)] mb-5 leading-relaxed">
            ✦ Un mensaje cada 24 h · validado en el servidor ✦
          </p>

          {submitError && (
            <p className="text-center text-[12px] text-[#ff6b9d] mb-4 font-mono">
              {submitError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || isSending || isLocked}
            className="w-full py-4 rounded-xl font-mono text-[13px] tracking-[3px] font-black transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: message.trim()
                ? "linear-gradient(135deg, rgba(179,136,255,0.2) 0%, rgba(179,136,255,0.08) 100%)"
                : "var(--bg2)",
              border: `2px solid ${message.trim() ? "var(--mystik)" : "var(--border)"}`,
              boxShadow: message.trim() ? "0 0 28px rgba(179,136,255,0.25)" : "none",
              color: message.trim() ? "var(--mystik)" : "var(--txt3)",
            }}
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--mystik)] border-t-transparent rounded-full animate-spin" />
                <span>ENVIANDO AL COSMOS...</span>
              </>
            ) : isLocked ? (
              <span>ESPERÁ {countdown || "24:00:00"}</span>
            ) : (
              <>
                <span className="text-xl">🌌</span>
                <span>ENVIAR AL UNIVERSO</span>
              </>
            )}
          </button>
        </div>
      ) : (
        response && (
          <div
            className="animate-[fadeup_0.5s_ease] rounded-xl border p-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(179,136,255,0.1) 0%, rgba(179,136,255,0.03) 100%)",
              borderColor: "rgba(179,136,255,0.4)",
              boxShadow: "0 0 40px rgba(179,136,255,0.15)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent, var(--mystik), transparent)",
              }}
            />

            <div className="mb-5 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              <div className="font-mono text-[8px] tracking-[3px] text-[var(--txt3)] mb-1.5">
                TU MENSAJE
              </div>
              <p className="text-[12px] text-[var(--txt3)] italic leading-relaxed line-clamp-3">
                &ldquo;{message}&rdquo;
              </p>
            </div>

            <div className="font-display font-black text-[20px] text-[var(--mystik)] tracking-[1px] mb-3 text-center">
              {response.title}
            </div>

            <p className="text-[14px] text-[var(--txt)] leading-[1.8] mb-4 text-center">
              {response.message}
            </p>

            <div
              className="p-3 rounded-lg text-center mb-5"
              style={{
                background: "rgba(179,136,255,0.08)",
                border: "1px solid rgba(179,136,255,0.2)",
              }}
            >
              <p className="text-[13px] text-[var(--mystik)] font-medium italic">
                ✦ {response.extra} ✦
              </p>
            </div>

            <div
              className="w-full py-3 rounded-lg font-mono text-[11px] tracking-[2px] text-center text-[var(--txt3)] border border-[var(--border)] bg-[var(--bg3)] mb-4"
            >
              {isLocked ? (
                <>
                  Próximo mensaje disponible en{" "}
                  <span className="text-[var(--mystik)] font-bold tabular-nums">
                    {countdown || "24:00:00"}
                  </span>
                </>
              ) : (
                "Podés enviar un nuevo mensaje al universo"
              )}
            </div>

          </div>
        )
      )}
    </div>
  );
}
