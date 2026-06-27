"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  initialJackpotTableCount,
  initialJackpotWinsPerMin,
  pickJackpotAnonWin,
  pickJackpotPlayingLine,
  pickJackpotWin,
  pickPlayer,
  pickSecsAgo,
  rnd,
} from "@/lib/jackpot-live-data";

type FeedEvent =
  | {
      id: number;
      kind: "won";
      flag: string;
      user: string;
      icon: string;
      prize: string;
      color: string;
      hot?: boolean;
      anon?: boolean;
      anonLine?: string;
      secsAgo: number;
    }
  | {
      id: number;
      kind: "playing";
      flag: string;
      line: string;
      secsAgo: number;
    };

let feedId = 0;

function buildJackpotEvent(winBias = 0.38): FeedEvent {
  const p = pickPlayer();

  if (Math.random() < winBias) {
    const w = pickJackpotWin();
    const anon = Math.random() < 0.14;
    return {
      id: ++feedId,
      kind: "won",
      flag: p.flag,
      user: anon ? "" : p.handle,
      icon: w.icon,
      prize: w.label,
      color: w.color,
      hot: w.hot,
      anon,
      anonLine: anon ? pickJackpotAnonWin(p.flag, w.icon, w.label) : undefined,
      secsAgo: pickSecsAgo(),
    };
  }

  return {
    id: ++feedId,
    kind: "playing",
    flag: p.flag,
    line: pickJackpotPlayingLine(p),
    secsAgo: pickSecsAgo(),
  };
}

const TICKER_LEN = 28;

/** Solo ticker: sin contador que cambie cada segundo (evita tirones). */
const TickerSegment = memo(function TickerSegment({ e }: { e: FeedEvent }) {
  if (e.kind === "won") {
    if (e.anon && e.anonLine) {
      return (
        <span className="inline-flex items-center gap-1.5 shrink-0 pr-12">
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
      <span className="inline-flex items-center gap-1.5 shrink-0 pr-12">
        <span className="text-base leading-none">{e.flag}</span>
        <span className="text-[var(--gold)] font-black">{e.user}</span>
        <span className="text-[#00ff9d] font-black">GANÓ</span>
        <span className="font-bold" style={{ color: e.color }}>
          {e.icon} {e.prize}
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
    <span className="inline-flex items-center gap-1.5 shrink-0 pr-12 text-[var(--txt3)]">
      <span className="text-base leading-none opacity-90">{e.flag}</span>
      <span className="text-[var(--mystik)]">{e.line}</span>
      <span className="opacity-50">◆</span>
    </span>
  );
});

function TickerRow({ strip, duplicate }: { strip: FeedEvent[]; duplicate?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      {strip.map((e) => (
        <TickerSegment key={duplicate ? `dup-${e.id}` : e.id} e={e} />
      ))}
    </div>
  );
}

/** Marquesina continua (rAF) — no reinicia ni se traba al cambiar el DOM. */
function SmoothJackpotTicker({
  strip,
  inline = false,
}: {
  strip: FeedEvent[];
  inline?: boolean;
}) {
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

    const pxPerFrame = 0.38;

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

  const maskStyle = {
    maskImage:
      "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
  };

  return (
    <div
      className={inline ? "relative overflow-hidden h-[22px] flex items-center" : "relative py-2.5 overflow-hidden"}
      style={maskStyle}
    >
      {!inline && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,255,157,0.4), transparent)",
            animation: "jackpot-live-shimmer 3.5s ease-in-out infinite",
          }}
          aria-hidden
        />
      )}
      <div
        ref={trackRef}
        className={`flex w-max font-mono leading-relaxed ${inline ? "text-[10px]" : "text-[11px]"}`}
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <TickerRow strip={strip} />
        <TickerRow strip={strip} duplicate />
      </div>
    </div>
  );
}

function seedTickerStrip(count: number): FeedEvent[] {
  const items: FeedEvent[] = [];
  let wins = 0;
  for (let i = 0; i < count; i++) {
    const e = buildJackpotEvent(wins < 8 ? 0.55 : 0.4);
    if (e.kind === "won") wins++;
    items.push(e);
  }
  if (wins === 0) items.unshift(buildJackpotEvent(1));
  return items;
}

interface JackpotLiveFeedProps {
  className?: string;
}

export function JackpotLiveFeed({ className = "" }: JackpotLiveFeedProps) {
  const [tableCount, setTableCount] = useState(0);
  const [winsPerMin, setWinsPerMin] = useState(0);
  const tickerStrip = useMemo(() => seedTickerStrip(TICKER_LEN), []);
  const [pulse, setPulse] = useState(false);
  const [countFlash, setCountFlash] = useState(false);
  const prevCount = useRef(0);

  useEffect(() => {
    setTableCount(initialJackpotTableCount());
    setWinsPerMin(initialJackpotWinsPerMin());
  }, []);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const schedule = () => {
      if (Math.random() < 0.5) {
        setWinsPerMin((w) => Math.min(42, w + 1));
      }
      if (Math.random() < 0.12) {
        setPulse(true);
        window.setTimeout(() => setPulse(false), 1400);
      }
      tid = setTimeout(schedule, rnd(4000, 7000));
    };
    tid = setTimeout(schedule, rnd(1500, 3000));
    return () => clearTimeout(tid);
  }, []);

  useEffect(() => {
    const tick = () => {
      setTableCount((n) => {
        const next = Math.max(160, Math.min(480, n + rnd(-4, 9)));
        if (next !== prevCount.current) {
          prevCount.current = next;
          setCountFlash(true);
          window.setTimeout(() => setCountFlash(false), 380);
        }
        return next;
      });
    };
    tick();
    const t = setInterval(tick, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setWinsPerMin((w) => (Math.random() < 0.3 ? Math.max(10, w - 1) : w));
    }, 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={[
        "w-full rounded-2xl overflow-hidden border relative transition-shadow duration-500",
        pulse ? "jackpot-live-pulse" : "",
        className,
      ].join(" ")}
      style={{
        background:
          "linear-gradient(165deg, rgba(14,9,24,0.98) 0%, rgba(6,4,12,0.99) 55%, rgba(12,8,22,0.98) 100%)",
        borderColor: pulse ? "rgba(255,215,0,0.5)" : "rgba(0,255,157,0.32)",
        boxShadow: pulse
          ? "0 0 32px rgba(255,215,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <style>{`
        @keyframes jackpot-live-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        @keyframes jackpot-live-ring {
          0% { transform: scale(1); opacity: 0.75; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes jackpot-live-pop {
          0% { transform: scale(1); }
          45% { transform: scale(1.06); color: #ffd700; }
          100% { transform: scale(1); }
        }
        .jackpot-live-pulse {
          animation: jackpot-live-pulse-glow 0.9s ease-in-out infinite;
        }
        @keyframes jackpot-live-pulse-glow {
          0%, 100% { box-shadow: 0 0 28px rgba(255,215,0,0.18); }
          50% { box-shadow: 0 0 40px rgba(255,215,0,0.35); }
        }
        .jackpot-live-count-flash { animation: jackpot-live-pop 0.38s ease-out; }
      `}</style>

      <div
        className="h-[2px] w-full"
        style={{
          background: "linear-gradient(90deg, #00ff9d, #b388ff, #ffd700, #00ff9d)",
          backgroundSize: "200% 100%",
          animation: "ctamove 3s linear infinite",
        }}
        aria-hidden
      />

      {/* Barra compacta: EN VIVO + ticker (sin caja de evento destacado) */}
      <div className="flex items-center gap-2 px-3 py-2 min-h-[44px]">
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-2 h-2">
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: "#00ff9d", boxShadow: "0 0 10px #00ff9d" }}
            />
            <span
              className="absolute inset-[-3px] rounded-full border border-[#00ff9d]/50"
              style={{ animation: "jackpot-live-ring 1.5s ease-out infinite" }}
            />
          </div>
          <span className="font-mono text-[9px] font-black tracking-[0.15em] text-[#00ff9d]">
            LIVE
          </span>
          <span
            className={[
              "font-mono text-[10px] font-black tabular-nums text-[var(--gold)]",
              countFlash ? "jackpot-live-count-flash" : "",
            ].join(" ")}
          >
            {tableCount}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <SmoothJackpotTicker strip={tickerStrip} inline />
        </div>
        <span
          className="shrink-0 font-mono text-[8px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
          style={{
            background: "rgba(255,107,157,0.18)",
            color: "#ff8fb8",
            border: "1px solid rgba(255,107,157,0.4)",
          }}
        >
          🔥{winsPerMin}/m
        </span>
      </div>
    </div>
  );
}
