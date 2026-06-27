"use client";

const REAL_STORIES = [
  {
    year: "2004",
    place: "Costa de San Diego, EE.UU.",
    text: "Pilotos de la USS Nimitz y operadores radar siguieron objetos que aceleraban, frenaban y descendían sin hélice ni estela visible. El Pentágono confirmó en 2017 la autenticidad de esos registros.",
  },
  {
    year: "2014",
    place: "Aguadilla, Puerto Rico",
    text: "Una cámara térmica de aduana registró un objeto que entró al mar a más de 120 km/h, salió otra vez y se dividió en dos. El informe técnico no encontró explicación convencional.",
  },
  {
    year: "1965",
    place: "Villa Carlos Paz, Argentina",
    text: "Decenas de personas —incluido el periodista Jorge Fernández— describieron un disco metálico suspendido sobre el lago San Roque durante varios minutos, sin ruido y con movimientos lentos y precisos.",
  },
];

export function MisterioOvnisEvent({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "relative rounded-2xl border overflow-hidden mb-6",
        className,
      ].join(" ")}
      style={{
        background:
          "linear-gradient(155deg, rgba(0,229,255,0.07) 0%, rgba(8,5,14,0.96) 38%, rgba(12,8,22,0.98) 100%)",
        borderColor: "rgba(0,229,255,0.28)",
        boxShadow:
          "0 0 40px rgba(0,229,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <style>{`
        @keyframes ovni-event-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes ovni-event-beam {
          0%, 100% { opacity: 0.25; transform: scaleY(0.85); }
          50% { opacity: 0.55; transform: scaleY(1); }
        }
        @keyframes ovni-event-blink {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        @keyframes ovni-event-scan {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        @keyframes ovni-event-ring {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #00e5ff, #00ff9d, #00e5ff, transparent)",
          backgroundSize: "200% 100%",
          animation: "ctamove 4s linear infinite",
        }}
        aria-hidden
      />

      <div className="px-4 py-3 sm:px-5 border-b border-[rgba(0,229,255,0.12)] flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] sm:text-[11px] font-black tracking-[0.28em] text-[#00e5ff]">
          🛸 OVNIS
        </span>
        <span
          className="font-mono text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(0,255,157,0.12)",
            color: "#00ff9d",
            border: "1px solid rgba(0,255,157,0.35)",
          }}
        >
          ARCHIVO UAP · ACTIVO
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-stretch gap-5 sm:gap-6 p-4 sm:p-6">
        {/* Platillo */}
        <div className="relative flex items-center justify-center md:w-[38%] min-h-[220px] sm:min-h-[260px] shrink-0">
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,229,255,0.14) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
            aria-hidden
          >
            <div
              className="absolute inset-y-0 w-[45%]"
              style={{
                background:
                  "linear-gradient(105deg, transparent, rgba(0,229,255,0.08), transparent)",
                animation: "ovni-event-scan 5s ease-in-out infinite",
              }}
            />
          </div>

          <div
            className="relative"
            style={{ animation: "ovni-event-float 4.5s ease-in-out infinite" }}
          >
            <div
              className="absolute left-1/2 top-[72%] -translate-x-1/2 w-[3px] h-[72px] rounded-full origin-top"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,255,157,0.7), rgba(0,229,255,0.15), transparent)",
                animation: "ovni-event-beam 3s ease-in-out infinite",
                filter: "blur(0.5px)",
              }}
              aria-hidden
            />

            <div
              className="relative w-[148px] h-[148px] sm:w-[168px] sm:h-[168px]"
              aria-hidden
            >
              <div
                className="absolute inset-[18%] rounded-full"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 38%, rgba(200,230,255,0.95) 0%, rgba(120,160,200,0.75) 22%, rgba(60,80,110,0.9) 55%, rgba(30,40,60,0.95) 100%)",
                  boxShadow:
                    "0 8px 32px rgba(0,229,255,0.35), inset 0 -8px 20px rgba(0,0,0,0.45), inset 0 4px 12px rgba(255,255,255,0.2)",
                  border: "2px solid rgba(0,229,255,0.45)",
                }}
              />
              <div
                className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[42%] h-[32%] rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 30%, rgba(180,220,255,0.9) 0%, rgba(80,120,180,0.6) 70%, rgba(40,60,90,0.8) 100%)",
                  boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.3), 0 0 16px rgba(0,229,255,0.4)",
                  border: "1px solid rgba(0,229,255,0.35)",
                }}
              />
              {[
                { left: "22%", delay: "0s" },
                { left: "38%", delay: "0.4s" },
                { left: "54%", delay: "0.8s" },
                { left: "70%", delay: "1.2s" },
              ].map((l) => (
                <span
                  key={l.left}
                  className="absolute bottom-[22%] w-2 h-2 rounded-full"
                  style={{
                    left: l.left,
                    background: "#00ff9d",
                    boxShadow: "0 0 10px #00ff9d, 0 0 18px rgba(0,255,157,0.6)",
                    animation: `ovni-event-blink 1.6s ease-in-out infinite`,
                    animationDelay: l.delay,
                  }}
                />
              ))}
              <span
                className="absolute inset-0 rounded-full border border-[rgba(0,229,255,0.25)]"
                style={{ animation: "ovni-event-ring 2.8s ease-out infinite" }}
              />
            </div>
          </div>

          <p className="absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] tracking-[0.2em] text-[var(--txt3)]">
            OBJETO NO IDENTIFICADO · SIN RESPUESTA OFICIAL
          </p>
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 text-left">
          <div>
            <h3 className="font-display font-black text-[20px] sm:text-[22px] text-[var(--txt)] tracking-[0.5px] mb-2">
              ¿Qué son?
            </h3>
            <p className="text-[14px] sm:text-[15px] text-[var(--txt2)] leading-[1.85]">
              Los informes serios no hablan de “marcianos”, sino de{" "}
              <span className="text-[#00e5ff] font-medium">
                fenómenos aéreos no identificados (UAP)
              </span>
              : objetos o luces que se mueven con precisión, sin motor audible ni
              estela, y que a veces aparecen en radar, infrarrojo y testimonio
              humano al mismo tiempo. Las agencias de EE.UU., el Parlamento
              británico y la NASA reconocen casos que siguen sin explicación
              técnica cerrada.
            </p>
          </div>

          <div>
            <h3 className="font-display font-black text-[20px] sm:text-[22px] text-[var(--txt)] tracking-[0.5px] mb-2">
              ¿Cómo se manejan?
            </h3>
            <p className="text-[14px] sm:text-[15px] text-[var(--txt2)] leading-[1.85]">
              Lo habitual es el silencio inicial, la negación o el archivo
              clasificado. Después suelen filtrarse videos, audios de pilotos o
              informes internos. Los patrones más repetidos: aceleración brusca,
              inmersión en el agua sin salpicadura, interferencia en equipos y
              desaparición instantánea del radar. Rara vez hay contacto directo
              verificable; casi siempre queda evidencia indirecta y testigos que
              no se conocen entre sí.
            </p>
          </div>

          <div>
            <h3 className="font-display font-black text-[18px] sm:text-[20px] text-[var(--txt)] tracking-[0.5px] mb-3">
              Casos con registro real
            </h3>
            <div className="flex flex-col gap-3">
              {REAL_STORIES.map((s) => (
                <div
                  key={s.year + s.place}
                  className="rounded-xl border px-3.5 py-3 sm:px-4 sm:py-3.5"
                  style={{
                    background: "rgba(0,229,255,0.04)",
                    borderColor: "rgba(0,229,255,0.18)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="font-mono text-[10px] font-black px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(0,255,157,0.12)",
                        color: "#00ff9d",
                        border: "1px solid rgba(0,255,157,0.3)",
                      }}
                    >
                      {s.year}
                    </span>
                    <span className="font-mono text-[11px] text-[#00e5ff]">
                      📍 {s.place}
                    </span>
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-[var(--txt)] leading-[1.8]">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] sm:text-[11px] text-[var(--txt3)] leading-relaxed tracking-[0.06em] pt-1 border-t border-[rgba(0,229,255,0.1)]">
            Este archivo no afirma origen extraterrestre. Reúne hechos
            documentados, patrones de comportamiento y testimonios que la ciencia
            oficial aún no puede descartar ni confirmar por completo.
          </p>
        </div>
      </div>
    </div>
  );
}
