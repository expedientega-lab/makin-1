"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  initialMinesActiveCount,
  initialMinesWinsPerMin,
  pickMinesAnonWin,
  pickMinesPlayer,
  pickMinesPlayingLine,
  pickMinesWin,
  pickSecsAgo,
  rnd,
} from "@/lib/mines-live-data";

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

function buildMinesEvent(winBias = 0.48): FeedEvent {
  const p = pickMinesPlayer();

  if (Math.random() < winBias) {
    const w = pickMinesWin();
    const anon = Math.random() < 0.1;
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
      anonLine: anon ? pickMinesAnonWin(p.flag, w.icon, w.label) : undefined,
      secsAgo: pickSecsAgo(),
    };
  }

  return {
    id: ++feedId,
    kind: "playing",
    flag: p.flag,
    line: pickMinesPlayingLine(p),
    secsAgo: pickSecsAgo(),
  };
}

const TICKER_LEN = 24;

const TickerSegment = memo(function TickerSegment({ e }: { e: FeedEvent }) {
  if (e.kind === "won") {
    if (e.anon && e.anonLine) {
      return (
        <span className="inline-flex items-center gap-1.5 shrink-0 pr-10">
          <span className="font-bold" style={{ color: e.color }}>
            {e.anonLine}
          </span>
          <span className="text-[var(--txt3)] opacity-40">◆</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 shrink-0 pr-10">
        <span className="text-sm leading-none">{e.flag}</span>
        <span className="text-[#ffe566] font-black">{e.user}</span>
        <span className="text-[#ffd700] font-black">GANÓ</span>
        <span className="font-bold" style={{ color: e.color }}>
          {e.icon} {e.prize}
        </span>
        {e.hot && (
          <span className="font-mono text-[7px] font-black tracking-wider px-1 py-0.5 rounded bg-[rgba(255,215,0,0.15)] text-[#ffd700] border border-[rgba(255,215,0,0.35)]">
            LIVE
          </span>
        )}
        <span className="text-[var(--txt3)] opacity-40">◆</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0 pr-10 text-[var(--txt3)]">
      <span className="text-sm leading-none opacity-90">{e.flag}</span>
      <span className="text-[var(--txt2)]">{e.line}</span>
      <span className="opacity-40">◆</span>
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

function SmoothMinesTicker({ strip }: { strip: FeedEvent[] }) {
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

    const pxPerFrame = 0.32;

    const tick = () => {
      const half = halfWidthRef.current;
      if (half > 0) {
        offsetRef.current -= pxPerFrame;
        if (-offsetRef.current >= half) offsetRef.current += half;
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
      className="relative overflow-hidden h-[20px] flex items-center"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max font-mono text-[10px] leading-relaxed"
        style={{ willChange: "transform" }}
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
    const e = buildMinesEvent(wins < 10 ? 0.6 : 0.45);
    if (e.kind === "won") wins++;
    items.push(e);
  }
  if (wins === 0) items.unshift(buildMinesEvent(1));
  return items;
}

export function MinesLiveFeed() {
  const [activeCount, setActiveCount] = useState(0);
  const [winsPerMin, setWinsPerMin] = useState(0);
  const tickerStrip = useMemo(() => seedTickerStrip(TICKER_LEN), []);

  useEffect(() => {
    setActiveCount(initialMinesActiveCount());
    setWinsPerMin(initialMinesWinsPerMin());
  }, []);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const schedule = () => {
      if (Math.random() < 0.45) {
        setWinsPerMin((w) => Math.min(22, w + 1));
      }
      tid = setTimeout(schedule, rnd(5000, 9000));
    };
    tid = setTimeout(schedule, rnd(2000, 4000));
    return () => clearTimeout(tid);
  }, []);

  useEffect(() => {
    const tick = () => {
      setActiveCount((n) => Math.max(28, Math.min(140, n + rnd(-3, 6))));
    };
    tick();
    const t = setInterval(tick, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="border-t border-[rgba(255,215,0,0.12)] px-4 py-3 sm:px-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,215,0,0.03) 0%, rgba(6,4,10,0.6) 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: "#ffd700",
              boxShadow: "0 0 6px rgba(255,215,0,0.7)",
              animation: "pulse 1.8s ease-in-out infinite",
            }}
          />
          <span className="font-mono text-[9px] tracking-[0.22em] text-[#ffd700] font-black">
            GANANDO AHORA
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-[var(--txt3)]">
          <span>
            <span className="text-[#ffe566] font-black">{activeCount}</span> en mina
          </span>
          <span>
            <span className="text-[#ffd700] font-black">{winsPerMin}</span>/min
          </span>
        </div>
      </div>
      <SmoothMinesTicker strip={tickerStrip} />
    </div>
  );
}
