"use client";

import type { LlaveTierInfo } from "@/lib/llaves-data";

const AURUM_BULBS = 14;
const BULB_COLORS = ["#ffd700", "#ffe566", "#ffb347", "#fff8dc", "#c9a227"];

export function AurumInsertAtmosphere({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes aurum-orb {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.06); }
        }
        @keyframes aurum-dust {
          0%, 100% { opacity: 0.15; transform: translateY(0); }
          50% { opacity: 0.7; transform: translateY(-6px); }
        }
      `}</style>
      <div
        className="absolute left-1/2 top-[28%] h-[320px] w-[min(92vw,520px)] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle, rgba(255,215,0,0.22) 0%, rgba(255,180,50,0.08) 45%, transparent 70%)",
          opacity: active ? 1 : 0.65,
          animation: "aurum-orb 5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/2 top-[32%] h-[200px] w-[min(70vw,380px)] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle, rgba(179,136,255,0.12) 0%, transparent 65%)",
          animation: "aurum-orb 7s ease-in-out infinite 1s",
        }}
      />
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${22 + ((i * 13) % 56)}%`,
            top: `${30 + ((i * 19) % 40)}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: "#ffd700",
            boxShadow: "0 0 8px rgba(255,215,0,0.8)",
            animation: `aurum-dust ${2 + (i % 4) * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.22}s`,
          }}
        />
      ))}
    </div>
  );
}

export function AurumReadyKeyCard({ info }: { info: LlaveTierInfo }) {
  return (
    <div className="relative mx-auto mb-6 w-full max-w-[300px]">
      <style>{`
        @keyframes aurum-ready-bulb {
          0%, 100% { opacity: 0.35; filter: brightness(0.6); }
          16% { opacity: 1; filter: brightness(1.4); }
          30% { opacity: 0.8; filter: brightness(1); }
        }
        @keyframes aurum-key-halo {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes aurum-key-float {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-6px) rotate(6deg); }
        }
      `}</style>

      {Array.from({ length: AURUM_BULBS }, (_, i) => {
        const left = 6 + (i / (AURUM_BULBS - 1)) * 88;
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <div
            key={i}
            className="pointer-events-none absolute z-[2] rounded-full -translate-x-1/2"
            style={{
              left: `${left}%`,
              top: 6,
              width: 9,
              height: 9,
              background: `radial-gradient(circle at 30% 25%, #fff 0%, ${color} 50%, ${color}cc 100%)`,
              border: `1.5px solid ${color}`,
              boxShadow: `0 0 12px ${color}99`,
              animation: `aurum-ready-bulb 1.8s ease-in-out infinite`,
              animationDelay: `${(i / AURUM_BULBS) * 1.8}s`,
            }}
          />
        );
      })}

      <div
        className="relative overflow-hidden rounded-2xl border-2 px-6 py-7 sm:py-8 text-center"
        style={{
          borderColor: "rgba(255,215,0,0.55)",
          background:
            "linear-gradient(165deg, rgba(255,215,0,0.14) 0%, rgba(12,8,22,0.95) 38%, rgba(8,5,14,1) 100%)",
          boxShadow:
            "0 0 48px rgba(255,215,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12), 0 20px 50px rgba(0,0,0,0.45)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, #ffd700, #fff8dc, #ffd700, transparent)",
          }}
        />

        <span className="inline-block font-mono text-[10px] tracking-[0.35em] text-[#ffd700] mb-3 font-black">
          ✦ AURUM PREMIUM ✦
        </span>

        <div className="relative mx-auto mb-4 flex h-[108px] w-[108px] items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 70%)",
              animation: "aurum-key-halo 2.4s ease-in-out infinite",
            }}
          />
          <div
            className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border-2"
            style={{
              background: info.keyColor,
              borderColor: "rgba(255,248,220,0.65)",
              boxShadow: `${info.keyShadow}, inset 0 4px 12px rgba(255,255,255,0.35)`,
              animation: "aurum-key-float 3s ease-in-out infinite",
            }}
          >
            <span
              className="text-[52px] leading-none"
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}
            >
              🔑
            </span>
          </div>
        </div>

        <p className="font-display font-black text-[15px] tracking-[0.12em] text-[#fff8e7] mb-1">
          {info.shortName.toUpperCase()}
        </p>
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-[15px] font-black tracking-wider"
          style={{
            background: "linear-gradient(135deg, #ffe566, #c9a227)",
            color: "#1a1205",
            boxShadow: "0 0 24px rgba(255,215,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          $20 USD
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-[var(--gold3)]">
          Cofre simbólico hasta USD {info.advertisedUSD}
        </p>
      </div>
    </div>
  );
}

export function AurumCofreCrown() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-4 top-3 h-px z-[2]"
        aria-hidden
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.7), transparent)",
        }}
      />
      <span
        className="pointer-events-none absolute left-3 top-3 z-[2] text-[11px] opacity-80"
        style={{ color: "#ffd700", textShadow: "0 0 8px rgba(255,215,0,0.8)" }}
        aria-hidden
      >
        ✦
      </span>
      <span
        className="pointer-events-none absolute right-3 top-3 z-[2] text-[11px] opacity-80"
        style={{ color: "#ffd700", textShadow: "0 0 8px rgba(255,215,0,0.8)" }}
        aria-hidden
      >
        ✦
      </span>
    </>
  );
}
