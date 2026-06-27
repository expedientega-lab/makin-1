"use client";

const PRIZE_BULB_COLORS = ["#00ff9d", "#ffd700", "#00ff9d", "#ffec8a"];

interface JackpotPrizeLightsProps {
  active?: boolean;
}

/** Luces animadas en el marco del premio $1,000 */
export function JackpotPrizeLights({ active = true }: JackpotPrizeLightsProps) {
  const corners = [
    { left: "4%", top: "12%" },
    { left: "4%", top: "50%" },
    { left: "4%", top: "88%" },
    { right: "4%", top: "12%" },
    { right: "4%", top: "50%" },
    { right: "4%", top: "88%" },
  ];

  return (
    <>
      <style>{`
        @keyframes jackpot-prize-bulb {
          0%, 100% { opacity: 0.35; transform: scale(0.8); filter: brightness(0.6); }
          30% { opacity: 1; transform: scale(1.15); filter: brightness(1.3); }
          50% { opacity: 0.9; transform: scale(1); }
        }
      `}</style>
      {corners.map((pos, i) => {
        const color = PRIZE_BULB_COLORS[i % PRIZE_BULB_COLORS.length];
        return (
          <span
            key={i}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              ...("left" in pos ? { left: pos.left } : { right: pos.right }),
              top: pos.top,
              background: `radial-gradient(circle at 30% 25%, #fff, ${color})`,
              border: `1.5px solid ${color}`,
              boxShadow: `0 0 12px ${color}, 0 0 22px ${color}99`,
              animation: active
                ? `jackpot-prize-bulb 1.6s ease-in-out infinite`
                : undefined,
              animationDelay: active ? `${(i / corners.length) * 1.6}s` : undefined,
            }}
          />
        );
      })}
    </>
  );
}
