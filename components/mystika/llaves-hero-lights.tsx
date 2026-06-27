"use client";

const TOP_BULBS = 8;
const BULB_COLORS = ["#ffd700", "#b388ff", "#e8b84a", "#00e5ff", "#ff6b9d", "#00ff9d"];

export function LlavesHeroLights() {
  return (
    <header className="relative w-full mb-5 overflow-hidden rounded-2xl px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
      <style>{`
        @keyframes llaves-hero-bulb {
          0%, 100% { opacity: 0.22; filter: brightness(0.5); }
          18% { opacity: 0.75; filter: brightness(1.05); }
          32% { opacity: 0.5; filter: brightness(0.85); }
        }
        @keyframes llaves-hero-glow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.45; }
        }
        @keyframes llaves-hero-shine {
          0% { transform: translateX(-120%) skewX(-14deg); opacity: 0; }
          25% { opacity: 0.5; }
          100% { transform: translateX(180%) skewX(-14deg); opacity: 0; }
        }
        @keyframes llaves-hero-key-pulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(255,215,0,0.4)); }
          50% { filter: drop-shadow(0 0 18px rgba(179,136,255,0.85)); }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 0%, rgba(255,215,0,0.07) 0%, transparent 52%), radial-gradient(ellipse 70% 55% at 50% 100%, rgba(179,136,255,0.05) 0%, transparent 50%), linear-gradient(180deg, rgba(12,8,22,0.6) 0%, rgba(8,5,14,0.85) 100%)",
          border: "1px solid rgba(179,136,255,0.18)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px rgba(179,136,255,0.1), 0 0 32px rgba(255,215,0,0.03)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, transparent, #b388ff, #ffd700, #b388ff, transparent)",
          animation: "llaves-hero-glow 3s ease-in-out infinite",
        }}
      />

      {Array.from({ length: TOP_BULBS }, (_, i) => {
        const left = 4 + (i / (TOP_BULBS - 1)) * 92;
        const color = BULB_COLORS[i % BULB_COLORS.length];
        const period = 1.9;
        return (
          <div
            key={`top-${i}`}
            className="pointer-events-none absolute z-[2] rounded-full -translate-x-1/2"
            style={{
              left: `${left}%`,
              top: 10,
              width: "clamp(5px, 1.2vw, 7px)",
              height: "clamp(5px, 1.2vw, 7px)",
              background: `radial-gradient(circle at 30% 25%, #fff 0%, ${color} 48%, ${color}cc 100%)`,
              border: `1px solid ${color}`,
              boxShadow: `0 0 5px ${color}66, 0 0 8px ${color}33`,
              animation: `llaves-hero-bulb ${period}s ease-in-out infinite`,
              animationDelay: `${(i / TOP_BULBS) * period}s`,
            }}
          />
        );
      })}

      {Array.from({ length: TOP_BULBS }, (_, i) => {
        const left = 4 + (i / (TOP_BULBS - 1)) * 92;
        const color = BULB_COLORS[(i + 2) % BULB_COLORS.length];
        const period = 2.1;
        return (
          <div
            key={`bot-${i}`}
            className="pointer-events-none absolute z-[2] rounded-full -translate-x-1/2"
            style={{
              left: `${left}%`,
              bottom: 10,
              width: "clamp(5px, 1.2vw, 7px)",
              height: "clamp(5px, 1.2vw, 7px)",
              background: `radial-gradient(circle at 30% 25%, #fff 0%, ${color} 48%, ${color}cc 100%)`,
              border: `1px solid ${color}`,
              boxShadow: `0 0 5px ${color}66, 0 0 8px ${color}33`,
              animation: `llaves-hero-bulb ${period}s ease-in-out infinite`,
              animationDelay: `${((TOP_BULBS - 1 - i) / TOP_BULBS) * period}s`,
            }}
          />
        );
      })}

      <div
        className="pointer-events-none absolute inset-y-4 left-3 w-px opacity-35"
        aria-hidden
        style={{
          background: "linear-gradient(180deg, transparent, rgba(255,215,0,0.5), rgba(179,136,255,0.5), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-4 right-3 w-px opacity-35"
        aria-hidden
        style={{
          background: "linear-gradient(180deg, transparent, rgba(179,136,255,0.5), rgba(255,215,0,0.5), transparent)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        aria-hidden
      >
        <div
          className="absolute inset-y-0 w-[45%]"
          style={{
            background:
              "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.025) 50%, transparent 100%)",
            animation: "llaves-hero-shine 5.5s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-[3] text-center">
        <div className="font-mono text-[12px] sm:text-[13px] tracking-[0.35em] text-[var(--mystik3)] flex items-center justify-center gap-3 mb-3">
          <span
            className="flex-1 max-w-[80px] sm:max-w-[140px] lg:max-w-[220px] h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.7), rgba(179,136,255,0.5))",
              boxShadow: "0 0 5px rgba(255,215,0,0.2)",
            }}
          />
          <span
            style={{
              textShadow: "0 0 8px rgba(179,136,255,0.35), 0 0 14px rgba(255,215,0,0.12)",
            }}
          >
            LLAVES CÓSMICAS
          </span>
          <span
            className="flex-1 max-w-[80px] sm:max-w-[140px] lg:max-w-[220px] h-px"
            style={{
              background: "linear-gradient(90deg, rgba(179,136,255,0.5), rgba(255,215,0,0.7), transparent)",
              boxShadow: "0 0 5px rgba(255,215,0,0.2)",
            }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1">
          <span
            className="text-[22px] sm:text-[26px] opacity-90 hidden sm:inline"
            style={{ animation: "llaves-hero-key-pulse 2.8s ease-in-out infinite" }}
            aria-hidden
          >
            🔑
          </span>
          <h2
            className="font-display font-black leading-[0.92] tracking-[1px] sm:tracking-[2px] text-[var(--txt)]"
            style={{
              fontSize: "clamp(36px,5.2vw,62px)",
              textShadow:
                "0 0 28px rgba(255,255,255,0.12), 0 2px 0 rgba(0,0,0,0.4)",
            }}
          >
            Comprá tu{" "}
            <span
              className="text-[var(--mystik)]"
              style={{
                textShadow:
                  "0 0 14px rgba(179,136,255,0.5), 0 0 24px rgba(179,136,255,0.2), 0 0 8px rgba(255,215,0,0.15)",
              }}
            >
              llave
            </span>
          </h2>
        </div>
      </div>
    </header>
  );
}
