"use client";

import { useState } from "react";

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

// ── Categorías ─────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    key: "ovnis",
    label: "OVNIS",
    emoji: "🛸",
    desc: "Avistamientos, encuentros cercanos y fenómenos aéreos sin explicación.",
  },
  {
    key: "fantasmas",
    label: "FANTASMAS",
    emoji: "👻",
    desc: "Presencias, apariciones y experiencias al borde de lo sobrenatural.",
  },
  {
    key: "simulacion",
    label: "SIMULACIÓN",
    emoji: "🌐",
    desc: "Glitches de la realidad, Mandela effect y fallas en la matriz.",
  },
  {
    key: "cosmos",
    label: "COSMOS",
    emoji: "🌌",
    desc: "Señales del espacio, objetos inexplicables y mensajes extraterrestres.",
  },
  {
    key: "senales",
    label: "SEÑALES",
    emoji: "📡",
    desc: "Patrones, sincronicidades y mensajes ocultos en la cotidianidad.",
  },
  {
    key: "mente",
    label: "MENTE",
    emoji: "🧠",
    desc: "Precognición, telepatía, sueños proféticos y experiencias fuera del cuerpo.",
  },
  {
    key: "enviados",
    label: "ENVIADOS",
    emoji: "✍️",
    desc: "Relatos enviados por la comunidad Mystika.",
  },
];

// ── Relatos por categoría ──────────────────────────────────────────────────
const STORIES: Record<string, Story[]> = {
  ovnis: [
    {
      id: "o1",
      title: "Tres objetos sobre el Río Uruguay",
      body: "Eran las 2:17 de la madrugada cuando salí al patio por el calor. Sobre el río vi tres luces en triángulo perfecto, inmóviles durante once minutos. No parpadeaban. No hacían ruido. Después, en menos de un segundo, desaparecieron hacia arriba. Al día siguiente, varios vecinos de la zona reportaron lo mismo sin haberse comunicado entre sí. La prefectura naval no dio respuesta oficial.",
      author: "@mariela_s",
      location: "Entre Ríos, Argentina",
      timeAgo: "hace 3 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
    {
      id: "o2",
      title: "El video que me pidieron borrar",
      body: 'Filmé desde el avión durante el vuelo Santiago-Lima algo que se mantuvo paralelo a nosotros por 8 minutos a la misma altitud. Forma de disco, superficie metálica sin ventanas. Cuando aterricé me contactaron dos personas de traje que se identificaron como "personal de seguridad aeronáutica" y me pidieron amablemente que borrara el video. No era policia. No tenían placa visible. Conservé una copia.',
      author: "@roberto_v",
      location: "Vuelo SCL-LIM",
      timeAgo: "hace 1 semana",
      badge: "VERIFICADO",
      badgeColor: "#00ff9d",
    },
    {
      id: "o3",
      title: "La base bajo el lago",
      body: "Trabajo en topografía para una empresa de minería en el sur de Chile. En una medición de profundidad del Lago General Carrera detectamos una cavidad artificial a 340 metros de profundidad con bordes demasiado regulares para ser naturales. Cuando entregué el informe me dijeron que era un error del equipo. El equipo estaba calibrado. Ese sector está vedado desde hace seis meses.",
      author: "@topógrafo_anon",
      location: "Aysén, Chile",
      timeAgo: "hace 5 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
    {
      id: "o4",
      title: "Cuatro horas perdidas en la ruta",
      body: "Salí de Córdoba a las 21:00 rumbo a Rosario. Ruta 9, completamente despejada. Recuerdo las luces, un resplandor blanco, y después el amanecer. Llegué a Rosario a las 6:30 AM. Cuatro horas que no existen en mi memoria. El odómetro marcaba 40 kilómetros menos de lo que debería. Tenía marcas circulares en ambos antebrazos que tardaron dos semanas en desaparecer.",
      author: "@conductor_r",
      location: "Ruta 9, Argentina",
      timeAgo: "hace 2 semanas",
      badge: "NUEVO",
      badgeColor: "#b388ff",
    },
  ],
  fantasmas: [
    {
      id: "f1",
      title: "La figura en el pasillo del hospital",
      body: "Trabajo el turno noche en terapia intensiva. A las 3:40 AM vi en el pasillo a una mujer de bata blanca que caminaba hacia la salida de emergencia. Asumí que era una paciente. Fui a buscarla y no había nadie. Revisé las cámaras: en el video se ve mi sombra, pero donde yo veo a la mujer, la cámara no registra nada. Mis compañeras dicen que no soy la primera en verla.",
      author: "@enfermera_noc",
      location: "Hospital público, Buenos Aires",
      timeAgo: "hace 2 días",
      badge: "VERIFICADO",
      badgeColor: "#00ff9d",
    },
    {
      id: "f2",
      title: "Mi hijo habla con alguien que no veo",
      body: 'Mi hijo de 3 años lleva cuatro meses hablando con "el señor del sillón". Siempre el mismo sillón donde murió mi suegro dos meses antes de que él naciera. Le pregunté cómo se llamaba y me dijo el nombre completo de mi suegro, incluyendo el segundo nombre que nadie le había dicho. Describió su ropa, sus anteojos, y dijo que "huele a tabaco y colonia azul". Era fumador de pipa.',
      author: "@madre_preocupada",
      location: "Guadalajara, México",
      timeAgo: "hace 1 día",
      badge: "NUEVO",
      badgeColor: "#b388ff",
    },
    {
      id: "f3",
      title: "El audio del cementerio",
      body: "Soy investigador de fenómenos paranormales independiente. En el Cementerio de la Recoleta, a las 2 AM, grabé durante 40 minutos con micrófono de alta sensibilidad. En el minuto 23:14 se escucha con absoluta claridad una voz que dice mi nombre. Nadie más estaba presente. He enviado el audio a tres laboratorios de análisis acústico y los tres confirmaron que la voz es de origen humano y no es mi propia voz procesada.",
      author: "@investigador_p",
      location: "Buenos Aires, Argentina",
      timeAgo: "hace 5 días",
      badge: "VERIFICADO",
      badgeColor: "#00ff9d",
    },
    {
      id: "f4",
      title: "El conventillo de San Telmo",
      body: "Alquilé un cuarto en un conventillo de San Telmo para estudiar. La primera semana: pasos en el techo a las 3 AM (el techo es plano, no hay acceso). La segunda semana: una silla que amanecía dada vuelta tres días seguidos. La tercera semana: encontré escrito en vapor en el espejo del baño un nombre que no reconocí. Lo busqué y era el de la primera inquilina del lugar, muerta en 1943.",
      author: "@estudiante_anon",
      location: "San Telmo, Buenos Aires",
      timeAgo: "hace 4 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
  ],
  simulacion: [
    {
      id: "s1",
      title: "El glitch que filmé en el subte",
      body: "Iba en la línea D de Buenos Aires cuando vi algo imposible: una persona que entraba por la puerta delantera al mismo tiempo que salía por la trasera. No es un error de percepción. Lo filmé. En el video se ve claramente que la misma figura con la misma campera aparece simultáneamente en dos puertas opuestas del vagón. Nadie alrededor pareció notarlo. El video sigue en mi teléfono.",
      author: "@camila_t",
      location: "Subte Línea D, Buenos Aires",
      timeAgo: "hace 3 días",
      badge: "VERIFICADO",
      badgeColor: "#00ff9d",
    },
    {
      id: "s2",
      title: "Recuerdo un mundo diferente",
      body: 'En mi memoria, Australia siempre fue una isla cerca de Sudamérica. El Monopoly siempre tuvo al personaje con monóculo. New Zealand estaba al noreste de Australia. Colombia siempre se escribió sin "u". Pikachu siempre tuvo la punta de la cola negra. Nelson Mandela murió en prisión en los 80. Ninguna de estas cosas es así en este mundo. Pero yo las recuerdo con certeza absoluta.',
      author: "@sebastian_k",
      location: "Mendoza, Argentina",
      timeAgo: "hace 6 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
    {
      id: "s3",
      title: "Dos veces el mismo momento, exacto",
      body: "El martes 14 viví exactamente el mismo día dos veces. No un déjà vu: el mismo día. Mismas conversaciones, mismos eventos, en el mismo orden. Cuando llegó el momento exacto en que el día anterior había derramado mi café, lo esquivé antes de que pasara. Mi compañero de trabajo me preguntó cómo sabía que iba a caer. No pude explicarle. Al día siguiente todo volvió a la normalidad.",
      author: "@diego_r",
      location: "Bogotá, Colombia",
      timeAgo: "hace 1 semana",
      badge: "NUEVO",
      badgeColor: "#b388ff",
    },
    {
      id: "s4",
      title: "El edificio que no existe en los mapas",
      body: "Cada mañana camino por la misma calle para ir al trabajo. Hace tres semanas noté un edificio de 8 pisos entre dos que conozco bien. No estaba antes. Le pregunté a mi vecino y dice que siempre estuvo ahí. Lo busqué en Google Maps: no aparece. En Street View, la calle muestra un terreno baldío en ese lugar. Fui a buscarlo en persona y ahí está. Perfectamente real, con gente entrando y saliendo.",
      author: "@urban_explorer",
      location: "Ciudad de México",
      timeAgo: "hace 9 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
  ],
  cosmos: [
    {
      id: "c1",
      title: "La señal que captó mi receptor",
      body: "Soy radioaficionado con 20 años de experiencia. El 7 de octubre capté en 1420 MHz (la frecuencia del hidrógeno, usada en la búsqueda SETI) una señal de 73 segundos con un patrón que se repetía cada 11.2 segundos. La señal tenía modulación intencional: no era ruido. Reporté a tres instituciones. Solo una respondió pidiéndome las coordenadas exactas de la antena. Nunca más me respondieron.",
      author: "@ham_operator_uy",
      location: "Montevideo, Uruguay",
      timeAgo: "hace 4 días",
      badge: "VERIFICADO",
      badgeColor: "#00ff9d",
    },
    {
      id: "c2",
      title: "Lo que NASA borró del livestream",
      body: 'El 9 de agosto estaba viendo el livestream de la ISS. A las 14:33 UTC apareció en el ángulo superior izquierdo un objeto de forma ovalada moviéndose en contra de la órbita. En ese momento, la señal se cortó y apareció el cartel de "señal perdida". Cuando la transmisión volvió, el objeto ya no estaba. Decenas de personas en el chat lo vieron. Los screenshots están en Reddit, aunque el post fue removido.',
      author: "@techie_space_mx",
      location: "Ciudad de México",
      timeAgo: "hace 5 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
    {
      id: "c3",
      title: "El planeta que desapareció del cielo",
      body: "Durante 14 meses observé sistemáticamente el cielo con mi telescopio Celestron. Registré en mi bitácora un objeto con magnitud 6.2 en una posición fija que no correspondía a ningún cuerpo catalogado. Lo observé 47 veces. El mes pasado, en esa posición exacta, no hay nada. Ni el objeto, ni las notas de mis observaciones previas coinciden con ninguna base de datos oficial. Existe una laguna donde debería haber algo.",
      author: "@astrónomo_afic",
      location: "Valparaíso, Chile",
      timeAgo: "hace 2 días",
      badge: "NUEVO",
      badgeColor: "#b388ff",
    },
  ],
  senales: [
    {
      id: "se1",
      title: "Las mismas 4 cifras durante 6 meses",
      body: "El 11 de enero empecé a ver 11:11 en el reloj cada día sin excepción. Después sumaron 3:33, 4:44 y 22:22. Pero no solo en relojes: tickets de supermercado con total $11.11, patentes de autos, números de turno, piso de ascensor. En promedio veo estas cifras 8 veces por día. Empecé a registrarlo: 182 días consecutivos. Lo que me hace dudar de la coincidencia es que sucede también cuando no estoy pendiente del reloj.",
      author: "@luciana_b",
      location: "Rosario, Argentina",
      timeAgo: "hace 2 días",
      badge: "NUEVO",
      badgeColor: "#b388ff",
    },
    {
      id: "se2",
      title: "El sueño que tuvimos tres personas",
      body: "En un grupo de estudio soñamos la misma noche con el mismo lugar: una playa de arena negra con dos lunas. Ninguno se lo contó al otro antes. Al día siguiente los tres llegamos al grupo con el mismo relato. Mismo color de cielo (naranja oscuro), misma temperatura en el sueño, mismo sonido de olas. Uno de nosotros dibujó el lugar sin saber que los otros también lo recordaban con exactitud idéntica.",
      author: "@grupo_phi",
      location: "Barcelona, España",
      timeAgo: "hace 1 semana",
      badge: "VERIFICADO",
      badgeColor: "#00ff9d",
    },
    {
      id: "se3",
      title: "El patrón en mis fotos aleatorias",
      body: "Llevo un año fotografiando al azar: disparo sin mirar, en cualquier dirección. Al revisar 1.200 fotos descubrí que 34 de ellas capturaron el mismo ángulo de cielo con una forma de nube idéntica, en distintos días, distintas ciudades y distintas horas. La probabilidad estadística de que sea coincidencia es de 1 en 280 millones. La forma de la nube se parece a un símbolo que encontré en un manuscrito del siglo XVII.",
      author: "@fotógrafo_x",
      location: "Medellín, Colombia",
      timeAgo: "hace 3 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
  ],
  mente: [
    {
      id: "m1",
      title: "Viví el futuro durante 7 minutos",
      body: 'Estaba en la ducha cuando de repente "salté" a lo que parecía ser el mismo día pero 7 minutos después. Vi exactamente lo que haría: salir de la ducha, secarme, buscar el teléfono, leer un mensaje de mi hermana. Cuando "volví", me sequé y fui al teléfono. El mensaje de mi hermana llegó exactamente como lo había visto. La ducha había tardado 7 minutos exactos. No soy propenso a experiencias disociativas.',
      author: "@temporal_v",
      location: "Buenos Aires, Argentina",
      timeAgo: "hace 4 días",
      badge: "VERIFICADO",
      badgeColor: "#00ff9d",
    },
    {
      id: "m2",
      title: "La conversación que nadie recuerda",
      body: "Soy psicóloga. En una sesión grupal de 8 personas tuvimos una conversación de 40 minutos sobre un tema específico que yo fui anotando. Al terminar la sesión pregunté a cada uno qué habíamos discutido. Los 8 recordaban una conversación completamente diferente que nunca ocurrió según mis notas. Mis notas de lo que realmente pasaron están escritas con mi letra. Nadie puede explicar el divergencia.",
      author: "@psicóloga_c",
      location: "Madrid, España",
      timeAgo: "hace 6 días",
      badge: "SIN CONFIRMAR",
      badgeColor: "#f7931a",
    },
    {
      id: "m3",
      title: "Tres semanas soñando datos reales",
      body: "Durante 21 días consecutivos soñé con números: coordenadas, fechas, nombres. Los anotaba al despertar. Al cabo de tres semanas, por curiosidad, busqué algunas de las coordenadas: eran lugares reales, algunos de ellos sitios arqueológicos no publicados al momento de mis sueños. Uno de los nombres que soñé era el apellido de una persona cuya desaparición se reportó públicamente una semana después de que lo soñé.",
      author: "@sueños_lúcidos",
      location: "Lima, Perú",
      timeAgo: "hace 8 días",
      badge: "NUEVO",
      badgeColor: "#b388ff",
    },
  ],
  enviados: [],
};

const BADGE_STYLES: Record<string, string> = {
  VERIFICADO: "rgba(0,255,157,0.15)",
  "SIN CONFIRMAR": "rgba(247,147,26,0.15)",
  NUEVO: "rgba(179,136,255,0.15)",
  ENVIADO: "rgba(255,107,157,0.15)",
};

export function MisterioSection() {
  const [selected, setSelected] = useState<string>("ovnis");
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [formName, setFormName] = useState("");
  const [formCat, setFormCat] = useState("ovnis");
  const [formStory, setFormStory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const currentCat = CATEGORIES.find((c) => c.key === selected);
  const baseStories = STORIES[selected] ?? [];
  const allStories = selected === "enviados" ? userStories : baseStories;

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
        setSelected("enviados");
      }, 2500);
    }, 1400);
  };

  return (
    <div className="animate-[fadeup_0.4s_ease]">
      {/* Header */}
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
            className="text-[var(--mystik)]"
            style={{ textShadow: "0 0 20px rgba(179,136,255,.5)" }}
          >
            no tienen
          </span>{" "}
          explicación
        </h2>
        <p className="text-[15px] text-[var(--txt2)] max-w-[480px] mx-auto leading-[1.8] font-light">
          Ovnis, fantasmas, glitches de la realidad, señales del cosmos. Leé,
          compartí y enviá tu propio relato al archivo.
        </p>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-5 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelected(cat.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border transition-all font-mono text-[13px] tracking-[1px] font-bold"
            style={{
              background:
                selected === cat.key ? "var(--mystikS)" : "var(--bg2)",
              borderColor:
                selected === cat.key ? "var(--mystik)" : "var(--border)",
              color: selected === cat.key ? "var(--mystik)" : "var(--txt2)",
              boxShadow:
                selected === cat.key
                  ? "0 0 14px rgba(179,136,255,0.2)"
                  : "none",
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {cat.key === "enviados" && userStories.length > 0 && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: "#ff6b9d", color: "#0a0612" }}
              >
                {userStories.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Category description */}
      {currentCat && (
        <p className="text-[15px] text-[var(--txt3)] text-center mb-5 italic">
          {currentCat.emoji} {currentCat.desc}
        </p>
      )}

      {/* Stories */}
      {allStories.length === 0 ? (
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
              className="rounded-xl border p-5 relative overflow-hidden transition-all hover:border-[var(--mystik)]"
              style={{
                background: story.isUser
                  ? "linear-gradient(135deg, rgba(255,107,157,0.06) 0%, var(--bg2) 100%)"
                  : "var(--bg2)",
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
              ENVIADOS.
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
                  {CATEGORIES.filter((c) => c.key !== "enviados").map((c) => (
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
    </div>
  );
}
