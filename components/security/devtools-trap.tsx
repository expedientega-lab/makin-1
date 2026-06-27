"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isLikelyMobileScreenshotBlink,
  isMobileDevice,
  isScreenshotKeyboardEvent,
  pasteContainsImage,
} from "@/lib/screenshot-trap-detect";
import {
  isAutomatedBrowser,
  isDevToolsKeyboardEvent,
  isExtractionKeyboardEvent,
} from "@/lib/intrusion-detect";

type Phase = "hidden" | "detected" | "blocking" | "preview" | "done";
type TrapReason = "devtools" | "screenshot";

const SIZE_THRESHOLD = 160;
const CHECK_MS = 700;

export function DevToolsTrap() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [displayIp, setDisplayIp] = useState("···.···.···.···");
  const triggeredRef = useRef(false);
  const mobileHideAtRef = useRef(0);

  const resetTrap = useCallback(() => {
    triggeredRef.current = false;
    mobileHideAtRef.current = 0;
    setPhase("hidden");
    setDisplayIp("···.···.···.···");
  }, []);

  const triggerTrap = useCallback(
    async (reason: TrapReason = "devtools") => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      setPhase("detected");
      window.setTimeout(() => setPhase("blocking"), 2200);

      let exempt = false;
      try {
        const resp = await fetch("/api/security/block", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });
        const data = await resp.json();
        if (data.ip) setDisplayIp(data.ip);
        exempt = Boolean(data.exempt || data.preview || data.dev);
      } catch {
        // seguir con el susto aunque falle la red
      }

      if (exempt) {
        setPhase("preview");
        window.setTimeout(resetTrap, 7000);
        return;
      }

      window.setTimeout(() => {
        setPhase("done");
        window.location.replace(
          window.location.pathname + window.location.search,
        );
      }, 2800);
    },
    [resetTrap],
  );

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;

    if (isAutomatedBrowser()) {
      void triggerTrap("devtools");
      return;
    }

    const detectBySize = () => {
      const wDiff = window.outerWidth - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      return wDiff > SIZE_THRESHOLD || hDiff > SIZE_THRESHOLD;
    };

    const detectByDebugger = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      return performance.now() - start > 120;
    };

    const interval = window.setInterval(() => {
      if (triggeredRef.current) return;
      if (detectBySize() || detectByDebugger()) {
        void triggerTrap("devtools");
      }
    }, CHECK_MS);

    const onKeyDown = (e: KeyboardEvent) => {
      if (triggeredRef.current) return;

      if (isScreenshotKeyboardEvent(e) || isExtractionKeyboardEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
        void triggerTrap("screenshot");
        return;
      }

      if (isDevToolsKeyboardEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
        void triggerTrap("devtools");
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (triggeredRef.current) return
      if (isScreenshotKeyboardEvent(e) || isExtractionKeyboardEvent(e)) {
        e.preventDefault()
        void triggerTrap("screenshot");
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      if (triggeredRef.current) return;
      if (pasteContainsImage(e.clipboardData)) {
        e.preventDefault();
        void triggerTrap("screenshot");
      }
    };

    const onCopy = (e: ClipboardEvent) => {
      if (triggeredRef.current) return;
      e.preventDefault();
      void triggerTrap("screenshot");
    };

    const onCut = (e: ClipboardEvent) => {
      if (triggeredRef.current) return;
      e.preventDefault();
      void triggerTrap("screenshot");
    };

    const onBeforePrint = () => {
      if (triggeredRef.current) return;
      void triggerTrap("screenshot");
    };

    const onDragStart = (e: DragEvent) => {
      if (triggeredRef.current) return;
      e.preventDefault();
      void triggerTrap("screenshot");
    };

    const onSelectStart = (e: Event) => {
      if (triggeredRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
    };

    const onVisibilityChange = () => {
      if (triggeredRef.current || !isMobileDevice()) return;

      if (document.visibilityState === "hidden") {
        mobileHideAtRef.current = Date.now();
        return;
      }

      if (document.visibilityState !== "visible" || !mobileHideAtRef.current) {
        return;
      }

      const hiddenMs = Date.now() - mobileHideAtRef.current;
      mobileHideAtRef.current = 0;

      if (isLikelyMobileScreenshotBlink(hiddenMs)) {
        void triggerTrap("screenshot");
      }
    };

    const onPageHide = () => {
      if (triggeredRef.current || !isMobileDevice()) return;
      mobileHideAtRef.current = Date.now();
    };

    const onPageShow = () => {
      if (triggeredRef.current || !isMobileDevice()) return;
      if (!mobileHideAtRef.current) return;

      const hiddenMs = Date.now() - mobileHideAtRef.current;
      mobileHideAtRef.current = 0;

      if (isLikelyMobileScreenshotBlink(hiddenMs)) {
        void triggerTrap("screenshot");
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("paste", onPaste, true);
    window.addEventListener("copy", onCopy, true);
    window.addEventListener("cut", onCut, true);
    window.addEventListener("dragstart", onDragStart, true);
    window.addEventListener("selectstart", onSelectStart, true);
    window.addEventListener("beforeprint", onBeforePrint);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("paste", onPaste, true);
      window.removeEventListener("copy", onCopy, true);
      window.removeEventListener("cut", onCut, true);
      window.removeEventListener("dragstart", onDragStart, true);
      window.removeEventListener("selectstart", onSelectStart, true);
      window.removeEventListener("beforeprint", onBeforePrint);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [triggerTrap]);

  if (phase === "hidden") return null;

  const isPreview = phase === "preview";

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black"
      style={{ fontFamily: "var(--font-share-tech), monospace" }}
      role="alert"
      aria-live="assertive"
    >
      <style>{`
        @keyframes mk-trap-shake {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-8px, 4px) rotate(-1deg); }
          20% { transform: translate(8px, -4px) rotate(1deg); }
          30% { transform: translate(-6px, -6px); }
          40% { transform: translate(6px, 6px); }
          50% { transform: translate(-4px, 2px); }
          60% { transform: translate(4px, -2px); }
        }
        @keyframes mk-trap-flash {
          0%, 100% { background: #000; }
          50% { background: #1a0000; }
        }
        @keyframes mk-trap-text {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        .mk-trap-root { animation: mk-trap-flash 0.15s infinite; }
        .mk-trap-shake { animation: mk-trap-shake 0.4s infinite; }
        .mk-trap-hero { animation: mk-trap-text 0.8s infinite; }
      `}</style>

      <div className="mk-trap-root absolute inset-0" />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.12) 2px, rgba(255,0,0,0.12) 4px)",
        }}
      />

      <div className="mk-trap-shake relative z-10 max-w-3xl px-6 text-center">
        <p className="mb-3 text-[11px] tracking-[8px] text-red-700">
          ◈ ALERTA DE INTRUSIÓN ◈
        </p>

        <h1 className="mk-trap-hero mb-4 text-3xl font-black leading-none tracking-wider text-red-500 sm:text-7xl">
          TE
          <br />
          DETECTAMOS
        </h1>

        <p className="mb-6 text-lg text-red-400 sm:text-2xl">
          No inspecciones lo que no te pertenece.
        </p>

        <div
          className="mx-auto mb-6 max-w-lg border-2 border-red-600 bg-red-950/60 p-5 text-left text-[13px] text-red-300"
          style={{ boxShadow: "0 0 60px rgba(255,0,0,0.45)" }}
        >
          <p className="mb-2 animate-pulse text-red-500">
            ▸ RASTREANDO ORIGEN...
          </p>
          <p className="mb-1">
            IP: <span className="text-white">{displayIp}</span>
          </p>
          <p className="mb-1">COORDENADAS: REGISTRADAS</p>
          <p className="mb-1">SESIÓN: MARCADA COMO HOSTIL</p>
          {phase === "blocking" || phase === "done" ? (
            <p className="mt-3 text-red-500">
              {isPreview
                ? "▸ MODO PRUEBA — IP LOCAL EXENTA"
                : "▸ BLOQUEANDO ACCESO PERMANENTE..."}
            </p>
          ) : null}
        </div>

        {isPreview ? (
          <div className="mb-4 space-y-3">
            <p className="text-[13px] tracking-[2px] text-amber-400">
              MODO PRUEBA: tu IP local no fue bloqueada.
            </p>
            <button
              type="button"
              onClick={resetTrap}
              className="rounded border border-amber-700/50 bg-amber-950/40 px-4 py-2 text-[11px] tracking-[3px] text-amber-300"
            >
              CERRAR PRUEBA
            </button>
          </div>
        ) : (
          <p className="text-[12px] tracking-[4px] text-red-800">
            EL PORTAL MYSTIKA NO PERDONA A LOS CURIOSOS
          </p>
        )}
      </div>
    </div>
  );
}
