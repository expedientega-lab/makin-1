"use client";

const BULB_COLORS = [
  { on: "#ffd700", glow: "rgba(255,215,0,0.9)" },
  { on: "#ffec8a", glow: "rgba(255,236,138,0.85)" },
  { on: "#b388ff", glow: "rgba(179,136,255,0.9)" },
  { on: "#ff6b9d", glow: "rgba(255,107,157,0.85)" },
  { on: "#00ff9d", glow: "rgba(0,255,157,0.8)" },
  { on: "#00e5ff", glow: "rgba(0,229,255,0.8)" },
];

interface OrbMarqueeLightsProps {
  active: boolean;
  frantic?: boolean;
  count?: number;
  className?: string;
  /** Área cuadrada para órbita de premios (pantalla principal del orbe) */
  square?: boolean;
  /** Sin halo interior: solo bombillas y marco (jackpot premium) */
  premium?: boolean;
  /** Luces en el borde exterior de la franja; el contenido queda adentro sin efectos */
  edgeLights?: boolean;
  /** Solo marco / halo, sin bombillas alrededor */
  hideBulbs?: boolean;
  children: React.ReactNode;
}

export function OrbMarqueeLights({
  active,
  frantic = false,
  count = 20,
  className = "",
  square = false,
  premium = false,
  edgeLights = false,
  hideBulbs = false,
  children,
}: OrbMarqueeLightsProps) {
  const edgeRect = { left: 3, top: 3, right: 97, bottom: 97 };
  const edgeWidth = edgeRect.right - edgeRect.left;
  const edgeHeight = edgeRect.bottom - edgeRect.top;
  const edgePerimeter = 2 * (edgeWidth + edgeHeight);

  const bulbs = Array.from({ length: count }, (_, i) => {
    let left = 50;
    let top = 50;

    if (edgeLights) {
      const distance = (i / count) * edgePerimeter;
      if (distance < edgeWidth) {
        left = edgeRect.left + distance;
        top = edgeRect.top;
      } else if (distance < edgeWidth + edgeHeight) {
        left = edgeRect.right;
        top = edgeRect.top + (distance - edgeWidth);
      } else if (distance < edgeWidth * 2 + edgeHeight) {
        left = edgeRect.right - (distance - edgeWidth - edgeHeight);
        top = edgeRect.bottom;
      } else {
        left = edgeRect.left;
        top = edgeRect.bottom - (distance - edgeWidth * 2 - edgeHeight);
      }
    } else {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const rx = square ? 38 : 50.8;
      const ry = square ? 38 : 49.2;
      left = 50 + Math.cos(angle) * rx;
      top = 50 + Math.sin(angle) * ry;
    }

    const color = BULB_COLORS[i % BULB_COLORS.length];
    return { i, left, top, color };
  });

  const chasePeriod = frantic ? 0.9 : 1.8;

  return (
    <div
      className={[
        "relative overflow-visible",
        edgeLights ? "p-4 sm:p-5" : "",
        className,
      ].join(" ")}
    >
      <style>{`
        @keyframes orb-marquee-chase {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.75); filter: brightness(0.55); }
          12% { opacity: 1; transform: translate(-50%, -50%) scale(1.18); filter: brightness(1.4); }
          22% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes orb-frame-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }
      `}</style>

      {active && !premium && !edgeLights && (
        <div
          className="absolute inset-[-4%] rounded-2xl sm:rounded-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.06) 0%, transparent 70%)",
            boxShadow:
              "0 0 40px rgba(179,136,255,0.2), 0 0 50px rgba(255,215,0,0.08)",
            animation: "orb-frame-glow 2.5s ease-in-out infinite",
          }}
          aria-hidden
        />
      )}

      {active && premium && !edgeLights && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255,215,0,0.35), inset 0 0 24px rgba(179,136,255,0.08), 0 0 32px rgba(179,136,255,0.25), 0 0 48px rgba(255,215,0,0.12)",
            animation: "orb-frame-glow 3s ease-in-out infinite",
          }}
          aria-hidden
        />
      )}

      {!hideBulbs &&
        bulbs.map(({ i, left, top, color }) => (
        <div
          key={i}
          className="absolute z-[3] pointer-events-none"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animation: active
              ? `orb-marquee-chase ${chasePeriod}s ease-in-out infinite`
              : undefined,
            animationDelay: active ? `${(i / count) * chasePeriod}s` : undefined,
          }}
        >
          <div
            className="rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "clamp(9px, 2.4vw, 13px)",
              height: "clamp(9px, 2.4vw, 13px)",
              background: active
                ? `radial-gradient(circle at 30% 25%, #fff 0%, ${color.on} 42%, ${color.on}cc 100%)`
                : "radial-gradient(circle at 30% 25%, #4a3d5c 0%, #16121f 100%)",
              border: active
                ? `2px solid ${color.on}`
                : "2px solid rgba(50,42,65,0.8)",
              boxShadow: active
                ? `0 0 14px ${color.glow}, 0 0 26px ${color.glow}, inset 0 -2px 3px rgba(0,0,0,0.3)`
                : "inset 0 2px 4px rgba(0,0,0,0.5)",
            }}
          />
        </div>
        ))}

      <div
        className={[
          "relative z-[5] w-full",
          square ? "aspect-square" : "",
          edgeLights ? "rounded-2xl overflow-hidden backdrop-blur-xl" : "",
        ].join(" ")}
        style={
          edgeLights
            ? {
                background: "rgba(8, 5, 14, 0.5)",
                border: "1px solid rgba(179, 136, 255, 0.28)",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
