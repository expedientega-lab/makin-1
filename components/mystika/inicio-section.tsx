"use client";

import { useCallback, useEffect, useState } from "react";

const LS_VISITOR_NAME = "mystika-visitor-name";

interface InicioSectionProps {
  onTabChange: (tab: string) => void;
}

const prizes = [
  {
    ico: "💵",
    name: "$1,000 USD",
    value: "$1,000",
    color: "#00ff9d",
    glow: "rgba(0,255,157,0.4)",
    badge: "JACKPOT",
  },
  {
    ico: "💵",
    name: "$100 USD",
    value: "$100",
    color: "#00e5ff",
    glow: "rgba(0,229,255,0.4)",
    badge: "POPULAR",
  },
  {
    ico: "📦",
    name: "Caja Misteriosa",
    value: "$150",
    color: "#ff6b9d",
    glow: "rgba(255,107,157,0.4)",
    badge: null,
  },
  {
    ico: "🥠",
    name: "Galleta Mística",
    value: "GARANTIZADA",
    color: "#ffd700",
    glow: "rgba(255,215,0,0.4)",
    badge: "SEGURO",
  },
];

const steps = [
  {
    num: "01",
    ico: "🎯",
    title: "Elegí tu juego",
    desc: "Orbe mágico, Jackpot, Galleta de la Fortuna, Llaves cósmicas y más. Cada uno con su propia experiencia.",
  },
  {
    num: "02",
    ico: "💳",
    title: "Pagá $1 de forma segura",
    desc: "Un único pago de $1 USD via PayPal o tarjeta. Sin suscripción, sin cargos ocultos.",
  },
  {
    num: "03",
    ico: "🔮",
    title: "Revelá tu destino",
    desc: "El portal revela tu resultado al instante. Podés ganar premios digitales reales.",
  },
];

const features = [
  {
    ico: "✦",
    text: "Pago único de $1 — sin suscripción ni cargos recurrentes",
  },
  { ico: "✦", text: "Pago 100% seguro via PayPal o tarjeta como invitado" },
  {
    ico: "✦",
    text: "Más de 18,700 fortunas reveladas y miles de usuarios activos",
  },
  { ico: "✦", text: "Resultados instantáneos — sabés tu destino al momento" },
  { ico: "✦", text: "Portal activo 24/7 desde cualquier dispositivo" },
  {
    ico: "✦",
    text: "Múltiples juegos: Orbe, Jackpot, Fortuna, Llaves, Ruleta y más",
  },
];

export function InicioSection({ onTabChange }: InicioSectionProps) {
  const [visitorName, setVisitorName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(true);
  const [nameSaving, setNameSaving] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const cached = localStorage.getItem(LS_VISITOR_NAME);
    if (cached) {
      setVisitorName(cached);
      setNameInput(cached);
    }

    fetch("/api/visitor-name")
      .then((r) => r.json())
      .then((data: { saved?: boolean; name?: string }) => {
        if (data.saved && data.name) {
          setVisitorName(data.name);
          setNameInput(data.name);
          localStorage.setItem(LS_VISITOR_NAME, data.name);
        } else if (!cached) {
          setShowNamePrompt(true);
        }
      })
      .catch(() => {
        if (!cached) setShowNamePrompt(true);
      })
      .finally(() => setNameLoading(false));
  }, []);

  const saveVisitorName = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || nameSaving) return;

    setNameSaving(true);
    setNameError("");

    try {
      const res = await fetch("/api/visitor-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNameError(data.error || "No se pudo guardar tu nombre");
        return;
      }

      setVisitorName(data.name);
      localStorage.setItem(LS_VISITOR_NAME, data.name);
      setShowNamePrompt(false);
    } catch {
      setNameError("Error de conexión. Intentá de nuevo.");
    } finally {
      setNameSaving(false);
    }
  }, [nameInput, nameSaving]);

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      {/* ── HERO ── */}
      <div className="text-center py-4 pb-8">
        {/* ── BANNER BIENVENIDA (con luces) ── */}
        <div className="relative max-w-[640px] mx-auto mb-5 py-5 sm:py-6 px-4 sm:px-8 rounded-2xl overflow-hidden">
          <style>{`
            @keyframes inicio-welcome-line {
              0%, 100% { opacity: 0.45; }
              50% { opacity: 1; }
            }
            @keyframes inicio-welcome-shine {
              0% { transform: translateX(-130%) skewX(-12deg); opacity: 0; }
              30% { opacity: 0.45; }
              100% { transform: translateX(200%) skewX(-12deg); opacity: 0; }
            }
            @keyframes inicio-name-glow {
              0%, 100% { text-shadow: 0 0 18px rgba(179,136,255,.65), 0 0 36px rgba(179,136,255,.35), 0 0 60px rgba(179,136,255,.15); }
              50% { text-shadow: 0 0 28px rgba(179,136,255,.9), 0 0 50px rgba(179,136,255,.5), 0 0 80px rgba(212,184,255,.25); }
            }
          `}</style>

          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 50% 0%, rgba(179,136,255,0.16) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(119,68,204,0.12) 0%, transparent 50%), linear-gradient(180deg, rgba(12,8,22,0.5) 0%, rgba(8,5,14,0.85) 100%)",
              border: "1px solid rgba(179,136,255,0.28)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 28px rgba(179,136,255,0.2), 0 0 48px rgba(179,136,255,0.08)",
            }}
          />

          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
            aria-hidden
            style={{
              background:
                "linear-gradient(90deg, transparent, #7744cc, #b388ff, #d4b8ff, #b388ff, #7744cc, transparent)",
              animation: "inicio-welcome-line 2.8s ease-in-out infinite",
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            aria-hidden
          >
            <div
              className="absolute inset-y-0 w-[40%]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(179,136,255,0.12), transparent)",
                animation: "inicio-welcome-shine 5s ease-in-out infinite",
              }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
            <span
              className="hidden sm:block flex-1 max-w-[60px] h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(179,136,255,0.6))",
                boxShadow: "0 0 8px rgba(179,136,255,0.4)",
                animation: "inicio-welcome-line 2.8s ease-in-out infinite",
              }}
            />

            {visitorName ? (
              <div className="text-center">
                <div
                  className="font-mono tracking-[3px] sm:tracking-[4px] text-[var(--mystik3)] mb-1"
                  style={{ fontSize: "clamp(11px, 2.8vw, 14px)" }}
                >
                  BIENVENIDO DE NUEVO,
                </div>
                <div
                  className="font-display font-black tracking-[3px] sm:tracking-[5px] text-[var(--mystik)]"
                  style={{
                    fontSize: "clamp(22px, 6vw, 36px)",
                    animation: "inicio-name-glow 3s ease-in-out infinite",
                  }}
                >
                  {visitorName.toUpperCase()}
                </div>
              </div>
            ) : (
              <div
                className="font-mono tracking-[4px] sm:tracking-[5px] text-[var(--mystik3)]"
                style={{
                  fontSize: "clamp(13px, 3.2vw, 17px)",
                  textShadow: "0 0 16px rgba(179,136,255,0.35)",
                }}
              >
                BIENVENIDO AL PORTAL
              </div>
            )}

            <span
              className="hidden sm:block flex-1 max-w-[60px] h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(179,136,255,0.6), transparent)",
                boxShadow: "0 0 8px rgba(179,136,255,0.4)",
                animation: "inicio-welcome-line 2.8s ease-in-out infinite",
                animationDelay: "1.4s",
              }}
            />
          </div>
        </div>

        {/* ── REGISTRO DE NOMBRE (evento portal) ── */}
        {!nameLoading && showNamePrompt && (
          <div
            className="max-w-[480px] mx-auto mb-6 p-5 sm:p-6 rounded-2xl text-left animate-[fadeup_0.35s_ease] relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(179,136,255,0.12) 0%, rgba(10,6,18,0.95) 100%)",
              border: "1px solid rgba(179,136,255,0.35)",
              boxShadow: "0 0 32px rgba(179,136,255,0.12)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--mystik), transparent)",
              }}
            />
            <div className="font-mono text-[10px] tracking-[3px] text-[var(--mystik3)] mb-2">
              ✦ IDENTIFICACIÓN DEL VIAJERO
            </div>
            <p className="text-[14px] sm:text-[15px] text-[var(--txt)]/90 leading-[1.8] mb-4">
              Antes de entrar al portal, el universo necesita saber tu nombre.
              Quedará guardado en tu conexión para que siempre te reciba al
              volver.
            </p>
            <label className="font-mono text-[11px] tracking-[3px] text-[var(--mystik3)] block mb-2">
              TU NOMBRE
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveVisitorName()}
              placeholder="Escribí tu nombre..."
              maxLength={40}
              disabled={nameSaving}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl text-[16px] text-[var(--txt)] placeholder:text-[var(--txt3)] outline-none transition-all mb-3"
              style={{
                background: "var(--bg2)",
                border: nameInput.trim()
                  ? "2px solid rgba(179,136,255,0.5)"
                  : "2px solid var(--border)",
                boxShadow: nameInput.trim()
                  ? "0 0 16px rgba(179,136,255,0.12)"
                  : "none",
              }}
            />
            {nameError && (
              <p className="text-[13px] text-red-400 mb-3">{nameError}</p>
            )}
            <button
              onClick={saveVisitorName}
              disabled={!nameInput.trim() || nameSaving}
              className="w-full py-3.5 rounded-xl font-mono text-[13px] tracking-[3px] font-black transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, var(--mystik3), var(--mystik), #d4b8ff)",
                color: "var(--bg0)",
                boxShadow: "0 6px 20px rgba(179,136,255,0.3)",
              }}
            >
              {nameSaving ? "GUARDANDO..." : "ENTRAR AL PORTAL"}
            </button>
          </div>
        )}

        {!nameLoading && visitorName && !showNamePrompt && (
          <p className="text-[13px] font-mono text-[var(--txt2)] mb-4 tracking-[1px]">
            Tu nombre está guardado en el portal.{" "}
            <button
              type="button"
              onClick={() => setShowNamePrompt(true)}
              className="text-[var(--mystik3)] underline underline-offset-2 hover:text-[var(--mystik)] transition-colors"
            >
              Cambiar
            </button>
          </p>
        )}

        <h1
          className="font-display font-black leading-[0.92] tracking-[2px] mb-4"
          style={{ fontSize: "clamp(36px,9vw,64px)" }}
        >
          Tu portal de{" "}
          <span
            className="text-[var(--mystik)]"
            style={{ textShadow: "0 0 30px rgba(179,136,255,.65)" }}
          >
            destino
          </span>{" "}
          y{" "}
          <span
            className="text-[#00ff9d]"
            style={{ textShadow: "0 0 30px rgba(0,255,157,.55)" }}
          >
            premios
          </span>
        </h1>

        <p className="text-[16px] sm:text-[17px] md:text-[18px] text-[var(--txt)]/90 max-w-[560px] mx-auto leading-[1.95] font-normal mb-6">
          Mystika es un portal místico donde cada interacción revela mensajes
          del universo y te da la chance de ganar premios digitales reales.
          Fortunas personalizadas, el Orbe mágico, el Jackpot de $1,000 y mucho
          más — todo por solo{" "}
          <strong className="text-[var(--txt)] font-semibold">$1</strong>.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onTabChange("orbe")}
            className="px-8 py-3.5 rounded-xl font-display font-bold text-[16px] sm:text-[17px] tracking-[2px] text-[var(--bg0)] transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, var(--mystik3), var(--mystik), #d4b8ff)",
              boxShadow: "0 8px 24px rgba(179,136,255,.4)",
            }}
          >
            🔮 JUGAR AHORA
          </button>
          <button
            onClick={() => onTabChange("jackpot")}
            className="px-6 py-3.5 rounded-xl font-mono text-[14px] sm:text-[15px] tracking-[2px] font-black transition-all hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "rgba(0,255,157,0.08)",
              border: "1px solid rgba(0,255,157,0.35)",
              color: "#00ff9d",
              boxShadow: "0 4px 16px rgba(0,255,157,0.15)",
            }}
          >
            💎 VER JACKPOT
          </button>
        </div>
      </div>

      {/* ── QUÉ ES MYSTIKA ── */}
      <div
        className="rounded-2xl p-6 sm:p-7 mb-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(179,136,255,0.08) 0%, rgba(10,6,18,0.9) 100%)",
          border: "1px solid rgba(179,136,255,0.2)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--mystik), transparent)",
          }}
        />
        <div className="font-mono text-[10px] sm:text-[11px] tracking-[4px] text-[var(--mystik3)] mb-3.5">
          ✦ QUÉ ES MYSTIKA
        </div>
        <p className="text-[16px] sm:text-[17px] md:text-[18px] text-[var(--txt)] leading-[1.95] mb-4">
          <strong className="text-[var(--mystik)]">Mystika</strong> es una
          plataforma de entretenimiento digital que combina la mística del
          destino con la emoción de ganar. Cada juego está diseñado para darte
          una experiencia única: lecturas de fortuna personalizadas, tiradas del
          Orbe, el Jackpot de $1,000 y mucho más.
        </p>
        <p className="text-[15px] sm:text-[16px] md:text-[17px] text-[var(--txt)]/85 leading-[1.95]">
          No es magia — es la energía que vos ponés en cada jugada. El portal
          responde a tu vibración y te revela lo que el cosmos tiene preparado.
          Cada sesión es única, irrepetible y diseñada para que te lleves algo
          valioso, ya sea un mensaje que te mueve o un premio digital real.
        </p>
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <div className="mb-8">
        <div className="font-mono text-[10px] sm:text-[11px] tracking-[4px] sm:tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-6">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          CÓMO FUNCIONA
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative p-5 rounded-xl"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Step number */}
              <div
                className="font-display font-black text-[48px] leading-none mb-3 opacity-15 select-none"
                style={{ color: "var(--mystik)" }}
              >
                {step.num}
              </div>
              <div className="text-3xl mb-2">{step.ico}</div>
              <div className="font-display font-black text-[17px] text-[var(--txt)] mb-2 tracking-[1px]">
                {step.title}
              </div>
              <p className="text-[14px] sm:text-[15px] text-[var(--txt2)] leading-[1.85]">
                {step.desc}
              </p>

              {/* Connector arrow on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[var(--mystik3)] text-lg">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── PREMIOS ── */}
      <div className="mb-8">
        <div className="font-mono text-[10px] sm:text-[11px] tracking-[4px] sm:tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-6">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          PREMIOS DISPONIBLES
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {prizes.map((prize, i) => (
            <div
              key={i}
              className="relative p-4 rounded-xl text-center transition-all hover:scale-[1.03]"
              style={{
                background: `linear-gradient(145deg, ${prize.color}12, var(--bg2))`,
                border: `1px solid ${prize.color}40`,
                boxShadow: `0 0 20px ${prize.glow}`,
              }}
            >
              {prize.badge && (
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full font-mono text-[7px] font-black tracking-[1.5px] whitespace-nowrap"
                  style={{ background: prize.color, color: "#0a0612" }}
                >
                  {prize.badge}
                </div>
              )}
              <div
                className="text-4xl mb-2 mt-1"
                style={{ filter: `drop-shadow(0 0 10px ${prize.glow})` }}
              >
                {prize.ico}
              </div>
              <div className="font-display font-black text-[13px] text-[var(--txt)] mb-1 leading-tight">
                {prize.name}
              </div>
              <div
                className="font-mono text-[11px] font-black"
                style={{ color: prize.color }}
              >
                {prize.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── POR QUÉ MYSTIKA ── */}
      <div className="mb-8">
        <div className="font-mono text-[10px] sm:text-[11px] tracking-[4px] sm:tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-6">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          POR QUÉ MYSTIKA
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-xl"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="text-[var(--mystik)] text-lg sm:text-xl font-bold flex-shrink-0 mt-0.5 leading-none"
                style={{ textShadow: "0 0 10px rgba(179,136,255,0.5)" }}
              >
                {f.ico}
              </span>
              <span className="text-[15px] sm:text-[16px] text-[var(--txt)]/88 leading-[1.75] font-normal tracking-[0.01em]">
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div
        className="text-center py-8 px-6 rounded-2xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(179,136,255,0.12) 0%, rgba(10,6,18,0.95) 100%)",
          border: "1px solid rgba(179,136,255,0.25)",
          boxShadow: "0 0 40px rgba(179,136,255,0.08)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--mystik), transparent)",
          }}
        />
        <div className="text-4xl mb-3">🔮</div>
        <h2
          className="font-display font-black leading-tight tracking-[1px] mb-3"
          style={{ fontSize: "clamp(22px,5vw,34px)", color: "var(--txt)" }}
        >
          ¿Listo para conocer tu destino?
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[var(--txt)]/88 max-w-[440px] mx-auto leading-[1.9] mb-6">
          Miles de personas ya descubrieron su fortuna en Mystika. Ahora es tu
          turno. Por solo $1 podés acceder al portal y ver lo que el universo
          tiene para vos.
        </p>
        <button
          onClick={() => onTabChange("orbe")}
          className="px-10 py-4 rounded-xl font-display font-bold text-[17px] sm:text-[18px] tracking-[2px] text-[var(--bg0)] transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--mystik3), var(--mystik), #d4b8ff, var(--mystik))",
            backgroundSize: "200% auto",
            animation: "ctamove 3s linear infinite",
            boxShadow:
              "0 8px 0 rgba(0,0,0,.5), 0 15px 40px rgba(179,136,255,.35)",
          }}
        >
          EMPEZAR AHORA — $1
        </button>
        <p className="text-[12px] sm:text-[13px] text-[var(--txt2)] mt-3 font-mono tracking-[0.5px]">
          Pago único · Sin suscripción · Seguro via PayPal
        </p>
      </div>

      {/* ── FOOTER LEGAL ── */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-5 mt-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[var(--mystik)]" />
          <div className="font-display text-[24px] font-bold text-[var(--txt)] tracking-[1px]">
            MYSTIKA
          </div>
        </div>
        <p className="text-[14px] sm:text-[15px] leading-[1.85] text-[var(--txt)]">
          Mystika es una experiencia digital de entretenimiento interactivo.
          Nuestra plataforma integra diseno visual inmersivo, dinamicas de
          participacion y contenido editorial para brindar una experiencia clara
          y consistente a cada usuario.
        </p>
        <p className="text-[14px] sm:text-[15px] leading-[1.85] text-[var(--txt2)] mt-3">
          Al continuar en esta pagina, el usuario acepta nuestros terminos de
          uso, lineamientos de comunidad y politicas de funcionamiento. Todo el
          contenido mostrado puede actualizarse sin previo aviso para mejorar
          calidad, seguridad y rendimiento.
        </p>
        <p className="text-[14px] sm:text-[15px] leading-[1.85] text-[var(--txt2)] mt-3">
          Esta seccion y sus recursos estan reservados por el autor de la pagina
          Mystika. La reproduccion total o parcial sin autorizacion expresa
          queda prohibida.
        </p>
        <div className="mt-4 pt-3 border-t border-[var(--border)] text-center font-mono text-[11px] text-[var(--txt3)]">
          Derechos de autor ©2026 MYSTIKA. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
