"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  initialActiveCount,
  initialWinsPerMin,
  ORBE_LIVE_PLAYERS,
  pickAnonWinLine,
  pickJoinPhrase,
  pickPlayer,
  pickPlayingLine,
  pickSecsAgo,
  pickWin,
  rnd,
} from "@/lib/orbe-live-data";

type EventType = "playing" | "won";

type LiveEvent = {
  id: number;
  type: EventType;
  user: string;
  flag: string;
  text: string;
  sub?: string;
  icon?: string;
  color: string;
  secsAgo: number;
  hot?: boolean;
  /** Línea completa para wins anónimos */
  anonLine?: string;
  showPulse?: boolean;
};

let eventId = 0;

function buildEvent(winBias = 0.3): LiveEvent {
  const p = pickPlayer();
  const useAnon = Math.random() < 0.12;

  if (Math.random() < winBias) {
    const w = pickWin();
    if (useAnon) {
      return {
        id: ++eventId,
        type: "won",
        user: "",
        flag: p.flag,
        text: "GANÓ",
        anonLine: pickAnonWinLine(p.flag, w.icon, w.text),
        icon: w.icon,
        sub: w.text,
        color: w.color,
        hot: w.hot,
        secsAgo: pickSecsAgo(),
      };
    }
    return {
      id: ++eventId,
      type: "won",
      user: p.handle,
      flag: p.flag,
      text: "GANÓ",
      sub: w.text,
      icon: w.icon,
      color: w.color,
      hot: w.hot,
      secsAgo: pickSecsAgo(),
    };
  }

  return {
    id: ++eventId,
    type: "playing",
    user: p.handle,
    flag: p.flag,
    text: pickPlayingLine(p),
    color: "#b388ff",
    secsAgo: pickSecsAgo(),
    showPulse: Math.random() < 0.55,
  };
}

function seedEvents(
  count: number,
  options?: { winBias?: number; minWins?: number },
): LiveEvent[] {
  const winBias = options?.winBias ?? 0.22;
  const minWins = options?.minWins ?? 1;
  const items: LiveEvent[] = [];
  let wins = 0;
  for (let i = 0; i < count; i++) {
    const bias = wins < minWins ? Math.max(winBias, 0.42) : winBias;
    const e = buildEvent(bias);
    if (e.type === "won") wins++;
    items.push(e);
  }
  if (wins === 0) {
    items[0] = buildEvent(1);
  }
  return items.sort((a, b) => a.secsAgo - b.secsAgo).reverse();
}

const STAGE_BULB_COLORS = [
  { on: "#ffd700", glow: "rgba(255,215,0,0.95)" },
  { on: "#ffec8a", glow: "rgba(255,236,138,0.9)" },
  { on: "#b388ff", glow: "rgba(179,136,255,0.95)" },
  { on: "#00ff9d", glow: "rgba(0,255,157,0.85)" },
  { on: "#00e5ff", glow: "rgba(0,229,255,0.85)" },
  { on: "#ff6b9d", glow: "rgba(255,107,157,0.9)" },
];
const STAGE_BULBS = 16;

const StageTickerSegment = memo(function StageTickerSegment({
  e,
}: {
  e: LiveEvent;
}) {
  if (e.type === "won") {
    if (e.anonLine) {
      return (
        <span className="inline-flex items-center gap-1.5 shrink-0 pr-10 sm:pr-12">
          <span className="font-bold" style={{ color: e.color }}>
            {e.anonLine}
          </span>
          {e.hot && (
            <span className="font-mono text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-[rgba(255,215,0,0.2)] text-[#ffd700] border border-[rgba(255,215,0,0.45)]">
              HOT
            </span>
          )}
          <span className="text-[var(--txt3)] opacity-50">◆</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 shrink-0 pr-10 sm:pr-12">
        <span className="text-base leading-none">{e.flag}</span>
        <span className="text-[var(--gold)] font-black">{e.user}</span>
        <span className="text-[#00ff9d] font-black">GANÓ</span>
        <span className="font-bold" style={{ color: e.color }}>
          {e.icon} {e.sub}
        </span>
        {e.hot && (
          <span className="font-mono text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-[rgba(255,215,0,0.2)] text-[#ffd700] border border-[rgba(255,215,0,0.45)]">
            HOT
          </span>
        )}
        <span className="text-[var(--txt3)] opacity-50">◆</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0 pr-10 sm:pr-12 text-[var(--txt3)]">
      <span className="text-base leading-none opacity-90">{e.flag}</span>
      <span className="text-[var(--mystik)]">{e.text}</span>
      <span className="opacity-50">◆</span>
    </span>
  );
});

function StageTickerRow({
  strip,
  duplicate,
}: {
  strip: LiveEvent[];
  duplicate?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      {strip.map((e) => (
        <StageTickerSegment
          key={duplicate ? `dup-${e.id}` : e.id}
          e={e}
        />
      ))}
    </div>
  );
}

function SmoothStageTicker({ strip }: { strip: LiveEvent[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const pxPerFrame = 0.42;

    const tick = () => {
      const half = halfWidthRef.current;
      if (half > 0) {
        offsetRef.current -= pxPerFrame;
        if (-offsetRef.current >= half) {
          offsetRef.current += half;
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [strip]);

  return (
    <div
      className="relative overflow-hidden h-[24px] sm:h-[22px] flex items-center w-full"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max font-mono text-[11px] sm:text-[10px] font-bold leading-relaxed"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <StageTickerRow strip={strip} />
        <StageTickerRow strip={strip} duplicate />
      </div>
    </div>
  );
}

function StageBulbRail({ position }: { position: "top" | "bottom" }) {
  const chasePeriod = 1.7;
  const colorOffset = position === "bottom" ? 2 : 0;

  return (
    <div
      className="relative w-full h-full pointer-events-none"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            position === "top"
              ? "linear-gradient(180deg, rgba(255,215,0,0.1) 0%, rgba(8,5,14,0.4) 100%)"
              : "linear-gradient(0deg, rgba(179,136,255,0.08) 0%, rgba(8,5,14,0.35) 100%)",
        }}
      />
      <div
        className="absolute inset-x-[6%] h-px"
        style={{
          [position]: "50%",
          transform: "translateY(-50%)",
          background:
            position === "top"
              ? "linear-gradient(90deg, transparent, rgba(255,215,0,0.35), rgba(179,136,255,0.25), transparent)"
              : "linear-gradient(90deg, transparent, rgba(179,136,255,0.25), rgba(255,215,0,0.3), transparent)",
          boxShadow: "0 0 6px rgba(255,215,0,0.2)",
        }}
      />
      {Array.from({ length: STAGE_BULBS }, (_, i) => {
        const left = 4 + (i / (STAGE_BULBS - 1)) * 92;
        const color = STAGE_BULB_COLORS[(i + colorOffset) % STAGE_BULB_COLORS.length];
        const delay =
          position === "bottom"
            ? ((STAGE_BULBS - 1 - i) / STAGE_BULBS) * chasePeriod
            : (i / STAGE_BULBS) * chasePeriod;

        return (
          <div
            key={`${position}-${i}`}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%` }}
          >
            <div
              className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[2px]"
              style={{
                width: "clamp(11px, 2.8vw, 15px)",
                height: "clamp(5px, 1.4vw, 7px)",
                background: "linear-gradient(180deg, #4a3d5c 0%, #1a1428 100%)",
                border: "1px solid rgba(60,48,80,0.9)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
              }}
            />
            <div
              className="relative rounded-full orb-stage-bulb-lit"
              style={{
                width: "clamp(10px, 2.6vw, 14px)",
                height: "clamp(10px, 2.6vw, 14px)",
                ["--bulb-on" as string]: color.on,
                ["--bulb-glow" as string]: color.glow,
                animation: `orb-stage-bulb-chase ${chasePeriod}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function formatEventLine(e: LiveEvent): string {
  if (e.anonLine) return e.anonLine;
  if (e.type === "won") {
    return `${e.flag} ${e.user} GANÓ ${e.icon} ${e.sub}`;
  }
  return e.text.includes(e.user) ? `${e.flag} ${e.text}` : `${e.flag} ${e.user} ${e.text}`;
}

interface OrbLiveFeedProps {
  compact?: boolean;
  /** Feed con luces, ticker fluido y layout responsive (p. ej. dentro del orbe). */
  adaptive?: boolean;
  className?: string;
}

export function OrbLiveFeed({
  compact = false,
  adaptive = false,
  className = "",
}: OrbLiveFeedProps) {
  const [activeNow, setActiveNow] = useState(initialActiveCount);
  const [winsLastMin, setWinsLastMin] = useState(initialWinsPerMin);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [countFlash, setCountFlash] = useState(false);
  const [jackpotPulse, setJackpotPulse] = useState(false);
  const [recentJoins, setRecentJoins] = useState(6);
  const [joinPhrase, setJoinPhrase] = useState("");
  const prevActive = useRef(activeNow);
  const listSize = adaptive ? 16 : compact ? 4 : 8;

  useEffect(() => {
    setEvents(
      seedEvents(
        listSize,
        adaptive ? { winBias: 0.48, minWins: 7 } : undefined,
      ),
    );
    setActiveNow(initialActiveCount());
    setWinsLastMin(initialWinsPerMin());
    const joins = rnd(3, 11);
    setRecentJoins(joins);
    setJoinPhrase(pickJoinPhrase(joins));
  }, [listSize, adaptive]);

  const pushEvent = useCallback(() => {
    const next = buildEvent(adaptive ? 0.5 : 0.28);
    setEvents((prev) => {
      const merged = [next, ...prev].slice(0, listSize);
      return merged;
    });
    if (next.type === "won") {
      setWinsLastMin((w) => Math.min(99, w + (Math.random() < 0.7 ? 1 : 0)));
      if (next.hot) {
        setJackpotPulse(true);
        window.setTimeout(() => setJackpotPulse(false), 1200);
      }
    }
  }, [listSize, adaptive]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      pushEvent();
      const delay = adaptive
        ? rnd(2200, 3800)
        : compact
          ? rnd(2400, 4200)
          : rnd(2000, 3800);
      if (Math.random() < (adaptive ? 0.22 : 0.15)) {
        pushEvent();
      }
      timeoutId = setTimeout(schedule, delay);
    };
    timeoutId = setTimeout(schedule, rnd(400, 1200));
    return () => clearTimeout(timeoutId);
  }, [pushEvent, compact, adaptive]);

  useEffect(() => {
    const activeTimer = setInterval(() => {
      setActiveNow((n) => {
        const delta = rnd(-3, 11);
        const next = Math.max(2580, Math.min(3280, n + delta));
        if (next !== prevActive.current) {
          prevActive.current = next;
          setCountFlash(true);
          const joins = rnd(2, 14);
          setRecentJoins(joins);
          setJoinPhrase(pickJoinPhrase(joins));
          window.setTimeout(() => setCountFlash(false), 400);
        }
        return next;
      });
    }, rnd(1100, 1900));
    return () => clearInterval(activeTimer);
  }, []);

  useEffect(() => {
    const winDecay = setInterval(() => {
      setWinsLastMin((w) => {
        if (Math.random() < 0.35) return Math.max(8, w - 1);
        return w;
      });
    }, rnd(6000, 10000));
    return () => clearInterval(winDecay);
  }, []);

  useEffect(() => {
    const ageTimer = setInterval(() => {
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          secsAgo: e.secsAgo === 0 && Math.random() < 0.3 ? 0 : Math.min(e.secsAgo + 1, 99),
        })),
      );
    }, 1000);
    return () => clearInterval(ageTimer);
  }, []);

  const latestWin = events.find((e) => e.type === "won");
  const tickerItems = events.slice(0, adaptive ? 16 : compact ? 4 : 5);

  const feedStyles = `
    @keyframes orb-feed-slide {
      from { opacity: 0; transform: translateY(-10px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes orb-feed-jackpot {
      0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.35), inset 0 0 20px rgba(255,215,0,0.08); }
      50% { box-shadow: 0 0 36px rgba(255,215,0,0.65), inset 0 0 28px rgba(255,215,0,0.15); }
    }
    @keyframes orb-feed-count-pop {
      0% { transform: scale(1); }
      40% { transform: scale(1.05); color: #ffd700; }
      100% { transform: scale(1); }
    }
    @keyframes orb-feed-live-ring {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes orb-feed-ticker {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes orb-feed-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes orb-stage-bulb-chase {
      0%, 100% {
        opacity: 0.65;
        transform: scale(0.78);
        background: radial-gradient(circle at 32% 26%, #5a4a6a 0%, #2a2238 50%, #14101c 100%);
        border-color: rgba(55,45,72,0.9);
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.5);
      }
      10% {
        opacity: 1;
        transform: scale(1.14);
        background: radial-gradient(circle at 32% 26%, #fff 0%, var(--bulb-on) 38%, var(--bulb-on) 100%);
        border-color: var(--bulb-on);
        box-shadow: 0 0 18px var(--bulb-glow), 0 0 32px var(--bulb-glow), inset 0 -2px 4px rgba(0,0,0,0.3);
      }
      20% {
        opacity: 0.95;
        transform: scale(1);
        background: radial-gradient(circle at 32% 26%, #fff 0%, var(--bulb-on) 40%, var(--bulb-on)cc 100%);
        border-color: var(--bulb-on);
        box-shadow: 0 0 14px var(--bulb-glow), 0 0 24px var(--bulb-glow), inset 0 -2px 4px rgba(0,0,0,0.35);
      }
    }
    .orb-stage-bulb-lit {
      border: 2px solid rgba(55,45,72,0.9);
    }
    @keyframes orb-stage-pulse {
      0%, 100% { box-shadow: 0 0 28px rgba(255,215,0,0.18), inset 0 1px 0 rgba(255,255,255,0.05); }
      50% { box-shadow: 0 0 44px rgba(255,215,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08); }
    }
    .orb-feed-new { animation: orb-feed-slide 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .orb-feed-jackpot { animation: orb-feed-jackpot 0.8s ease-in-out infinite; }
    .orb-feed-stage-pulse { animation: orb-stage-pulse 0.9s ease-in-out infinite; }
    .orb-feed-count-flash { animation: orb-feed-count-pop 0.4s ease-out; }
  `;

  if (adaptive) {
    return (
      <div
        className={[
          "w-full rounded-xl overflow-hidden border relative",
          jackpotPulse ? "orb-feed-stage-pulse" : "",
          className,
        ].join(" ")}
        style={{
          background:
            "linear-gradient(165deg, rgba(14,9,24,0.98) 0%, rgba(6,4,12,0.99) 55%, rgba(12,8,22,0.98) 100%)",
          borderColor: jackpotPulse
            ? "rgba(255,215,0,0.5)"
            : "rgba(255,215,0,0.32)",
          boxShadow: jackpotPulse
            ? "0 0 32px rgba(255,215,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        aria-label="Premios en vivo del orbe"
      >
        <style>{feedStyles}</style>

        <div className="relative h-[22px] sm:h-[24px] shrink-0 border-b border-[rgba(255,215,0,0.12)]">
          <StageBulbRail position="top" />
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)",
            animation: "orb-feed-shimmer 3.5s ease-in-out infinite",
          }}
          aria-hidden
        />

        <div className="relative z-[3] flex flex-col gap-2 px-3 py-2.5 sm:py-2 sm:flex-row sm:items-center sm:gap-3 min-h-[48px]">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative w-2.5 h-2.5">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#00ff9d", boxShadow: "0 0 10px #00ff9d" }}
                />
                <span
                  className="absolute inset-[-3px] rounded-full border border-[#00ff9d]/50"
                  style={{ animation: "orb-feed-live-ring 1.5s ease-out infinite" }}
                />
              </div>
              <span className="font-mono text-[10px] sm:text-[9px] font-black tracking-[0.15em] text-[#00ff9d]">
                EN VIVO
              </span>
              <span
                className={[
                  "font-mono text-[12px] sm:text-[11px] font-black tabular-nums text-[var(--gold)]",
                  countFlash ? "orb-feed-count-flash" : "",
                ].join(" ")}
              >
                {activeNow.toLocaleString("es")}
              </span>
            </div>
            <span
              className="font-mono text-[9px] sm:text-[8px] font-black px-2 py-0.5 rounded-full tabular-nums shrink-0"
              style={{
                background: "rgba(255,107,157,0.18)",
                color: "#ff8fb8",
                border: "1px solid rgba(255,107,157,0.4)",
              }}
            >
              🔥 {winsLastMin}/min
            </span>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <SmoothStageTicker strip={tickerItems} />
          </div>
        </div>

        <div className="relative h-[22px] sm:h-[24px] shrink-0 border-t border-[rgba(179,136,255,0.12)]">
          <StageBulbRail position="bottom" />
        </div>
      </div>
    );
  }

  if (compact) {
    const line = tickerItems.map(formatEventLine).join("   ◆   ");
    return (
      <div
        className={[
          "w-full rounded-xl overflow-hidden border relative",
          jackpotPulse ? "orb-feed-jackpot" : "",
          className,
        ].join(" ")}
        style={{
          background:
            "linear-gradient(90deg, rgba(8,5,14,0.98) 0%, rgba(18,10,32,0.98) 50%, rgba(8,5,14,0.98) 100%)",
          borderColor: jackpotPulse
            ? "rgba(255,215,0,0.55)"
            : "rgba(0,255,157,0.35)",
        }}
      >
        <style>{feedStyles}</style>
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)",
            animation: "orb-feed-shimmer 2.5s ease-in-out infinite",
          }}
          aria-hidden
        />
        <div className="flex items-center gap-2 px-3 py-2 min-h-[40px]">
          <div className="relative shrink-0">
            <span
              className="block w-2 h-2 rounded-full"
              style={{ background: "#00ff9d", boxShadow: "0 0 10px #00ff9d" }}
            />
            <span
              className="absolute inset-0 rounded-full border border-[#00ff9d]"
              style={{ animation: "orb-feed-live-ring 1.4s ease-out infinite" }}
            />
          </div>
          <span className="font-mono text-[9px] font-black tracking-[0.15em] text-[var(--green)] shrink-0">
            LIVE
          </span>
          <span
            className={[
              "font-mono text-[10px] font-black tabular-nums shrink-0",
              countFlash ? "orb-feed-count-flash" : "",
            ].join(" ")}
            style={{ color: "var(--gold)" }}
          >
            {activeNow.toLocaleString("es")}
          </span>
          <div
            className="flex-1 min-w-0 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
          >
            <div
              className="flex whitespace-nowrap font-mono text-[10px] font-bold"
              style={{
                animation: line.length > 40 ? "orb-feed-ticker 22s linear infinite" : undefined,
                width: line.length > 40 ? "max-content" : "100%",
              }}
            >
              <span className="text-[var(--txt2)] pr-8">{line}</span>
              {line.length > 40 && (
                <span className="text-[var(--txt2)] pr-8" aria-hidden>
                  {line}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const streamEvents = events.filter((e) => e.id !== latestWin?.id);

  return (
    <aside
      className={[
        "pointer-events-none select-none w-full max-w-[228px]",
        className,
      ].join(" ")}
      aria-label="Actividad en vivo del orbe"
    >
      <style>{feedStyles}</style>

      <div
        className={[
          "rounded-2xl overflow-hidden relative",
          jackpotPulse ? "orb-feed-jackpot" : "",
        ].join(" ")}
        style={{
          background:
            "linear-gradient(168deg, rgba(12,7,22,0.97) 0%, rgba(4,2,10,0.99) 55%, rgba(16,9,28,0.97) 100%)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(179,136,255,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="h-[3px] w-full relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, #00ff9d, #b388ff, #ffd700, #00ff9d)",
            backgroundSize: "200% 100%",
            animation: "ctamove 2.5s linear infinite",
          }}
          aria-hidden
        />

        <div className="px-3 pt-2.5 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: "#00ff9d", boxShadow: "0 0 10px #00ff9d" }}
              />
              <span
                className="absolute inset-[-3px] rounded-full border border-[#00ff9d]/60"
                style={{ animation: "orb-feed-live-ring 1.6s ease-out infinite" }}
              />
            </div>
            <span className="font-mono text-[10px] font-black tracking-[0.25em] text-[var(--green)]">
              EN VIVO
            </span>
          </div>
          <span
            className="font-mono text-[8px] font-black px-2 py-0.5 rounded-full tabular-nums"
            style={{
              background: "rgba(255,107,157,0.2)",
              color: "#ff6b9d",
              border: "1px solid rgba(255,107,157,0.45)",
            }}
          >
            🔥 {winsLastMin}/min
          </span>
        </div>

        <div
          className="mx-3 mb-2 rounded-xl px-3 py-2 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(179,136,255,0.14) 0%, rgba(255,215,0,0.06) 100%)",
            border: "1px solid rgba(179,136,255,0.28)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
              animation: "orb-feed-shimmer 3s ease-in-out infinite",
            }}
            aria-hidden
          />
          <p className="font-mono text-[8px] text-[var(--txt3)] tracking-[0.2em] uppercase mb-0.5">
            Jugando ahora
          </p>
          <p
            className={[
              "font-mono text-[24px] font-black tabular-nums leading-none tracking-tight",
              countFlash ? "orb-feed-count-flash" : "",
            ].join(" ")}
            style={{
              color: "var(--gold)",
              textShadow: "0 0 20px rgba(255,215,0,0.35)",
            }}
          >
            {activeNow.toLocaleString("es")}
          </p>
          <p className="font-mono text-[9px] text-[var(--green)] mt-1 font-bold leading-snug">
            {joinPhrase || pickJoinPhrase(recentJoins)}
          </p>
        </div>

        {latestWin && (
          <div
            key={latestWin.id}
            className="mx-3 mb-2 rounded-xl px-3 py-2 orb-feed-new relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${latestWin.color}22 0%, rgba(8,5,14,0.95) 70%)`,
              border: `1px solid ${latestWin.color}66`,
              boxShadow: `0 0 24px ${latestWin.color}33`,
            }}
          >
            {latestWin.hot && (
              <span
                className="absolute top-1.5 right-2 font-mono text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(255,215,0,0.25)",
                  color: "#ffd700",
                  border: "1px solid rgba(255,215,0,0.5)",
                }}
              >
                HOT
              </span>
            )}
            <p className="font-mono text-[8px] text-[var(--txt3)] tracking-wider mb-1">
              ÚLTIMO PREMIO
            </p>
            {latestWin.anonLine ? (
              <p
                className="font-mono text-[10px] font-bold leading-snug pr-6"
                style={{ color: latestWin.color }}
              >
                {latestWin.anonLine}
                <span className="text-[var(--txt3)] font-normal ml-1 tabular-nums">
                  · {latestWin.secsAgo}s
                </span>
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{latestWin.flag}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-mono text-[11px] font-black truncate"
                    style={{ color: latestWin.color }}
                  >
                    {latestWin.user}
                  </p>
                  <p className="font-mono text-[10px] font-black text-[var(--green)]">
                    GANÓ{" "}
                    <span style={{ color: latestWin.color }}>
                      {latestWin.icon} {latestWin.sub}
                    </span>
                  </p>
                </div>
                <span className="font-mono text-[9px] text-[var(--txt3)] tabular-nums shrink-0">
                  {latestWin.secsAgo}s
                </span>
              </div>
            )}
          </div>
        )}

        <ul className="px-2 pb-2 space-y-0.5 max-h-[240px] overflow-hidden">
          {streamEvents.map((e, idx) => (
            <li key={e.id} className={idx === 0 ? "orb-feed-new" : ""}>
              {e.type === "won" ? (
                <div
                  className="rounded-lg px-2.5 py-1.5 flex items-center gap-2"
                  style={{
                    background: `linear-gradient(90deg, ${e.color}18, transparent)`,
                    borderLeft: `3px solid ${e.color}`,
                  }}
                >
                  {e.anonLine ? (
                    <p
                      className="font-mono text-[9px] font-bold leading-snug flex-1 min-w-0"
                      style={{ color: e.color }}
                    >
                      {e.anonLine}
                      <span className="text-[var(--txt3)] font-normal ml-1 tabular-nums">
                        {e.secsAgo}s
                      </span>
                    </p>
                  ) : (
                    <>
                      <span className="text-sm shrink-0">{e.flag}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] leading-tight">
                          <span className="font-black" style={{ color: e.color }}>
                            {e.user}
                          </span>{" "}
                          <span className="text-[var(--green)] font-black">GANÓ</span>
                        </p>
                        <p
                          className="font-mono text-[9px] font-bold truncate"
                          style={{ color: e.color }}
                        >
                          {e.icon} {e.sub}
                        </p>
                      </div>
                      <span className="font-mono text-[8px] text-[var(--txt3)] tabular-nums shrink-0">
                        {e.secsAgo}s
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-lg px-2.5 py-1.5 flex items-center gap-2"
                  style={{ opacity: 0.75 + (idx % 3) * 0.06 }}
                >
                  <span className="text-sm shrink-0">{e.flag}</span>
                  <p className="font-mono text-[9px] text-[var(--txt3)] truncate flex-1 leading-snug">
                    <span className="mr-1">{e.flag}</span>
                    <span style={{ color: "var(--mystik)" }}>{e.text}</span>
                  </p>
                  {e.showPulse && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                      style={{ background: "#b388ff" }}
                    />
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        <div
          className="px-3 py-1.5 border-t text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="font-mono text-[8px] tracking-[0.12em] text-[var(--txt3)] leading-relaxed">
            <span className="text-[var(--gold)] font-black">⚡</span> Premios cada
            minuto · {ORBE_LIVE_PLAYERS.length}+ jugadores en sala
          </p>
        </div>
      </div>
    </aside>
  );
}
