"use client";

import { useEffect, useRef, useState } from "react";
import {
  activeTabStyle,
  getTabTheme,
  hoverTabStyle,
} from "@/lib/mystika-tab-themes";
import { prefetchDeseosStatus } from "@/lib/deseos-client-cache";
import { prefetchMensajeStatus } from "@/lib/mensaje-client-cache";

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
  { id: "botonrapido", label: "Rápido", emoji: "⚡" },
  { id: "llaves", label: "Llaves", emoji: "🔑" },
  { id: "ruleta", label: "Ruleta", emoji: "🎡" },
  { id: "cofres", label: "Cofres", emoji: "📦" },
  { id: "mensaje", label: "Mensaje", emoji: "💌" },
  { id: "misterio", label: "Misterio", emoji: "👽" },
];

export function isValidMystikaTab(tab: string): boolean {
  return tabs.some((t) => t.id === tab);
}

const TAB_NEON_STYLES = `
  @keyframes mystika-tab-led {
    0%, 100% { opacity: 0.65; filter: brightness(1); }
    50% { opacity: 1; filter: brightness(1.35); }
  }
  @keyframes mystika-tab-scan {
    0% { transform: translateX(-100%); opacity: 0; }
    15% { opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  @keyframes mystika-tab-pop {
    0% { transform: scale(0.96); }
    55% { transform: scale(1.03); }
    100% { transform: scale(1); }
  }
`;

type TabButtonProps = {
  tab: (typeof tabs)[number];
  isActive: boolean;
  size: "mobile" | "desktop";
  buttonRef?: (el: HTMLButtonElement | null) => void;
  onClick: () => void;
};

function TabButton({ tab, isActive, size, buttonRef, onClick }: TabButtonProps) {
  const theme = getTabTheme(tab.id);
  const baseClass = [
    "relative overflow-hidden border transition-all duration-300",
    "font-mono tracking-[1px]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)]",
    size === "mobile"
      ? "flex-shrink-0 flex flex-col items-center gap-2 py-4 px-3.5 rounded-xl text-[12px]"
      : "w-full py-[18px] px-2 rounded-xl text-[13px]",
  ].join(" ");

  return (
    <button
      id={`mystika-tab-${tab.id}`}
      ref={buttonRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls="mystika-main-panel"
      onClick={onClick}
      onPointerEnter={() => {
        if (tab.id === "deseos") prefetchDeseosStatus();
        if (tab.id === "mensaje") prefetchMensajeStatus();
      }}
      className={baseClass}
      style={{
        minWidth: size === "mobile" ? "84px" : undefined,
        ...(isActive
          ? activeTabStyle(theme)
          : {
              background: "var(--bg2)",
              borderColor: "var(--border)",
              color: "var(--txt2)",
            }),
        ...(isActive ? { animation: "mystika-tab-pop 0.35s cubic-bezier(0.34, 1.4, 0.64, 1)" } : {}),
      }}
      onMouseEnter={(e) => {
        if (isActive) return;
        Object.assign(e.currentTarget.style, hoverTabStyle(theme));
      }}
      onMouseLeave={(e) => {
        if (isActive) return;
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Barra LED superior */}
      {isActive && (
        <span
          className="absolute top-0 left-[12%] right-[12%] h-[2px] rounded-full pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
            boxShadow: `0 0 10px ${theme.accent}, 0 0 18px ${theme.glow}`,
            animation: "mystika-tab-led 1.6s ease-in-out infinite",
          }}
          aria-hidden
        />
      )}

      {/* Brillo lateral tipo xenon */}
      {isActive && (
        <span
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${theme.bg} 0%, transparent 70%)`,
          }}
          aria-hidden
        />
      )}

      {/* Scan line al activar */}
      {isActive && (
        <span
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
          aria-hidden
        >
          <span
            className="absolute top-0 bottom-0 w-[40%]"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.accent}35, transparent)`,
              animation: "mystika-tab-scan 2.8s ease-in-out infinite",
            }}
          />
        </span>
      )}

      <div
        className={[
          "relative z-[1] flex flex-col items-center gap-1.5",
          size === "desktop" ? "" : "",
        ].join(" ")}
      >
        <span
          className="leading-none transition-transform duration-300"
          style={{
            fontSize: size === "mobile" ? "22px" : "24px",
            filter: isActive
              ? `drop-shadow(0 0 8px ${theme.accent}) drop-shadow(0 0 14px ${theme.glow})`
              : "none",
            transform: isActive ? "scale(1.08)" : "scale(1)",
          }}
        >
          {tab.emoji}
        </span>
        <span
          className={
            size === "desktop"
              ? "w-full text-center leading-tight whitespace-nowrap"
              : "whitespace-nowrap"
          }
        >
          {tab.label}
        </span>
      </div>

      {/* Punto LED inferior */}
      {isActive && (
        <span
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full pointer-events-none"
          style={{
            background: theme.accent,
            boxShadow: `0 0 6px ${theme.accent}, 0 0 12px ${theme.glow}`,
            animation: "mystika-tab-led 1.2s ease-in-out infinite 0.2s",
          }}
          aria-hidden
        />
      )}
    </button>
  );
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

  return (
    <nav className="mb-7" aria-label="Secciones Mystika">
      <style>{TAB_NEON_STYLES}</style>

      <div className="relative lg:hidden" aria-hidden={isLargeScreen}>
        <div
          className="absolute left-0 top-0 bottom-1 w-6 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, var(--bg0), transparent)",
          }}
        />
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
          className="flex gap-2.5 overflow-x-auto pb-1"
          style={
            {
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            } as React.CSSProperties
          }
        >
          <div className="flex-shrink-0 w-4" />
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              size="mobile"
              buttonRef={(el) => {
                buttonRefs.current[tab.id] = el;
              }}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
          <div className="flex-shrink-0 w-4" />
        </div>

        <style>{`[data-tab-scroll]::-webkit-scrollbar { display: none; }`}</style>
      </div>

      <div
        className="hidden lg:grid lg:grid-cols-6 xl:grid-cols-11 gap-3"
        role="tablist"
        aria-label="Secciones Mystika"
        aria-hidden={!isLargeScreen}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            size="desktop"
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
}
