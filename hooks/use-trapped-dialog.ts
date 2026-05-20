"use client";

import { useEffect, useRef } from "react";

/**
 * Focus trap, Escape to close, restore focus to previously focused element.
 * Attach the returned ref to the dialog panel element (the one that stops propagation).
 */
export function useTrappedDialog(isOpen: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const prevActive = document.activeElement as HTMLElement | null;

    const focusables = () =>
      [
        ...panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          !el.getAttribute("aria-hidden") &&
          el.tabIndex !== -1,
      );

    const els = focusables();
    const first = els[0];
    const last = els[els.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || els.length === 0) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (prevActive?.focus) prevActive.focus();
    };
  }, [isOpen]);

  return panelRef;
}
