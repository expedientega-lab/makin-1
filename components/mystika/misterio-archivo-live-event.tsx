"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MisterioArchivoPanel } from "./misterio-archivo-panel";

interface MisterioArchivoLiveEventProps {
  onClose: () => void;
}

export function MisterioArchivoLiveEvent({ onClose }: MisterioArchivoLiveEventProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archivo-live-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(4,2,10,0.88)] backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar evento del archivo"
      />

      <div
        className="relative w-full max-w-2xl max-h-[min(92vh,820px)] rounded-2xl border overflow-hidden animate-[fadeup_0.35s_ease] flex flex-col"
        style={{
          background:
            "linear-gradient(160deg, rgba(179,136,255,0.1) 0%, rgba(8,5,14,0.98) 45%, rgba(12,8,22,0.99) 100%)",
          borderColor: "rgba(179,136,255,0.35)",
          boxShadow:
            "0 0 60px rgba(179,136,255,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes archivo-live-pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>

        <div
          className="h-[2px] w-full shrink-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--mystik), #00e5ff, var(--mystik), transparent)",
          }}
          aria-hidden
        />

        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[rgba(179,136,255,0.15)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--green)] shrink-0"
              style={{ animation: "archivo-live-pulse 1.4s ease-in-out infinite" }}
            />
            <span
              id="archivo-live-title"
              className="font-mono text-[10px] sm:text-[11px] font-black tracking-[0.28em] text-[var(--mystik)] truncate"
            >
              ARCHIVO · LIVE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-[var(--txt3)] hover:text-[var(--txt)] px-2 py-1 rounded border border-transparent hover:border-[var(--border)] transition-colors"
          >
            CERRAR
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5 overflow-y-auto flex-1">
          <MisterioArchivoPanel />
        </div>
      </div>
    </div>,
    document.body,
  );
}
