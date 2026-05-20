"use client";

import { displayPrizes, activityFeed, reviews } from "@/lib/mystika-data";

export function MainSection() {
  return (
    <div className="animate-[fadeup_0.4s_ease]">
      {/* Title */}
      <div className="text-center py-1.5 pb-[18px]">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          PORTAL DE DESTINO
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h1
          className="font-display font-black leading-[0.95] tracking-[2px] mb-2.5"
          style={{ fontSize: "clamp(32px,8vw,50px)" }}
        >
          Gira el Orbe Mistico
        </h1>
        <p className="text-[13px] text-[var(--txt2)] max-w-[380px] mx-auto leading-[1.8] font-light">
          Gana premios digitales increibles. El orbe revela tu destino con cada
          giro.
        </p>
      </div>

      {/* PRIZES - Big and Eye-catching */}
      <div className="mb-6">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--mystik3)] flex items-center gap-3.5 mb-4 justify-center">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          PREMIOS DISPONIBLES
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>

        {/* Main Prizes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* $1,000 USD - JACKPOT */}
          <div
            className="relative p-6 rounded-xl border-2 overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              borderColor: "rgba(0,255,157,0.4)",
              background:
                "linear-gradient(145deg, rgba(0,255,157,0.1), rgba(21,14,36,0.95))",
              boxShadow:
                "0 0 30px rgba(0,255,157,0.2), inset 0 0 20px rgba(0,255,157,0.05)",
            }}
          >
            <div className="absolute top-2 right-2 px-3 py-1 rounded-md bg-[#00ff9d] text-[#0a0612] font-mono text-[10px] font-black tracking-[1.5px] shadow-[0_0_12px_rgba(0,255,157,0.45)]">
              JACKPOT
            </div>
            <div
              className="text-5xl mb-2"
              style={{ filter: "drop-shadow(0 0 15px rgba(0,255,157,0.6))" }}
            >
              💵
            </div>
            <div className="text-[22px] leading-tight text-[var(--txt)] font-black uppercase">
              DOLARES USD
            </div>
            <div
              className="font-display font-black text-4xl text-[#00ff9d] mb-1 mt-1"
              style={{ textShadow: "0 0 20px rgba(0,255,157,0.5)" }}
            >
              $1,000
            </div>
            <div className="mt-1 text-[13px] leading-snug text-[var(--txt)] font-semibold">
              Ganas: dolares visuales valorados en $1,000
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 bg-[rgba(0,255,157,0.2)] rounded-full overflow-hidden">
                <div
                  className="h-full w-[12%] bg-[#00ff9d] rounded-full"
                  style={{ boxShadow: "0 0 10px #00ff9d" }}
                />
              </div>
              <span className="font-mono text-[13px] font-black text-[#00ff9d]">
                12%
              </span>
            </div>
            {/* Animated shine */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,255,157,0.1), transparent)",
                animation: "shimmer 2s infinite",
              }}
            />
          </div>

          {/* Bot Trading */}
          <div
            className="relative p-6 rounded-xl border-2 overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              borderColor: "rgba(0,229,255,0.4)",
              background:
                "linear-gradient(145deg, rgba(0,229,255,0.1), rgba(21,14,36,0.95))",
              boxShadow:
                "0 0 30px rgba(0,229,255,0.2), inset 0 0 20px rgba(0,229,255,0.05)",
            }}
          >
            <div className="absolute top-2 right-2 px-3 py-1 rounded-md bg-[rgba(0,229,255,0.22)] text-[#52edff] font-mono text-[10px] font-black tracking-[1.5px] border border-[rgba(82,237,255,0.55)] shadow-[0_0_12px_rgba(0,229,255,0.3)]">
              POPULAR
            </div>
            <div
              className="text-5xl mb-2"
              style={{ filter: "drop-shadow(0 0 15px rgba(0,229,255,0.6))" }}
            >
              🤖
            </div>
            <div className="text-[22px] leading-tight text-[var(--txt)] font-black uppercase">
              BOT DE TRADING
            </div>
            <div
              className="font-display font-black text-4xl text-[#00e5ff] mb-1 mt-1"
              style={{ textShadow: "0 0 20px rgba(0,229,255,0.5)" }}
            >
              $70
            </div>
            <div className="mt-1 text-[13px] leading-snug text-[var(--txt)] font-semibold">
              Ganas: bot de trading valorado en $70
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 bg-[rgba(0,229,255,0.2)] rounded-full overflow-hidden">
                <div
                  className="h-full w-[28%] bg-[#00e5ff] rounded-full"
                  style={{ boxShadow: "0 0 10px #00e5ff" }}
                />
              </div>
              <span className="font-mono text-[13px] font-black text-[#00e5ff]">
                28%
              </span>
            </div>
          </div>

          {/* Caja Misteriosa */}
          <div
            className="relative p-6 rounded-xl border-2 overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              borderColor: "rgba(255,107,157,0.4)",
              background:
                "linear-gradient(145deg, rgba(255,107,157,0.1), rgba(21,14,36,0.95))",
              boxShadow:
                "0 0 30px rgba(255,107,157,0.2), inset 0 0 20px rgba(255,107,157,0.05)",
            }}
          >
            <div
              className="text-5xl mb-2"
              style={{
                filter: "drop-shadow(0 0 15px rgba(255,107,157,0.6))",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              📦
            </div>
            <div className="text-[22px] leading-tight text-[var(--txt)] font-black uppercase">
              CAJA MISTERIOSA
            </div>
            <div
              className="font-display font-black text-4xl text-[#ff6b9d] mb-1 mt-1"
              style={{ textShadow: "0 0 20px rgba(255,107,157,0.5)" }}
            >
              $150
            </div>
            <div className="mt-1 text-[13px] leading-snug text-[var(--txt)] font-semibold">
              Ganas: caja misteriosa valorada en $150
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 bg-[rgba(255,107,157,0.2)] rounded-full overflow-hidden">
                <div
                  className="h-full w-[22%] bg-[#ff6b9d] rounded-full"
                  style={{ boxShadow: "0 0 10px #ff6b9d" }}
                />
              </div>
              <span className="font-mono text-[13px] font-black text-[#ff6b9d]">
                22%
              </span>
            </div>
          </div>

          {/* Gift card */}
          <div
            className="relative p-6 rounded-xl border-2 overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              borderColor: "rgba(163,163,163,0.4)",
              background:
                "linear-gradient(145deg, rgba(163,163,163,0.1), rgba(21,14,36,0.95))",
              boxShadow:
                "0 0 30px rgba(163,163,163,0.2), inset 0 0 20px rgba(163,163,163,0.05)",
            }}
          >
            <div
              className="text-5xl mb-2"
              style={{ filter: "drop-shadow(0 0 15px rgba(163,163,163,0.6))" }}
            >
              💳
            </div>
            <div className="text-[22px] leading-tight text-[var(--txt)] font-black uppercase">
              TARJETA DE AMAZON
            </div>
            <div
              className="font-display font-black text-4xl text-[#d4d4d4] mb-1 mt-1"
              style={{ textShadow: "0 0 20px rgba(163,163,163,0.5)" }}
            >
              $50
            </div>
            <div className="mt-1 text-[13px] leading-snug text-[var(--txt)] font-semibold">
              Ganas: tarjeta de Amazon valorada en $50
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 bg-[rgba(163,163,163,0.2)] rounded-full overflow-hidden">
                <div
                  className="h-full w-[18%] bg-[#d4d4d4] rounded-full"
                  style={{ boxShadow: "0 0 10px #d4d4d4" }}
                />
              </div>
              <span className="font-mono text-[13px] font-black text-[#d4d4d4]">
                18%
              </span>
            </div>
          </div>
        </div>

        {/* Galleta Mistica - Full Width, Always Wins */}
        <div
          className="relative p-6 rounded-xl border-2 overflow-hidden group cursor-pointer transition-all hover:scale-[1.01]"
          style={{
            borderColor: "rgba(255,215,0,0.5)",
            background:
              "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(179,136,255,0.1), rgba(21,14,36,0.95))",
            boxShadow:
              "0 0 40px rgba(255,215,0,0.25), inset 0 0 30px rgba(255,215,0,0.08)",
          }}
        >
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-[var(--gold)] text-[#0a0612] font-mono text-[10px] font-black tracking-[1.5px] flex items-center gap-1.5 shadow-[0_0_14px_rgba(255,215,0,0.45)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a0612] animate-pulse" />
            GARANTIZADA
          </div>
          <div className="flex items-center gap-5">
            <div
              className="text-6xl"
              style={{
                filter: "drop-shadow(0 0 20px rgba(255,215,0,0.7))",
                animation: "mystikpulse 2s ease-in-out infinite",
              }}
            >
              🥠
            </div>
            <div>
              <div
                className="font-display font-black text-4xl text-[var(--gold)] mb-1"
                style={{ textShadow: "0 0 25px rgba(255,215,0,0.6)" }}
              >
                GALLETA MISTICA
              </div>
              <div className="text-[14px] text-[var(--txt)] font-medium">
                Ganas: galleta mistica real + mensaje personalizado
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-40 bg-[rgba(255,215,0,0.2)] rounded-full overflow-hidden">
                  <div
                    className="h-full w-[65%] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #cc9900, var(--gold))",
                      boxShadow: "0 0 15px var(--gold)",
                    }}
                  />
                </div>
                <span className="font-mono text-[14px] text-[var(--gold)] font-black">
                  65%
                </span>
              </div>
            </div>
          </div>
          {/* Animated particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[var(--gold)]"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  opacity: 0.4,
                  animation: `star-twinkle ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Guarantee Banner */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          "🥠 Galleta garantizada",
          "✨ Mensaje unico",
          "🔮 Pago seguro",
          "⚡ Instantaneo",
        ].map((text, i) => (
          <div
            key={i}
            className="flex-1 min-w-[120px] flex items-center gap-2 justify-center p-4 px-3 rounded-md border border-[var(--border)] bg-[var(--bg2)] text-[15px] font-semibold text-[var(--txt)] transition-[border-color] hover:border-[var(--borderH)]"
          >
            {text}
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden mb-5 bg-[var(--bg1)]">
        <div className="p-2 px-4 bg-[var(--bg2)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="font-mono text-[13px] tracking-[4px] text-[var(--mystik3)]">
            GANADORES RECIENTES
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[13px] font-bold text-[var(--green)]">
            <div
              className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"
              style={{ animation: "livepulse 1.4s infinite" }}
            />
            EN VIVO
          </div>
        </div>
        <div className="max-h-[160px] overflow-hidden relative">
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(transparent,var(--bg1))" }}
          />
          {activityFeed.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-3 px-4 border-b border-[rgba(179,136,255,0.04)] text-sm hover:bg-[var(--mystikG)]"
            >
              <div className="text-base flex-shrink-0">{item.icon}</div>
              <div>
                <span className="font-semibold text-[var(--mystik)] font-mono text-[14px]">
                  {item.user}
                </span>{" "}
                <span className="text-[var(--txt)] text-[15px]">
                  {item.item}
                </span>
              </div>
              <div className="font-mono text-[13px] text-[var(--txt2)] whitespace-nowrap ml-auto">
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-3.5">
        <div className="font-mono text-[11px] tracking-[5px] text-[var(--mystik3)] flex items-center gap-3.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          TESTIMONIOS
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-7">
        {reviews.slice(0, 3).map((review, i) => {
          const avatarColors: Record<string, string> = {
            av1: "bg-[rgba(179,136,255,0.15)] border-[rgba(179,136,255,0.25)] text-[var(--mystik)]",
            av2: "bg-[rgba(255,215,0,0.1)] border-[rgba(255,215,0,0.2)] text-[var(--gold)]",
            av3: "bg-[rgba(0,255,157,0.1)] border-[rgba(0,255,157,0.2)] text-[var(--green)]",
            av4: "bg-[rgba(255,107,157,0.1)] border-[rgba(255,107,157,0.2)] text-[var(--rose)]",
          };
          return (
            <div
              key={i}
              className="flex items-start gap-3.5 p-4 rounded-lg bg-[var(--bg2)] border border-[var(--border)] transition-[border-color] hover:border-[var(--borderH)]"
            >
              <div
                className={`w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center font-display font-bold text-[17px] border ${avatarColors[review.avatarClass]}`}
              >
                {review.initial}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[15px] font-bold text-[var(--txt)]">
                    {review.name}
                  </span>
                  <span className="font-mono text-[11px] tracking-[2px] text-[var(--mystik3)]">
                    {review.location}
                  </span>
                </div>
                <div className="text-[var(--gold)] text-[13px] tracking-[2px] mb-1">
                  {review.stars}
                </div>
                <div className="text-[15px] text-[var(--txt)] leading-[1.65] font-medium">
                  {review.message}
                </div>
                <div className="inline-flex items-center gap-[5px] mt-2 py-1 px-3 rounded bg-[var(--mystikG)] border border-[var(--border)] font-mono text-[11px] text-[var(--mystik)]">
                  {review.prize}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
