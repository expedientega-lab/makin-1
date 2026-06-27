"use client";

import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  onlineCount: number;
  onPlay?: () => void;
  onGoJackpot?: () => void;
  onOpenFiveGame?: () => void;
  /** Solo `next dev` (localhost / ngrok) — abre el mini juego sin pagar. */
  onDevTestFiveGame?: () => void;
}

const liveCountries = [
  { flag: "AR", country: "Argentina", basePlaying: 2180, baseWinning: 286 },
  { flag: "MX", country: "Mexico", basePlaying: 3540, baseWinning: 451 },
  { flag: "CO", country: "Colombia", basePlaying: 1970, baseWinning: 239 },
  { flag: "CL", country: "Chile", basePlaying: 1330, baseWinning: 165 },
  { flag: "PE", country: "Peru", basePlaying: 1490, baseWinning: 188 },
  { flag: "ES", country: "Espana", basePlaying: 1710, baseWinning: 214 },
  { flag: "UY", country: "Uruguay", basePlaying: 780, baseWinning: 92 },
  { flag: "PY", country: "Paraguay", basePlaying: 690, baseWinning: 80 },
  { flag: "BO", country: "Bolivia", basePlaying: 830, baseWinning: 101 },
  { flag: "EC", country: "Ecuador", basePlaying: 1220, baseWinning: 149 },
  { flag: "BR", country: "Brasil", basePlaying: 4320, baseWinning: 570 },
  {
    flag: "US",
    country: "Estados Unidos",
    basePlaying: 3890,
    baseWinning: 505,
  },
  { flag: "CA", country: "Canada", basePlaying: 1440, baseWinning: 183 },
  { flag: "FR", country: "Francia", basePlaying: 1280, baseWinning: 160 },
  { flag: "IT", country: "Italia", basePlaying: 1360, baseWinning: 171 },
  { flag: "DE", country: "Alemania", basePlaying: 1570, baseWinning: 201 },
  { flag: "PT", country: "Portugal", basePlaying: 940, baseWinning: 118 },
  { flag: "GB", country: "Reino Unido", basePlaying: 1820, baseWinning: 236 },
  { flag: "IN", country: "India", basePlaying: 4680, baseWinning: 620 },
  { flag: "PH", country: "Filipinas", basePlaying: 1930, baseWinning: 248 },
  { flag: "ID", country: "Indonesia", basePlaying: 2140, baseWinning: 279 },
  { flag: "TR", country: "Turquia", basePlaying: 1670, baseWinning: 210 },
  { flag: "ZA", country: "Sudafrica", basePlaying: 990, baseWinning: 124 },
  { flag: "JP", country: "Japon", basePlaying: 1520, baseWinning: 190 },
  { flag: "KR", country: "Corea del Sur", basePlaying: 1480, baseWinning: 184 },
];

type LiveRow = {
  flag: string;
  country: string;
  playing: number;
  winning: number;
  trend: string;
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function buildLiveRow(countryIndex: number): LiveRow {
  const base = liveCountries[countryIndex];
  const playingDelta = randomBetween(-260, 420);
  const playing = Math.max(300, base.basePlaying + playingDelta);
  const winRate = randomBetween(11, 18) / 100;
  const winning = Math.max(40, Math.round(playing * winRate));
  const trendValue = randomBetween(4, 22);
  const trendSign = Math.random() < 0.86 ? "+" : "-";

  return {
    flag: base.flag,
    country: base.country,
    playing,
    winning,
    trend: `${trendSign}${trendValue}%`,
  };
}

function buildInitialRow(countryIndex: number): LiveRow {
  const base = liveCountries[countryIndex];
  const playing = base.basePlaying;
  const winning = Math.round(playing * 0.14);

  return {
    flag: base.flag,
    country: base.country,
    playing,
    winning,
    trend: "+12%",
  };
}

export function Header({
  onlineCount,
  onPlay,
  onGoJackpot,
  onOpenFiveGame,
  onDevTestFiveGame,
}: HeaderProps) {
  const [liveRow, setLiveRow] = useState<LiveRow>(() => buildInitialRow(0));
  const [pulseKey, setPulseKey] = useState(0);
  const [globalNow, setGlobalNow] = useState(48213);
  const currentIndexRef = useRef(0);
  const recentIndicesRef = useRef<number[]>([0]);

  useEffect(() => {
    setLiveRow(buildLiveRow(0));

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      const blocked = new Set(recentIndicesRef.current.slice(-3));
      const candidatePool = liveCountries
        .map((_, idx) => idx)
        .filter((idx) => !blocked.has(idx));
      const nextIndex = candidatePool.length
        ? candidatePool[randomBetween(0, candidatePool.length - 1)]
        : randomBetween(0, liveCountries.length - 1);

      currentIndexRef.current = nextIndex;
      recentIndicesRef.current = [...recentIndicesRef.current, nextIndex].slice(
        -4,
      );
      setLiveRow(buildLiveRow(nextIndex));
      setGlobalNow((prev) => Math.max(35000, prev + randomBetween(-320, 540)));
      setPulseKey((prev) => prev + 1);

      timeoutId = setTimeout(tick, randomBetween(1800, 4200));
    };

    timeoutId = setTimeout(tick, randomBetween(1600, 3000));
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <header className="py-8 pb-6 border-b border-[var(--border)] mb-6 relative xl:px-0 grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)_220px] md:items-start">
      <div
        className="absolute bottom-[-1px] left-0 right-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg,transparent,var(--mystik),transparent)",
        }}
      />

      {/* Enhanced Live Stats Dashboard */}
      <div className="flex flex-col gap-2 md:w-[220px] md:-ml-3">
        {/* Live Status Badge */}
        <div className="relative inline-flex items-center gap-[7px] font-mono text-[10px] tracking-[2px] text-[var(--green)] py-[5px] px-3 border border-[rgba(0,255,157,0.3)] rounded-full bg-[var(--greenS)] overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,255,157,0.3)] to-transparent animate-pulse" />
          </div>
          <div className="relative flex items-center gap-[7px]">
            <div
              className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"
              style={{ animation: "livepulse 1.4s infinite" }}
            />
            <span className="font-black">ACTIVO</span>
          </div>
        </div>

        {/* Main Stats Card */}
        <div className="relative w-full max-w-[270px] rounded-xl border border-[var(--border)] bg-[rgba(10,6,18,0.85)] backdrop-blur-sm p-4 text-left overflow-hidden group">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,rgba(0,255,157,0.1)_25%,rgba(0,255,157,0.1)_26%,transparent_27%,transparent_74%,rgba(0,255,157,0.1)_75%,rgba(0,255,157,0.1)_76%,transparent_77%,transparent)] bg-[size_20px_20px] animate-[slide_20s_linear_infinite]" />
          </div>

          {/* Header Section */}
          <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="font-mono text-[10px] tracking-[2px] text-[var(--mystik)] font-black">
                EN VIVO
              </div>
              <div className="w-1 h-1 rounded-full bg-[var(--mystik)] animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--green)] px-2 py-1 rounded-full border border-[rgba(0,255,157,0.2)] bg-[rgba(0,255,157,0.05)]">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"
                style={{ animation: "livepulse 1.4s infinite" }}
              />
              <span className="font-black">ACTIVO</span>
            </div>
          </div>

          {/* Global Players Counter */}
          <div className="relative mb-3">
            <div className="text-[12px] text-[var(--txt2)] leading-tight mb-1 font-mono tracking-[1px]">
              JUGADORES GLOBALES AHORA
            </div>
            <div className="relative inline-flex items-baseline gap-1">
              <span
                className="text-[24px] text-[var(--txt)] font-black font-mono tracking-tight"
                style={{ textShadow: "0 0 15px rgba(0,255,157,0.4)" }}
              >
                {globalNow.toLocaleString("es")}
              </span>
              <div className="absolute -top-1 -right-2">
                <div className="w-2 h-2 rounded-full bg-[var(--green)] opacity-60 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-[var(--green)] absolute top-0 left-0 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Country Stats with Enhanced Animation */}
          <div key={pulseKey} className="relative animate-[fadeup_0.45s_ease]">
            {/* Glitch Effect Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(179,136,255,0.3)] to-transparent animate-[shimmer_2s_infinite]" />
            </div>

            <div className="relative">
              {/* Country Flag and Name */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="text-2xl font-black text-[var(--txt)]"
                  style={{ textShadow: "0 0 20px rgba(179,136,255,0.5)" }}
                >
                  {liveRow.flag}
                </div>
                <div className="font-bold text-[16px] text-[var(--txt)] leading-tight">
                  {liveRow.country}
                </div>
              </div>

              {/* Player Stats */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="relative">
                  <div className="text-[12px] text-[var(--txt2)] font-mono tracking-[1px] mb-1">
                    JUGANDO
                  </div>
                  <div
                    className="text-[20px] text-[var(--txt)] font-black font-mono"
                    style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
                  >
                    {liveRow.playing.toLocaleString("es")}
                  </div>
                  <div className="absolute -top-1 -right-1 w-1 h-1 rounded-full bg-[var(--green)] animate-pulse" />
                </div>
                <div className="relative">
                  <div className="text-[12px] text-[var(--txt2)] font-mono tracking-[1px] mb-1">
                    GANANDO
                  </div>
                  <div
                    className="text-[20px] text-[var(--gold)] font-black font-mono"
                    style={{ textShadow: "0 0 15px rgba(255,215,0,0.6)" }}
                  >
                    {liveRow.winning.toLocaleString("es")}
                  </div>
                  <div className="absolute -top-1 -right-1 w-1 h-1 rounded-full bg-[var(--gold)] animate-pulse" />
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="relative flex items-center justify-between pt-2 border-t border-[rgba(179,136,255,0.1)]">
                <div className="text-[12px] text-[var(--txt2)] font-mono tracking-[1px]">
                  TENDENCIA
                </div>
                <div
                  className={`font-mono text-[18px] font-black leading-none ${liveRow.trend.startsWith("-") ? "text-[var(--rose)]" : "text-[var(--green)]"}`}
                  style={{
                    textShadow: `0 0 15px ${liveRow.trend.startsWith("-") ? "rgba(255,107,157,0.6)" : "rgba(0,255,157,0.6)"}`,
                  }}
                >
                  {liveRow.trend}
                </div>
              </div>
            </div>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[rgba(0,255,157,0.3)] rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[rgba(0,255,157,0.3)] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[rgba(0,255,157,0.3)] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[rgba(0,255,157,0.3)] rounded-br-lg" />
        </div>
      </div>

      {/* Logo */}
      <div className="text-center md:self-center">
        <div
          className="font-display font-black text-[60px] tracking-[12px] leading-none text-[var(--mystik)]"
          style={{
            textShadow:
              "0 0 25px rgba(179,136,255,0.6),0 0 60px rgba(179,136,255,0.2)",
          }}
        >
          MYSTIKA
        </div>
      </div>

      {/* ── Columna derecha ── */}
      <div className="hidden md:flex md:flex-col md:w-[200px] md:-mr-3 gap-2 shrink-0">
        {/* JACKPOT CTA */}
        <div
          className="relative rounded-lg border overflow-hidden p-3"
          style={{
            borderColor: "rgba(0,255,157,0.35)",
            background:
              "linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(10,6,18,0.95) 100%)",
            boxShadow: "0 0 20px rgba(0,255,157,0.1)",
          }}
        >
          {/* Corner deco */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[rgba(0,255,157,0.4)] rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[rgba(0,255,157,0.4)] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[rgba(0,255,157,0.4)] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[rgba(0,255,157,0.4)] rounded-br-lg" />

          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            <span className="font-mono text-[11px] tracking-[3px] text-[var(--green)] font-black">
              JACKPOT ACTIVO
            </span>
          </div>

          <div
            className="text-3xl mb-0.5"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,255,157,0.5))" }}
          >
            💵
          </div>

          <div
            className="font-display font-black text-[28px] leading-none mb-0.5"
            style={{
              color: "#00ff9d",
              textShadow: "0 0 20px rgba(0,255,157,0.6)",
            }}
          >
            $1,000
          </div>
          <div className="font-mono text-[10px] text-[var(--txt3)] tracking-[1.5px] mb-2.5">
            USD DISPONIBLE
          </div>

          <button
            onClick={onGoJackpot}
            className="w-full py-2 rounded-md font-mono text-[11px] tracking-[0.14em] font-black transition-all hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #00cc7a, #00ff9d)",
              color: "#0a0612",
              boxShadow: "0 4px 16px rgba(0,255,157,0.35)",
            }}
          >
            JUGAR AHORA →
          </button>
        </div>

        {/* Mini juego Minas $5 — compacto bajo jackpot */}
        <div
          className="relative rounded-lg border overflow-hidden p-3"
          style={{
            borderColor: "rgba(255,215,0,0.38)",
            background:
              "linear-gradient(145deg, rgba(255,215,0,0.1) 0%, rgba(10,6,18,0.97) 55%)",
            boxShadow:
              "0 0 18px rgba(255,215,0,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[rgba(255,215,0,0.4)] rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[rgba(255,215,0,0.4)] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[rgba(255,215,0,0.4)] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[rgba(255,215,0,0.4)] rounded-br-lg" />

          <div className="flex items-center justify-center gap-2 mb-2.5">
            <span
              className="text-[26px] leading-none shrink-0"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,215,0,0.45))" }}
              aria-hidden
            >
              ⛏️
            </span>
            <h3
              className="font-display font-black text-[22px] leading-none tracking-[0.5px]"
            >
              <span className="text-[var(--txt)]">GANATE </span>
              <span
                style={{
                  color: "#ffd700",
                  textShadow: "0 0 16px rgba(255,215,0,0.45)",
                }}
              >
                $5
              </span>
            </h3>
          </div>

          <button
            type="button"
            onClick={onOpenFiveGame}
            className="w-full py-2 rounded-md font-mono text-[10px] tracking-[0.14em] font-black transition-all hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #e8b84a, #ffd700)",
              color: "#1a1205",
              boxShadow: "0 4px 14px rgba(255,215,0,0.3)",
            }}
          >
            ABRIR →
          </button>

          {onDevTestFiveGame && (
            <button
              type="button"
              onClick={onDevTestFiveGame}
              title="Solo servidor dev local"
              className="mt-1.5 w-full py-0.5 rounded border border-dashed border-amber-400/45 bg-amber-500/8 font-mono text-[7px] font-bold tracking-[0.1em] text-amber-200/80 transition-colors hover:bg-amber-500/15 active:scale-95"
            >
              PROBAR
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
