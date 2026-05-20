"use client";

import { useEffect, useRef, useState } from "react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "inicio", label: "Inicio", emoji: "🏠" },
  { id: "orbe", label: "El Orbe", emoji: "🔮" },
  { id: "galleta", label: "Fortuna", emoji: "🥠" },
  { id: "deseos", label: "3 Deseos", emoji: "✨" },
  { id: "jackpot", label: "Jackpot", emoji: "💎" },
  { id: "llaves", label: "Llaves", emoji: "🔑" },
  { id: "ruleta", label: "Ruleta", emoji: "🎡" },
  { id: "cofres", label: "Cofres", emoji: "📦" },
  { id: "mensaje", label: "Mensaje", emoji: "💌" },
  { id: "misterio", label: "Misterio", emoji: "👽" },
];

export function isValidMystikaTab(tab: string): boolean {
  return tabs.some((t) => t.id === tab);
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLargeScreen(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Auto-scroll el tab activo al centro cuando cambia
  useEffect(() => {
    const container = scrollRef.current;
    const btn = buttonRefs.current[activeTab];
    if (!container || !btn) return;

    const containerW = container.offsetWidth;
    const btnLeft = btn.offsetLeft;
    const btnW = btn.offsetWidth;
    const target = btnLeft - containerW / 2 + btnW / 2;

    container.scrollTo({ left: target, behavior: "smooth" });
  }, [activeTab]);

  const tabClass = (id: string) => {
    const isActive = activeTab === id;
    return [
      "flex-shrink-0 flex flex-col items-center gap-1.5",
      "py-3.5 px-3 rounded-xl border transition-all duration-200",
      "font-mono text-[11px] tracking-[1px]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mystik)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)]",
      isActive
        ? "bg-[var(--mystikS)] border-[var(--mystik)] text-[var(--mystik)] shadow-[0_0_16px_rgba(179,136,255,0.22)]"
        : "bg-[var(--bg2)] border-[var(--border)] text-[var(--txt2)] hover:border-[var(--borderH)] hover:bg-[var(--bg3)]",
    ].join(" ");
  };

  return (
    <nav className="mb-7" aria-label="Secciones Mystika">
      {/* ── MOBILE / TABLET: fila con scroll horizontal ── */}
      <div className="relative lg:hidden" aria-hidden={isLargeScreen}>
        {/* Fade izquierda */}
        <div
          className="absolute left-0 top-0 bottom-1 w-6 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, var(--bg0), transparent)",
          }}
        />
        {/* Fade derecha — hint visual de que hay más */}
        <div
          className="absolute right-0 top-0 bottom-1 w-10 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, var(--bg0), transparent)",
          }}
        />

        <div
          ref={scrollRef}
          data-tab-scroll
          role="tablist"
          aria-orientation="horizontal"
          className="flex gap-2 overflow-x-auto pb-1"
          style={
            {
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            } as React.CSSProperties
          }
        >
          {/* Padding invisible para que el primer y último tab queden bien centrados */}
          <div className="flex-shrink-0 w-4" />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`mystika-tab-${tab.id}`}
              ref={(el) => {
                buttonRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="mystika-main-panel"
              onClick={() => onTabChange(tab.id)}
              className={tabClass(tab.id)}
              style={{ minWidth: "72px" }}
            >
              <span className="text-[20px] leading-none">{tab.emoji}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
          <div className="flex-shrink-0 w-4" />
        </div>

        {/* Ocultar scrollbar en Webkit */}
        <style>{`
          [data-tab-scroll]::-webkit-scrollbar { display: none; }
        `}</style>
      </div>

      {/* ── DESKTOP: grilla ── */}
      <div
        className="hidden lg:grid lg:grid-cols-10 gap-2.5"
        role="tablist"
        aria-label="Secciones Mystika"
        aria-hidden={!isLargeScreen}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="mystika-main-panel"
              onClick={() => onTabChange(tab.id)}
              className={[
                "w-full py-4 px-3 rounded-xl border transition-all duration-200",
                "font-mono text-[12px] tracking-[1px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mystik)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)]",
                isActive
                  ? "bg-[var(--mystikS)] border-[var(--mystik)] text-[var(--mystik)] shadow-[0_0_16px_rgba(179,136,255,0.22)]"
                  : "bg-[var(--bg2)] border-[var(--border)] text-[var(--txt2)] hover:border-[var(--borderH)] hover:bg-[var(--bg3)]",
              ].join(" ")}
            >
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[22px] leading-none">{tab.emoji}</span>
                <span className="truncate">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
