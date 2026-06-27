"use client";

const STEPS = [
  { n: 1, short: "1.er" },
  { n: 2, short: "2.º" },
  { n: 3, short: "3.er" },
] as const;

export function JackpotTopCompact({
  amount,
  topLabel,
  bottomLabel,
  icon,
  spinsCompleted,
  currentSpin,
  cycleComplete,
  sessionPaid,
}: {
  amount: string;
  topLabel: string;
  bottomLabel: string;
  icon: string;
  spinsCompleted: number;
  currentSpin: number;
  cycleComplete: boolean;
  sessionPaid: boolean;
}) {
  return (
    <section
      className="mb-3 rounded-xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,10,22,0.95) 0%, rgba(8,5,14,0.98) 100%)",
        border: "1px solid rgba(0,255,157,0.22)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <div className="flex-1 px-4 py-3 sm:py-3.5 border-b sm:border-b-0 sm:border-r border-white/[0.06]">
          <p className="font-mono text-[9px] tracking-[0.32em] text-[var(--mystik3)] mb-1">
            PORTAL DEL JACKPOT
          </p>
          <h2
            className="font-display font-black leading-none tracking-[0.5px]"
            style={{ fontSize: "clamp(22px,4.5vw,34px)" }}
          >
            <span className="text-[var(--txt)]">Ganate </span>
            <span
              className="text-[#00ff9d]"
              style={{ textShadow: "0 0 20px rgba(0,255,157,0.35)" }}
            >
              $1,000 USD
            </span>
          </h2>
          <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[var(--txt3)]">
            3 giros · $1 USD
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 sm:min-w-[200px] sm:justify-end">
          <div className="text-left sm:text-right flex-1 sm:flex-none">
            <p className="font-mono text-[8px] tracking-[0.22em] text-[#00ff9d]/90 mb-0.5">
              {topLabel}
            </p>
            <p
              className="font-display font-black leading-none text-[#00ff9d]"
              style={{
                fontSize: "clamp(28px,6vw,40px)",
                textShadow: "0 0 16px rgba(0,255,157,0.4)",
              }}
            >
              {amount}
            </p>
            <p className="font-mono text-[8px] tracking-[0.12em] text-[var(--txt3)] mt-0.5">
              {bottomLabel}
            </p>
          </div>
          <span
            className="text-[32px] sm:text-[36px] leading-none shrink-0 opacity-95"
            style={{ filter: "drop-shadow(0 0 12px rgba(0,255,157,0.35))" }}
            aria-hidden
          >
            {icon}
          </span>
        </div>
      </div>

      <div
        className="grid grid-cols-3 border-t border-white/[0.06]"
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        {STEPS.map((step) => {
          const done = spinsCompleted >= step.n;
          const active = !cycleComplete && currentSpin === step.n && sessionPaid;
          return (
            <div
              key={step.n}
              className={[
                "px-2 py-2 text-center transition-colors",
                active ? "bg-[rgba(0,255,157,0.08)]" : "",
              ].join(" ")}
            >
              <div
                className={[
                  "font-mono text-[8px] tracking-[0.18em] font-bold",
                  active ? "text-[#00ff9d]" : done ? "text-[var(--mystik3)]" : "text-[var(--txt3)]",
                ].join(" ")}
              >
                GIRO {step.short}
              </div>
              <div
                className={[
                  "mt-0.5 h-1 w-full max-w-[48px] mx-auto rounded-full",
                  active
                    ? "bg-[#00ff9d]"
                    : done
                      ? "bg-[rgba(0,229,255,0.45)]"
                      : "bg-[rgba(255,255,255,0.08)]",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function JackpotLiveFeedHeader() {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
      <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--mystik3)]">
        Ganadores en vivo
      </p>
      <p className="font-mono text-[8px] tracking-[0.1em] text-[var(--txt3)] hidden sm:block">
        mesa jackpot
      </p>
    </div>
  );
}
