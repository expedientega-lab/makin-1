"use client";

import { useState, useEffect, useCallback } from "react";
import { displayPrizes } from "@/lib/mystika-data";
import { DevTestButton } from "./dev-test-button";

interface OrbitalItem {
  id: number;
  ico: string;
  nm: string;
  col: string;
  glow: string;
  angle: number;
  speed: number;
  radius: number;
  scale: number;
}

interface MysticOrbProps {
  onPlay: () => void;
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
    prize: "Bot Trading",
    prizeIco: "🤖",
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
    prize: "Bot Trading",
    prizeIco: "🤖",
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
    prize: "Bot Trading",
    prizeIco: "🤖",
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
    prize: "Bot Trading",
    prizeIco: "🤖",
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

export function MysticOrb({ onPlay, onDevTestPlay }: MysticOrbProps) {
  const [orbItems, setOrbItems] = useState<OrbitalItem[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [isHovered, setIsHovered] = useState(false);

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

  // ── Initialize orbital items ──
  useEffect(() => {
    const items: OrbitalItem[] = displayPrizes.map((prize, i) => ({
      id: i,
      ico: prize.ico,
      nm: prize.nm,
      col: prize.col,
      glow: prize.glow,
      angle: i * 72 * (Math.PI / 180),
      speed: 0.0018 + Math.random() * 0.0012,
      radius: 100 + (i % 2) * 25,
      scale: 0.9 + Math.random() * 0.3,
    }));
    setOrbItems(items);
  }, []);

  // ── Orbit + glow animation ──
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbItems((prev) =>
        prev.map((item) => ({
          ...item,
          angle: item.angle + (isHovered ? item.speed * 1.15 : item.speed),
        })),
      );
    }, 55);
    const glowInterval = setInterval(() => {
      setGlowIntensity(0.4 + Math.sin(Date.now() * 0.003) * 0.35);
    }, 40);
    return () => {
      clearInterval(interval);
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
      setTimeout(() => setOrbPulse(false), 900);
      // Start exit after 3.2s
      setTimeout(() => setNotifExiting(true), 3200);
      setTimeout(() => {
        setNotifVisible(false);
        setNotifExiting(false);
      }, 3700);
    }
  }, []);

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

  return (
    <div className="w-full max-w-[860px] mx-auto mb-6">
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
                <span className="font-black text-[14px]">{s.value}</span>
                <span className="text-[var(--txt3)] text-[11px] ml-1.5">
                  {s.label}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="w-full max-w-[420px] mx-auto relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onPlay}
      >
        <div className="relative aspect-square flex items-center justify-center">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-2 transition-all duration-300"
            style={{
              borderColor: isHovered
                ? "rgba(179,136,255,0.4)"
                : "rgba(179,136,255,0.2)",
              background:
                "radial-gradient(circle, transparent 40%, rgba(179,136,255,0.05) 70%, transparent 100%)",
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-[12%] rounded-full border border-[rgba(179,136,255,0.15)]"
            style={{ animation: "spin-slow 50s linear infinite reverse" }}
          />
          {/* Inner glow */}
          <div
            className="absolute inset-[22%] rounded-full transition-all duration-300"
            style={{
              background: `radial-gradient(circle, rgba(179,136,255,${glowIntensity * 0.4}) 0%, transparent 70%)`,
              transform: isHovered ? "scale(1.15)" : "scale(1)",
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

          {/* Central orb */}
          <div
            className="relative w-[140px] h-[140px] rounded-full flex items-center justify-center z-10 transition-all duration-300"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(179,136,255,0.5), rgba(150,102,255,0.25) 50%, rgba(10,6,18,0.9))",
              boxShadow: `0 0 ${orbPulse ? 80 : isHovered ? 60 : 40}px rgba(179,136,255,${orbPulse ? 0.9 : glowIntensity}), inset 0 0 35px rgba(179,136,255,0.35)`,
              border: `3px solid rgba(179,136,255,${orbPulse ? 0.9 : 0.4})`,
              transform: isHovered ? "scale(1.08)" : "scale(1)",
              transition:
                "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
            }}
          >
            <div className="text-center">
              <div className="mt-1 font-mono text-[8px] tracking-[2px] text-[var(--mystik)]">
                TOCA
              </div>
            </div>
            <div className="absolute top-5 left-7 w-7 h-5 rounded-full bg-white/25 blur-sm" />
          </div>

          {/* Orbital prizes */}
          {orbItems.map((item) => {
            const x = Math.cos(item.angle) * item.radius;
            const y = Math.sin(item.angle) * item.radius * 0.45;
            const zIndex = y > 0 ? 5 : 15;
            const opacity = 0.7 + (y / item.radius) * 0.3;
            const scale = item.scale * (0.85 + (y / item.radius) * 0.15);
            return (
              <div
                key={item.id}
                className="absolute transition-all duration-75"
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${scale})`,
                  zIndex,
                  opacity,
                }}
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl border-2 backdrop-blur-sm"
                  style={{
                    background: "rgba(21,14,36,0.9)",
                    borderColor: `${item.col}66`,
                    boxShadow: `0 6px 25px rgba(0,0,0,0.5), 0 0 20px ${item.glow}`,
                  }}
                >
                  {item.ico}
                </div>
                <div
                  className="text-[9px] text-center mt-1.5 font-mono tracking-wider font-semibold"
                  style={{
                    color: item.col,
                    textShadow: `0 0 10px ${item.glow}`,
                  }}
                >
                  {item.nm.split(" ")[0]}
                </div>
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
              className="absolute bottom-8 left-0 z-20 pointer-events-none"
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
              className="absolute bottom-8 left-0 z-30 pointer-events-none"
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
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
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
          {onDevTestPlay && (
            <DevTestButton onClick={onDevTestPlay} />
          )}
        </div>
        <div className="text-center font-mono text-[10px] tracking-[3px] text-[var(--txt3)] mt-1.5">
          TOCA EL ORBE PARA JUGAR - $1
        </div>
      </div>
    </div>
  );
}
