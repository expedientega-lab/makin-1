"use client";

import { useState, useEffect, useCallback } from "react";
import { displayPrizes } from "@/lib/mystika-data";
import type { OrbePrizeType } from "@/lib/orbe-data";
import { DevTestButton } from "./dev-test-button";
import { OrbCasinoStage } from "./orb-casino-stage";
import { OrbMarqueeLights } from "./orb-marquee-lights";
import { OrbLiveFeed } from "./orb-live-feed";

interface OrbitalItem {
  id: number;
  ico: string;
  nm: string;
  col: string;
  glow: string;
  angle: number;
  speed: number;
  /** Radio horizontal en % del contenedor */
  radiusPct: number;
  scale: number;
}

interface MysticOrbProps {
  onPlay: () => void;
  /** Tras pagar (o modo prueba): buscar premio dentro del orbe. */
  spinReady?: boolean;
  onSpinConsumed?: () => void;
  onPrizeWon?: (prizeType: OrbePrizeType) => void;
  /** Solo localhost en desarrollo — bypass de pago para testear. */
  onDevTestPlay?: () => void;
}

// ── Pool de ganadores para las notificaciones ──────────────────────────
const WIN_POOL = [
  {
    user: "@lucia.m",
    flag: "🇦🇷",
    prize: "$1,000 USD",
    prizeIco: "💵",
    color: "#00ff9d",
  },
  {
    user: "@carlos.v",
    flag: "🇲🇽",
    prize: "$100 USD",
    prizeIco: "💵",
    color: "#00e5ff",
  },
  {
    user: "@maria.g",
    flag: "🇨🇴",
    prize: "Bitcoin",
    prizeIco: "₿",
    color: "#f7931a",
  },
  {
    user: "@diego.s",
    flag: "🇨🇱",
    prize: "Caja Misteriosa",
    prizeIco: "📦",
    color: "#ff6b9d",
  },
  {
    user: "@valentina.r",
    flag: "🇦🇷",
    prize: "$100 USD",
    prizeIco: "💵",
    color: "#00e5ff",
  },
  {
    user: "@mateo.f",
    flag: "🇵🇪",
    prize: "$1,000 USD",
    prizeIco: "💵",
    color: "#00ff9d",
  },
  {
    user: "@sofia.b",
    flag: "🇺🇾",
    prize: "Bitcoin",
    prizeIco: "₿",
    color: "#f7931a",
  },
  {
    user: "@nicolas.h",
    flag: "🇧🇷",
    prize: "Caja Misteriosa",
    prizeIco: "📦",
    color: "#ff6b9d",
  },
  {
    user: "@camila.w",
    flag: "🇪🇸",
    prize: "$100 USD",
    prizeIco: "💵",
    color: "#00e5ff",
  },
  {
    user: "@gabriel.t",
    flag: "🇲🇽",
    prize: "$1,000 USD",
    prizeIco: "💵",
    color: "#00ff9d",
  },
  {
    user: "@ana.r",
    flag: "🇨🇴",
    prize: "Bitcoin",
    prizeIco: "₿",
    color: "#f7931a",
  },
  {
    user: "@pablo.k",
    flag: "🇦🇷",
    prize: "$100 USD",
    prizeIco: "💵",
    color: "#00e5ff",
  },
];

type WinNotif = {
  id: number;
  user: string;
  flag: string;
  prize: string;
  prizeIco: string;
  color: string;
  secsAgo: number;
};

const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

const ORBIT_STAGGER = 0.11;

export function MysticOrb({
  onPlay,
  spinReady = false,
  onSpinConsumed,
  onPrizeWon,
  onDevTestPlay,
}: MysticOrbProps) {
  const [orbItems, setOrbItems] = useState<OrbitalItem[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0.35);
  const [isHovered, setIsHovered] = useState(false);
  /** 0 = logos en el centro; 1 = en órbita */
  const [spread, setSpread] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [centerFlash, setCenterFlash] = useState(false);

  // Live stats (fixed initial values to avoid hydration mismatch)
  const [totalPlayed, setTotalPlayed] = useState(2850);
  const [totalWinners, setTotalWinners] = useState(350);
  const [totalPrize, setTotalPrize] = useState(44500);

  // Win notifications
  const [notif, setNotif] = useState<WinNotif | null>(null);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifExiting, setNotifExiting] = useState(false);
  const [orbPulse, setOrbPulse] = useState(false);
  // Jackpot celebration
  const [jackpotWin, setJackpotWin] = useState<WinNotif | null>(null);
  const [jackpotVisible, setJackpotVisible] = useState(false);
  const [jackpotExiting, setJackpotExiting] = useState(false);
  const notifIdxRef = { current: rnd(0, WIN_POOL.length - 1) };

  // ── Premios orbitando alrededor del orbe ──
  useEffect(() => {
    const n = displayPrizes.length;
    const orbitRadii = [30, 32, 34, 31, 33];
    const items: OrbitalItem[] = displayPrizes.map((prize, i) => ({
      id: i,
      ico: prize.ico,
      nm: prize.nm,
      col: prize.col,
      glow: prize.glow,
      angle: (i / n) * 2 * Math.PI - Math.PI / 2,
      speed: 0.0014 + (i % 3) * 0.00025,
      radiusPct: orbitRadii[i % orbitRadii.length],
      scale: 0.9 + (i % 2) * 0.06,
    }));
    setOrbItems(items);
  }, []);

  const triggerBurst = useCallback(() => {
    setBurstKey((k) => k + 1);
    setCenterFlash(true);
    window.setTimeout(() => setCenterFlash(false), 700);
  }, []);

  // Eclosión: logos salen del centro hacia afuera
  useEffect(() => {
    setSpread(0);
    const start = performance.now();
    const duration = 1300;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setSpread(easeOutBack(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [burstKey]);

  useEffect(() => {
    const loop = window.setInterval(triggerBurst, 10000);
    return () => clearInterval(loop);
  }, [triggerBurst]);

  useEffect(() => {
    const orbitInterval = setInterval(() => {
      setOrbItems((prev) =>
        prev.map((item) => ({
          ...item,
          angle: item.angle + (isHovered ? item.speed * 1.2 : item.speed),
        })),
      );
    }, 55);
    const glowInterval = setInterval(() => {
      setGlowIntensity(0.25 + Math.sin(Date.now() * 0.003) * 0.12);
    }, 40);
    return () => {
      clearInterval(orbitInterval);
      clearInterval(glowInterval);
    };
  }, [isHovered]);

  // ── Live stats slow increment ──
  useEffect(() => {
    setTotalPlayed(rnd(2600, 3100));
    setTotalWinners(rnd(310, 390));
    setTotalPrize(rnd(41000, 48000));

    const t = setInterval(() => {
      if (Math.random() > 0.55) setTotalPlayed((p) => p + rnd(1, 3));
      if (Math.random() > 0.78) {
        setTotalWinners((p) => p + 1);
        setTotalPrize((p) => p + rnd(1, 70));
      }
    }, 3800);
    return () => clearInterval(t);
  }, []);

  // ── Win notification rotation ──
  const showNextNotif = useCallback(() => {
    const idx = notifIdxRef.current % WIN_POOL.length;
    notifIdxRef.current++;
    const w = WIN_POOL[idx];
    const win: WinNotif = { ...w, id: Date.now(), secsAgo: rnd(4, 55) };

    if (w.prize === "$1,000 USD") {
      // Jackpot celebration
      setJackpotWin(win);
      setJackpotExiting(false);
      setJackpotVisible(true);
      setOrbPulse(true);
      triggerBurst();
      setTimeout(() => setOrbPulse(false), 1200);
      // Start exit after 5s
      setTimeout(() => setJackpotExiting(true), 5000);
      setTimeout(() => {
        setJackpotVisible(false);
        setJackpotExiting(false);
      }, 5600);
    } else {
      // Normal notification
      setNotif(win);
      setNotifExiting(false);
      setNotifVisible(true);
      setOrbPulse(true);
      triggerBurst();
      setTimeout(() => setOrbPulse(false), 900);
      // Start exit after 3.2s
      setTimeout(() => setNotifExiting(true), 3200);
      setTimeout(() => {
        setNotifVisible(false);
        setNotifExiting(false);
      }, 3700);
    }
  }, [triggerBurst]);

  useEffect(() => {
    const first = setTimeout(showNextNotif, 2500);
    let intervalId: ReturnType<typeof setInterval>;
    const startLoop = setTimeout(() => {
      intervalId = setInterval(showNextNotif, rnd(5500, 9000));
    }, 2500);
    return () => {
      clearTimeout(first);
      clearTimeout(startLoop);
      clearInterval(intervalId);
    };
  }, [showNextNotif]);

  if (spinReady) {
    return (
      <OrbCasinoStage
        onSpinComplete={(prizeType) => {
          onSpinConsumed?.();
          onPrizeWon?.(prizeType);
        }}
      />
    );
  }

  return (
    <div className="relative w-full max-w-[860px] mx-auto mb-6">
      {/* ── Live stats bar ── */}
      <div className="flex items-center justify-center gap-1 mb-4 flex-wrap">
        {[
          {
            label: "JUGARON HOY",
            value: totalPlayed.toLocaleString("es"),
            color: "var(--mystik)",
            dot: "var(--mystik)",
          },
          {
            label: "GANARON",
            value: totalWinners.toLocaleString("es"),
            color: "var(--green)",
            dot: "var(--green)",
          },
          {
            label: "EN PREMIOS",
            value: `$${totalPrize.toLocaleString("es")}`,
            color: "var(--gold)",
            dot: "var(--gold)",
          },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && <div className="w-px h-5 bg-[var(--border)]" />}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                style={{ background: s.dot }}
              />
              <span
                className="font-mono tracking-[1px]"
                style={{ color: s.color }}
              >
                <span
                  className="font-black"
                  style={{ fontSize: "clamp(15px, 3.5vw, 18px)" }}
                >
                  {s.value}
                </span>
                <span
                  className="text-[var(--txt3)] ml-1.5"
                  style={{ fontSize: "clamp(11px, 2.5vw, 13px)" }}
                >
                  {s.label}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Zona del evento — sin marco cuadrado; orbe centrado */}
      <div className="relative overflow-visible py-4 md:py-6">
        <div
          className="pointer-events-none absolute inset-0 -mx-4"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 48%, rgba(120,70,200,0.14) 0%, transparent 72%)",
          }}
          aria-hidden
        />

        <OrbLiveFeed compact className="md:hidden mb-3 max-w-[400px] mx-auto -mt-1" />

        <div className="relative flex items-center justify-center min-h-[min(340px,78vw)] md:min-h-[360px]">
          <OrbLiveFeed className="hidden md:block absolute left-0 top-[2%] lg:top-0 z-10 max-w-[228px]" />
          <div
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[200px] pointer-events-none"
            aria-hidden
          />

          <div
            className="relative z-[2] w-full max-w-[min(360px,92vw)] mx-auto cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onPlay}
          >
        <OrbMarqueeLights
          active={false}
          count={14}
          square
          className="w-full mx-auto overflow-visible"
        >
        <div className="absolute inset-0 overflow-visible">
          <style>{`
            @keyframes orb-burst-wave {
              0% { transform: scale(0.25); opacity: 0.9; }
              100% { transform: scale(3.2); opacity: 0; }
            }
            @keyframes orb-center-flash {
              0% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.85); }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(1.35); }
            }
            @keyframes orb-aura-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes orb-aura-pulse {
              0%, 100% { opacity: 0.35; transform: scale(1); }
              50% { opacity: 0.65; transform: scale(1.04); }
            }
          `}</style>

          {/* Halo de escenario */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] aspect-square rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(179,136,255,0.12) 0%, rgba(255,215,0,0.04) 40%, transparent 68%)",
              animation: "orb-aura-pulse 4s ease-in-out infinite",
            }}
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] aspect-square rounded-full pointer-events-none opacity-50"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(179,136,255,0.25), transparent, rgba(255,215,0,0.2), transparent)",
              animation: "orb-aura-spin 28s linear infinite",
            }}
            aria-hidden
          />

          {centerFlash && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] h-[28%] rounded-full pointer-events-none z-[8]"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,215,0,0.45) 0%, rgba(179,136,255,0.25) 40%, transparent 70%)",
                animation: "orb-center-flash 0.65s ease-out forwards",
              }}
              aria-hidden
            />
          )}

          <div
            key={burstKey}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[18%] aspect-square rounded-full pointer-events-none z-[7] border-2"
            style={{
              borderColor: "rgba(255,215,0,0.55)",
              boxShadow: "0 0 24px rgba(179,136,255,0.5)",
              animation: "orb-burst-wave 1.1s ease-out forwards",
            }}
            aria-hidden
          />

          {/* Anillos del orbe */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              boxShadow: isHovered
                ? "0 0 0 1px rgba(179,136,255,0.35), 0 0 48px rgba(179,136,255,0.2), inset 0 0 40px rgba(179,136,255,0.08)"
                : "0 0 0 1px rgba(179,136,255,0.15), 0 0 32px rgba(179,136,255,0.1), inset 0 0 30px rgba(0,0,0,0.2)",
              background:
                "radial-gradient(circle, transparent 35%, rgba(179,136,255,0.06) 65%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-[10%] rounded-full"
            style={{
              border: "1px dashed rgba(179,136,255,0.2)",
              animation: "spin-slow 55s linear infinite reverse",
            }}
          />
          <div
            className="absolute inset-[18%] rounded-full border border-[rgba(255,215,0,0.12)]"
            style={{ animation: "spin-slow 40s linear infinite" }}
          />
          {/* Inner glow — tenue con luces apagadas */}
          <div
            className="absolute inset-[22%] rounded-full transition-all duration-300"
            style={{
              background: `radial-gradient(circle, rgba(179,136,255,${glowIntensity * 0.12}) 0%, transparent 70%)`,
              transform: isHovered ? "scale(1.08)" : "scale(1)",
            }}
          />

          {/* Orb pulse ring on win */}
          {orbPulse && (
            <div
              className="absolute inset-[18%] rounded-full pointer-events-none"
              style={{
                border: "3px solid rgba(0,255,157,0.7)",
                animation: "ping 0.8s ease-out forwards",
              }}
            />
          )}

          {/* Central orb — TOCA en el centro del radar */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div
              className="relative w-[104px] h-[104px] sm:w-[112px] sm:h-[112px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 pointer-events-auto"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, rgba(220,190,255,0.5) 0%, rgba(150,102,255,0.35) 38%, rgba(20,10,40,0.98) 72%)",
                boxShadow: orbPulse
                  ? "0 0 80px rgba(179,136,255,0.9), 0 0 120px rgba(255,215,0,0.25), inset 0 0 24px rgba(255,255,255,0.12)"
                  : isHovered
                    ? "0 0 40px rgba(179,136,255,0.5), 0 0 60px rgba(255,215,0,0.15), inset 0 0 20px rgba(255,255,255,0.08)"
                    : "0 0 24px rgba(179,136,255,0.35), inset 0 0 16px rgba(0,0,0,0.4)",
                border: `2px solid rgba(255,215,0,${orbPulse ? 0.7 : isHovered ? 0.45 : 0.25})`,
                transform: isHovered ? "scale(1.06)" : "scale(1)",
              }}
            >
              <span
                className="font-display font-black text-[13px] sm:text-[14px] tracking-[0.35em]"
                style={{
                  color: "#fff9eb",
                  textShadow:
                    "0 0 12px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                TOCA
              </span>
              <div className="absolute top-[18%] left-[22%] w-7 h-4 rounded-full bg-white/25 blur-[2px]" />
            </div>
          </div>

          {/* Premios: salen del centro (TOCA) hacia la órbita */}
          {orbItems.map((item) => {
            const delay = item.id * ORBIT_STAGGER;
            const itemSpread = Math.max(
              0,
              Math.min(1, (spread - delay) / (1 - delay)),
            );
            const eased = easeOutCubic(itemSpread);
            const r = item.radiusPct * eased;
            const x = 50 + Math.cos(item.angle) * r;
            const y = 50 + Math.sin(item.angle) * r;
            const emerging = itemSpread < 0.98;
            const zIndex = emerging ? 18 : Math.sin(item.angle) > 0 ? 6 : 14;
            const depth = Math.sin(item.angle);
            const opacity = (0.55 + depth * 0.2) * Math.min(1, itemSpread * 1.4);
            const scale =
              item.scale * (0.4 + 0.6 * eased) * (0.94 + depth * 0.05);
            const trailGlow =
              emerging && itemSpread > 0.05
                ? `0 0 28px ${item.glow}, 0 0 48px ${item.col}44`
                : `0 4px 14px rgba(0,0,0,0.45), 0 0 12px ${item.glow}`;
            return (
              <div
                key={item.id}
                className="absolute pointer-events-none will-change-[left,top,transform,opacity] flex flex-col items-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  zIndex,
                  opacity,
                  filter: emerging ? `blur(${(1 - eased) * 2}px)` : undefined,
                }}
              >
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-base sm:text-lg border-2 backdrop-blur-sm shrink-0 transition-shadow duration-150"
                  style={{
                    background: "rgba(21,14,36,0.92)",
                    borderColor: `${item.col}${emerging ? "aa" : "55"}`,
                    boxShadow: trailGlow,
                  }}
                >
                  {item.ico}
                </div>
                <span
                  className="text-[8px] sm:text-[9px] text-center font-mono font-bold whitespace-nowrap leading-none mt-0.5 px-0.5"
                  style={{
                    color: item.col,
                    textShadow: `0 0 6px ${item.glow}`,
                  }}
                >
                  {item.nm.startsWith("$")
                    ? item.nm.split(" ").slice(0, 2).join(" ")
                    : item.nm.split(" ")[0]}
                </span>
              </div>
            );
          })}

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: i % 2 === 0 ? "var(--gold)" : "var(--mystik)",
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
                opacity: 0.4 + Math.random() * 0.4,
                animation: `star-twinkle ${12 + Math.random() * 12}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}

          {/* ── Win notification ── */}
          {notifVisible && notif && (
            <div
              className="absolute bottom-2 right-0 sm:bottom-4 sm:right-2 z-20 pointer-events-none"
              style={{
                transform: notifExiting ? "translateY(18px)" : "translateY(0)",
                opacity: notifExiting ? 0 : 1,
                animation: !notifExiting
                  ? "fadeup 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards"
                  : undefined,
                transition: notifExiting
                  ? "opacity 0.4s ease, transform 0.4s ease"
                  : undefined,
              }}
            >
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(10,6,24,0.97) 0%, rgba(20,12,36,0.97) 100%)",
                  border: `1px solid ${notif.color}60`,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 20px ${notif.color}35`,
                  backdropFilter: "blur(8px)",
                  minWidth: "215px",
                  maxWidth: "240px",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: `${notif.color}20`,
                    border: `1px solid ${notif.color}45`,
                  }}
                >
                  {notif.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="font-mono text-[12px] font-black truncate"
                      style={{ color: notif.color }}
                    >
                      {notif.user}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--green)] font-black flex-shrink-0">
                      GANÓ
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px]">{notif.prizeIco}</span>
                    <span className="font-mono text-[12px] text-[var(--txt)] font-bold truncate">
                      {notif.prize}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-[9px] text-[var(--txt3)] flex-shrink-0 text-right leading-relaxed">
                  hace
                  <br />
                  {notif.secsAgo}s
                </div>
              </div>
            </div>
          )}

          {/* ── Jackpot $1,000 — notificación destacada ── */}
          {jackpotVisible && jackpotWin && (
            <div
              className="absolute bottom-2 right-0 sm:bottom-4 sm:right-2 z-30 pointer-events-none"
              style={{
                transform: jackpotExiting
                  ? "translateY(18px)"
                  : "translateY(0)",
                opacity: jackpotExiting ? 0 : 1,
                animation: !jackpotExiting
                  ? "fadeup 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards"
                  : undefined,
                transition: jackpotExiting
                  ? "opacity 0.4s ease, transform 0.4s ease"
                  : undefined,
              }}
            >
              <div
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15,10,5,0.97) 0%, rgba(25,18,5,0.97) 100%)",
                  border: "1px solid rgba(255,215,0,0.6)",
                  boxShadow:
                    "0 4px 24px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.25)",
                  backdropFilter: "blur(8px)",
                  minWidth: "215px",
                  maxWidth: "240px",
                }}
              >
                {/* Top shimmer */}
                <div
                  className="absolute top-0 left-0 right-0 h-px rounded-t-xl"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,215,0,0.6), transparent)",
                  }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: "rgba(255,215,0,0.15)",
                    border: "1px solid rgba(255,215,0,0.4)",
                  }}
                >
                  {jackpotWin.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="font-mono text-[12px] font-black truncate"
                      style={{ color: "#ffd700" }}
                    >
                      {jackpotWin.user}
                    </span>
                    <span
                      className="font-mono text-[10px] font-black flex-shrink-0"
                      style={{ color: "#00ff9d" }}
                    >
                      GANÓ
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px]">💵</span>
                    <span
                      className="font-mono text-[12px] font-black"
                      style={{ color: "#ffd700" }}
                    >
                      $1,000 USD
                    </span>
                  </div>
                </div>
                <div
                  className="font-mono text-[9px] flex-shrink-0 text-right leading-relaxed"
                  style={{ color: "rgba(255,215,0,0.5)" }}
                >
                  hace
                  <br />
                  {jackpotWin.secsAgo}s
                </div>
              </div>
            </div>
          )}
        </div>
        </OrbMarqueeLights>

        {/* Brand */}
        <div
          className="text-center font-display font-bold tracking-[10px] text-[var(--mystik)] mt-5"
          style={{
            fontSize: "clamp(14px, 4vw, 18px)",
            textShadow: "0 0 18px rgba(179,136,255,.6)",
          }}
        >
          MYSTIKA
        </div>

        {/* CTA Button */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="relative px-8 py-3 border-none rounded-xl cursor-pointer font-display font-bold text-base tracking-[2px] text-[var(--bg0)] overflow-hidden transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, var(--mystik3), var(--mystik), #d4b8ff, var(--mystik))",
              backgroundSize: "200% auto",
              animation: "ctamove 3s linear infinite",
              boxShadow:
                "0 8px 0 rgba(0,0,0,.5), 0 15px 40px rgba(179,136,255,.35)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2.5">
              <span className="text-xl">🔮</span>
              JUGAR AHORA
            </span>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)",
                transform: "translateX(-100%)",
                animation: "shimmer 2s infinite",
              }}
            />
          </button>
          <div
            className="flex flex-col items-center justify-center rounded-xl px-4 py-2.5 shrink-0"
            style={{
              background: "rgba(255,215,0,0.1)",
              border: "1px solid rgba(255,215,0,0.45)",
              boxShadow: "0 0 20px rgba(255,215,0,0.15)",
            }}
            aria-label="Precio: 1 dólar"
          >
            <span
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(26px, 6vw, 32px)",
                color: "var(--gold)",
                textShadow: "0 0 16px rgba(255,215,0,0.45)",
              }}
            >
              $1
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-[var(--gold3)] mt-0.5">
              USD
            </span>
          </div>
          {onDevTestPlay && (
            <DevTestButton onClick={onDevTestPlay} />
          )}
        </div>
        <div
          className="text-center font-mono text-[11px] sm:text-[12px] tracking-[2px] text-[var(--txt3)] mt-2"
        >
          Tocá el orbe o JUGAR AHORA
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
