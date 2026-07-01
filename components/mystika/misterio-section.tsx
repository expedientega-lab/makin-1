"use client";

import { useEffect, useState } from "react";
import { MisterioArchivoLiveEvent } from "./misterio-archivo-live-event";
import { MisterioAtmosphere } from "./misterio-atmosphere";
import { MisterioOvnisEvent } from "./misterio-ovnis-event";
import {
  MisterioDonacionPanel,
  MisterioJuegoPanel,
} from "./misterio-extras";
import { MisterioStikersPanel } from "./misterio-stikers-panel";

// ── Tipos ──────────────────────────────────────────────────────────────────
type Story = {
  id: string;
  title: string;
  body: string;
  author: string;
  location: string;
  timeAgo: string;
  badge: "VERIFICADO" | "SIN CONFIRMAR" | "NUEVO" | "ENVIADO";
  badgeColor: string;
  isUser?: boolean;
};

type Category = {
  key: string;
  label: string;
  emoji: string;
  desc: string;
};

const CAT_CHIP_THEMES: Record<
  string,
  { accent: string; glow: string; bg: string }
> = {
  ovnis: { accent: "#00e5ff", glow: "rgba(0,229,255,0.5)", bg: "rgba(0,229,255,0.14)" },
  juego: { accent: "#39ff14", glow: "rgba(57,255,20,0.5)", bg: "rgba(57,255,20,0.12)" },
  donacion: { accent: "#ffd700", glow: "rgba(255,215,0,0.5)", bg: "rgba(255,215,0,0.12)" },
  stikers: { accent: "#c77dff", glow: "rgba(199,125,255,0.5)", bg: "rgba(199,125,255,0.12)" },
  relatos: { accent: "#ff6b9d", glow: "rgba(255,107,157,0.45)", bg: "rgba(255,107,157,0.12)" },
};

const MISTERIO_CHIP_STYLES = `
  @keyframes misterio-chip-led {
    0%, 100% { opacity: 0.6; filter: brightness(1); }
    50% { opacity: 1; filter: brightness(1.4); }
  }
  @keyframes misterio-chip-scan {
    0% { transform: translateX(-120%); opacity: 0; }
    20% { opacity: 0.8; }
    100% { transform: translateX(180%); opacity: 0; }
  }
  @keyframes misterio-chip-pop {
    0% { transform: scale(0.94); }
    55% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

function getCatTheme(key: string) {
  return CAT_CHIP_THEMES[key] ?? CAT_CHIP_THEMES.ovnis;
}

// ── Categorías ─────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    key: "ovnis",
    label: "OVNIS",
    emoji: "🛸",
    desc: "Fenómenos aéreos no identificados, archivos oficiales y casos con evidencia real.",
  },
  {
    key: "juego",
    label: "JUEGO",
    emoji: "🎮",
    desc: "",
  },
  {
    key: "donacion",
    label: "DONACIÓN",
    emoji: "💫",
    desc: "Doná y participá por premios diarios de USD 2.000, USD 500 y USD 100.",
  },
  {
    key: "stikers",
    label: "STIKERS",
    emoji: "🎨",
    desc: "Fondos de pantalla exclusivos para celular y escritorio.",
  },
  {
    key: "relatos",
    label: "RELATOS",
    emoji: "✍️",
    desc: "Historias enviadas por la comunidad Mystika.",
  },
];

// ── Relatos por categoría ──────────────────────────────────────────────────
const STORIES: Record<string, Story[]> = {
  ovnis: [],
  juego: [],
  donacion: [],
  stikers: [],
  relatos: [],
};

const BADGE_STYLES: Record<string, string> = {
  VERIFICADO: "rgba(0,255,157,0.15)",
  "SIN CONFIRMAR": "rgba(247,147,26,0.15)",
  NUEVO: "rgba(179,136,255,0.15)",
  ENVIADO: "rgba(255,107,157,0.15)",
};

export function MisterioSection({
  onRequestPay,
}: {
  onRequestPay?: (
    productId: string,
    title: string,
    description: string,
    price?: number,
  ) => void;
}) {
  const [selected, setSelected] = useState<string>("ovnis");
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [formName, setFormName] = useState("");
  const [formCat, setFormCat] = useState("ovnis");
  const [formStory, setFormStory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [archivoLiveActive, setArchivoLiveActive] = useState(false);
  const [archivoLiveOpen, setArchivoLiveOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.altKey || e.metaKey || e.key !== "1") return;

      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();
      setArchivoLiveActive((prev) => !prev);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!archivoLiveActive) setArchivoLiveOpen(false);
  }, [archivoLiveActive]);

  useEffect(() => {
    if (!archivoLiveActive) return;
    void fetch("/api/relay/start", { method: "POST" }).catch(() => {});
  }, [archivoLiveActive]);

  const currentCat = CATEGORIES.find((c) => c.key === selected);
  const selectedTheme = getCatTheme(selected);
  const baseStories = STORIES[selected] ?? [];
  const allStories = selected === "relatos" ? userStories : baseStories;

  const handleSubmit = () => {
    if (!formStory.trim() || !formTitle.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newStory: Story = {
        id: `u-${Date.now()}`,
        title: formTitle.trim(),
        body: formStory.trim(),
        author: formName.trim()
          ? `@${formName.trim().replace(/^@/, "")}`
          : "@anónimo",
        location: "Portal Mystika",
        timeAgo: "hace un momento",
        badge: "ENVIADO",
        badgeColor: "#ff6b9d",
        isUser: true,
      };
      setUserStories((prev) => [newStory, ...prev]);
      setFormName("");
      setFormTitle("");
      setFormStory("");
      setFormCat("ovnis");
      setSending(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelected("relatos");
      }, 2500);
    }, 1400);
  };

  return (
    <div className="animate-[fadeup_0.4s_ease] relative">
      <div
        className="relative rounded-2xl overflow-hidden px-1 sm:px-2 pb-2"
        style={{
          boxShadow: "inset 0 0 80px rgba(179,136,255,0.04)",
        }}
      >
        <MisterioAtmosphere category={selected} hideArchivoLabel={archivoLiveActive} />

        {archivoLiveActive && (
          <button
            type="button"
            onClick={() => setArchivoLiveOpen(true)}
            className="absolute top-4 right-3 sm:right-4 z-[40] font-mono text-[8px] sm:text-[9px] tracking-[0.2em] tabular-nums shrink-0 px-2.5 py-1.5 rounded-md border transition-all duration-300 hover:brightness-125 active:scale-95 cursor-pointer"
            style={{
              color: selectedTheme.accent,
              borderColor: `${selectedTheme.accent}66`,
              background: selectedTheme.bg,
              boxShadow: `0 0 16px ${selectedTheme.glow}`,
            }}
            aria-label="Abrir Carreras — minería en vivo"
          >
            ARCHIVO · LIVE
          </button>
        )}

        {archivoLiveOpen && (
          <MisterioArchivoLiveEvent onClose={() => setArchivoLiveOpen(false)} />
        )}

        <div className="relative z-[1]">
      {/* Eventos — arriba del título */}
      <style>{MISTERIO_CHIP_STYLES}</style>
      <div className="flex flex-wrap gap-2.5 mb-6 justify-center pt-8 sm:pt-9">
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.key;
          const theme = getCatTheme(cat.key);
          return (
          <button
            key={cat.key}
            onClick={() => setSelected(cat.key)}
            className="relative overflow-hidden flex items-center gap-1.5 px-4 py-2.5 rounded-full border transition-all duration-300 font-mono text-[13px] tracking-[1px] font-bold"
            style={{
              background: isActive
                ? `linear-gradient(165deg, ${theme.bg} 0%, rgba(8,5,14,0.92) 100%)`
                : "rgba(10,6,18,0.65)",
              borderColor: isActive ? theme.accent : "var(--border)",
              color: isActive ? theme.accent : "var(--txt2)",
              boxShadow: isActive
                ? `0 0 24px ${theme.glow}, 0 0 48px ${theme.glow}, inset 0 0 20px ${theme.bg}`
                : "none",
              animation: isActive
                ? "misterio-chip-pop 0.35s cubic-bezier(0.34, 1.4, 0.64, 1)"
                : undefined,
            }}
          >
            {isActive && (
              <span
                className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                  boxShadow: `0 0 10px ${theme.accent}, 0 0 18px ${theme.glow}`,
                  animation: "misterio-chip-led 1.5s ease-in-out infinite",
                }}
                aria-hidden
              />
            )}
            {isActive && (
              <span
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                aria-hidden
              >
                <span
                  className="absolute top-0 bottom-0 w-[45%]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.accent}30, transparent)`,
                    animation: "misterio-chip-scan 2.5s ease-in-out infinite",
                  }}
                />
              </span>
            )}
            {isActive && (
              <span
                className="absolute inset-0 pointer-events-none opacity-35 rounded-full"
                style={{
                  background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${theme.bg} 0%, transparent 70%)`,
                }}
                aria-hidden
              />
            )}
            <span
              className="relative z-[1] leading-none"
              style={{
                filter: isActive
                  ? `drop-shadow(0 0 6px ${theme.accent}) drop-shadow(0 0 12px ${theme.glow})`
                  : "none",
                transform: isActive ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            >
              {cat.emoji}
            </span>
            <span className="relative z-[1]">{cat.label}</span>
            {(cat.key === "juego" || cat.key === "donacion") && (
              <span
                className="relative z-[1] ml-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-wider"
                style={{
                  background:
                    cat.key === "donacion"
                      ? "rgba(255,215,0,0.25)"
                      : "rgba(255,45,120,0.2)",
                  color: cat.key === "donacion" ? "#ffd700" : "#ff2d78",
                }}
              >
                HOT
              </span>
            )}
            {cat.key === "relatos" && userStories.length > 0 && (
              <span
                className="relative z-[1] ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: "#ff6b9d", color: "#0a0612" }}
              >
                {userStories.length}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full pointer-events-none"
                style={{
                  background: theme.accent,
                  boxShadow: `0 0 6px ${theme.accent}, 0 0 12px ${theme.glow}`,
                  animation: "misterio-chip-led 1.2s ease-in-out infinite 0.15s",
                }}
                aria-hidden
              />
            )}
          </button>
          );
        })}
      </div>

      {/* Header — solo en OVNIS */}
      {selected === "ovnis" && (
        <>
          <div className="text-center py-1.5 pb-5">
            <div className="font-mono text-[11px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-3">
              <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
              ARCHIVO DE LO INEXPLICABLE
              <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
            </div>
            <h2
              className="font-display font-black leading-[0.95] tracking-[2px] mb-3"
              style={{ fontSize: "clamp(30px,7vw,50px)" }}
            >
              Historias que{" "}
              <span
                className="text-[var(--mystik)] inline-block px-1"
                style={{
                  textShadow:
                    "0 0 24px rgba(179,136,255,0.55), 0 0 48px rgba(179,136,255,0.2)",
                }}
              >
                no tienen
              </span>{" "}
              explicación
            </h2>
            <p className="text-[15px] text-[var(--txt2)] max-w-[520px] mx-auto leading-[1.8] font-light">
              Ovnis, juegos del portal, donaciones, stikers y relatos de la comunidad.
              Explorá, jugá y enviá tu experiencia al archivo.
            </p>
          </div>

          {currentCat?.desc && (
            <p className="text-[15px] text-[var(--txt3)] text-center mb-5 italic">
              {currentCat.emoji} {currentCat.desc}
            </p>
          )}
        </>
      )}

      {/* Contenido por categoría */}
      {selected === "ovnis" ? (
        <MisterioOvnisEvent />
      ) : selected === "juego" ? (
        <MisterioJuegoPanel />
      ) : selected === "donacion" ? (
        <MisterioDonacionPanel onRequestPay={onRequestPay} />
      ) : selected === "stikers" ? (
        <MisterioStikersPanel onRequestPay={onRequestPay} />
      ) : selected === "relatos" && allStories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">✍️</div>
          <p className="text-[15px] text-[var(--txt2)] mb-1">
            No hay relatos enviados aún.
          </p>
          <p className="text-[13px] text-[var(--txt3)]">
            Sé el primero en compartir tu experiencia.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {allStories.map((story) => (
            <div
              key={story.id}
              className="rounded-xl border p-5 relative overflow-hidden transition-all duration-300 hover:border-[var(--mystik)] hover:shadow-[0_0_24px_rgba(179,136,255,0.12)]"
              style={{
                background: story.isUser
                  ? "linear-gradient(135deg, rgba(255,107,157,0.08) 0%, rgba(10,6,18,0.92) 100%)"
                  : "linear-gradient(135deg, rgba(18,10,32,0.95) 0%, rgba(8,5,14,0.98) 100%)",
                borderColor: "var(--border)",
              }}
            >
              {/* Top shimmer */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(179,136,255,0.2), transparent)",
                }}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-display font-black text-[20px] text-[var(--txt)] leading-tight tracking-[0.5px]">
                  {story.title}
                </h3>
                <span
                  className="flex-shrink-0 px-2.5 py-1 rounded-full font-mono text-[11px] font-black tracking-[1.5px] whitespace-nowrap"
                  style={{
                    background:
                      BADGE_STYLES[story.badge] ?? "rgba(179,136,255,0.1)",
                    color: story.badgeColor,
                    border: `1px solid ${story.badgeColor}40`,
                  }}
                >
                  {story.badge}
                </span>
              </div>

              {/* Body */}
              <p className="text-[15px] text-[var(--txt)] leading-[1.9] mb-4">
                {story.body}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-[13px] font-bold text-[var(--mystik)]">
                  {story.author}
                </span>
                <span className="text-[var(--border)]">·</span>
                <span className="font-mono text-[12px] text-[var(--txt3)]">
                  📍 {story.location}
                </span>
                <span className="text-[var(--border)]">·</span>
                <span className="font-mono text-[12px] text-[var(--txt3)]">
                  {story.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected === "relatos" && (
        <>
      {/* Divider */}
      <div
        className="h-px my-7"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(179,136,255,0.25), transparent)",
        }}
      />

      {/* Submit form */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(179,136,255,0.07) 0%, rgba(10,6,18,0.95) 100%)",
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

        <div className="font-mono text-[11px] tracking-[4px] text-[var(--mystik3)] mb-2">
          ✦ COMPARTÍ TU EXPERIENCIA
        </div>
        <h3 className="font-display font-black text-[22px] text-[var(--txt)] mb-2">
          Enviá tu relato al archivo
        </h3>
        <p className="text-[14px] text-[var(--txt3)] mb-5">
          ¿Viviste algo inexplicable? Compartilo con la comunidad Mystika. Tu
          relato quedará registrado en el archivo.
        </p>

        {submitted ? (
          <div
            className="text-center py-8 rounded-xl animate-[fadeup_0.4s_ease]"
            style={{
              background: "rgba(179,136,255,0.08)",
              border: "1px solid rgba(179,136,255,0.2)",
            }}
          >
            <div className="text-4xl mb-3">✦</div>
            <div className="font-display font-black text-[18px] text-[var(--mystik)] mb-2">
              Relato enviado al Archivo
            </div>
            <p className="text-[15px] text-[var(--txt2)]">
              Tu experiencia fue registrada. Podés verla en la categoría
              RELATOS.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Title */}
            <div>
              <label className="font-mono text-[12px] tracking-[2px] text-[var(--txt2)] mb-1.5 block">
                TÍTULO DEL RELATO *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ej: Lo que vi en la ruta esa noche..."
                maxLength={80}
                className="w-full px-4 py-3.5 rounded-lg text-[15px] text-[var(--txt)] placeholder:text-[var(--txt3)] outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: formTitle.trim()
                    ? "1px solid rgba(179,136,255,0.4)"
                    : "1px solid var(--border)",
                }}
                disabled={sending}
              />
            </div>

            {/* Pseudónimo + Categoría */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[12px] tracking-[2px] text-[var(--txt2)] mb-1.5 block">
                  TU PSEUDÓNIMO
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="@anónimo"
                  maxLength={30}
                  className="w-full px-4 py-3.5 rounded-lg text-[15px] text-[var(--txt)] placeholder:text-[var(--txt3)] outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                  }}
                  disabled={sending}
                />
              </div>
              <div>
                <label className="font-mono text-[12px] tracking-[2px] text-[var(--txt2)] mb-1.5 block">
                  CATEGORÍA
                </label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg text-[15px] text-[var(--txt)] outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    color: "var(--txt)",
                  }}
                  disabled={sending}
                >
                  {CATEGORIES.filter((c) => c.key !== "relatos" && !["juego", "donacion", "stikers"].includes(c.key)).map((c) => (
                    <option
                      key={c.key}
                      value={c.key}
                      style={{ background: "#130d22" }}
                    >
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="font-mono text-[12px] tracking-[2px] text-[var(--txt2)] mb-1.5 block">
                TU RELATO *
              </label>
              <textarea
                value={formStory}
                onChange={(e) => setFormStory(e.target.value)}
                placeholder="Contá lo que viviste con el mayor detalle posible. Fechas, lugares, testigos, sensaciones..."
                maxLength={1200}
                rows={5}
                className="w-full px-4 py-3.5 rounded-lg text-[15px] text-[var(--txt)] placeholder:text-[var(--txt3)] outline-none resize-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: formStory.trim()
                    ? "1px solid rgba(179,136,255,0.4)"
                    : "1px solid var(--border)",
                  fontFamily: "inherit",
                }}
                disabled={sending}
              />
              <div className="text-right font-mono text-[12px] text-[var(--txt3)] mt-1">
                {formStory.length}/1200
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formStory.trim() || sending}
              className="w-full py-4 rounded-xl font-mono text-[15px] tracking-[2px] font-black transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background:
                  formTitle.trim() && formStory.trim()
                    ? "linear-gradient(135deg, rgba(179,136,255,0.25) 0%, rgba(179,136,255,0.1) 100%)"
                    : "var(--bg3)",
                border: `2px solid ${formTitle.trim() && formStory.trim() ? "var(--mystik)" : "var(--border)"}`,
                color:
                  formTitle.trim() && formStory.trim()
                    ? "var(--mystik)"
                    : "var(--txt3)",
                boxShadow:
                  formTitle.trim() && formStory.trim()
                    ? "0 0 20px rgba(179,136,255,0.2)"
                    : "none",
              }}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--mystik)] border-t-transparent rounded-full animate-spin" />
                  <span>ENVIANDO AL ARCHIVO...</span>
                </>
              ) : (
                <>
                  <span>✦</span>
                  <span>ENVIAR AL ARCHIVO MISTERIOSO</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
