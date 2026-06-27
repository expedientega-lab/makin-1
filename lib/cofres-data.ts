/** Frases de galleta de la fortuna — el cofre siempre entrega una al abrir. */
export const COFRE_GALLETAS: string[] = [
  "Hoy el universo te guiña: un pequeño gesto tuyo abrirá una puerta grande.",
  "Tu paciencia es orilla quieta: en la quietud llega la buena noticia.",
  "Un número favorito hoy: el que elijas con el corazón.",
  "Alguien cercano recordará algo bueno de vos: dejá que florezca.",
  "La suerte camina con quien camina: un paso al frente y claridad.",
  "La fortuna no grita: susurra. Prestá atención a lo que te repiten con cariño.",
  "Un ciclo se cierra con elegancia y otro empieza con luz propia. Soltá lo que ya cumplió.",
  "Tu intuición tenía razón: confiá en el primer impulso generoso que tengas hoy.",
  "El cosmos guarda un as bajo la manga para vos: aparece cuando menos forceés.",
  "Lo que sembraste en silencio va a mostrar brotes visibles muy pronto.",
  "El amor que buscás ya está más cerca de lo que pensás. Solo bajá un poco la guardia.",
  "Esta semana llegará una conversación que puede cambiarlo todo. Estate presente.",
  "Tu energía vibra alto: las personas que lleguen serán un reflejo de eso.",
  "Soltá algo que ya cumplió su ciclo. El espacio que dejás atrae lo que necesitás.",
  "Lo que plantés ahora germina fuerte. Momento ideal para nuevos comienzos.",
  "Tu intuición está especialmente activa. Ese presentimiento merece más atención.",
  "Una oportunidad financiera aparecerá de donde menos la esperás. Ojos abiertos.",
  "Algo que creaste antes va a generar frutos que no esperabas. Confiá en tu trabajo.",
  "Tu instinto sobre esa duda está siendo subestimado. Investigá más a fondo.",
  "Una idea que tenés desde hace tiempo finalmente encuentra su momento esta semana.",
  "Alguien en tu red puede abrirte una puerta que no sabías que existía.",
  "Un proyecto difícil se va a simplificar. La claridad llega cuando menos la buscás.",
  "Tu rendimiento está a punto de dar un salto. El esfuerzo de estos días se nota.",
  "Hay diferencia entre el dolor que te hace crecer y el que te frena. Escuchá tu cuerpo.",
  "Rodéate de quienes te elevan. Tu energía es tu recurso más valioso.",
  "El portal detectó luz en tu camino: no apagues la chispa por miedo al brillo.",
  "Un mensaje breve pero claro: merecés descanso sin culpa y alegría sin permiso.",
  "La abundancia que te corresponde tiene forma de paz sostenida, no de ruido.",
  "Hoy conviene decir sí a algo pequeño que te entusiasme, aunque no tenga plan perfecto.",
  "Lo que te hace único es exactamente lo que el mundo necesita que dejes de disculpar.",
  "Un reencuentro inesperado viene. Tu corazón va a saber qué hacer.",
  "Tu cuerpo pide movimiento y luz: veinte minutos al aire cambian toda la energía.",
  "Dormís menos de lo que necesitás. Esta noche priorizá el descanso sobre las pantallas.",
  "Tenés más energía reservada de lo que creés. Tu límite real está más lejos.",
  "Hidratación y respiración consciente: dos secretos que más te ayudarían hoy.",
  "Un pequeño cambio en tu rutina matutina tendrá impacto enorme en las próximas semanas.",
  "Esta semana es ideal para revisar gastos. Hay algo escapando sin que lo notes.",
  "El próximo mes trae una decisión importante. Analizá bien antes de actuar.",
  "Tu mayor fortaleza está siendo subvalorada. Es momento de hacerla más visible.",
  "Una conversación que evitás puede resolver más de lo que creés si la tenés pronto.",
  "Tu preparación es mejor de lo que tu mente te dice. Confiá más en el proceso.",
  "El descanso no es pereza: es parte del entrenamiento. Tu cuerpo lo necesita.",
  "Una técnica nueva puede cambiar completamente tus resultados. Buscala con curiosidad.",
  "Las estrellas acuerdan: hoy merecés un respiro y un gesto amable hacia vos.",
  "Energía positiva en camino: abrí la ventana, literal o figurada.",
  "Vibración del día: gratitud pequeña, cambio grande.",
  "El cosmos expande tu campo: lo que pedís con coherencia empieza a tomar forma.",
  "Universo en modo aliado: las fricciones de hoy pulen tu propósito.",
  "No estás atrasado, estás en tu tiempo. El resto es ruido de comparación.",
  "El universo recicla la pena en compost: de ahí van a crecer cosas verdes.",
  "Estás siendo preparado para sostener algo hermoso que todavía no anunciaron los calendarios.",
  "La magnitud de tu vida no se mide en pantallas sino en momentos donde fuiste real.",
  "Tu luz no compite con la de otros; suma. Encendé sin pedir permiso.",
  "Un encuentro casual no es casual: llevá la conversación un paso más allá del saludo.",
  "La galleta más honesta: lo invisible está ordenando lo visible en tu favor.",
  "Merecés espacios donde no tengas que demostrar nada para ser querido.",
  "Lo que buscás con angustia ya te busca en calma: cruzá la mitad del puente.",
  "Tu historia tiene un giro noble: lo que dolió se convierte en brújula.",
  "Hoy conviene elegir la opción que te deje en paz mañana, no la que impresione hoy.",
  "Un regalo del destino: la respuesta que necesitás ya está en algo que leíste antes.",
  "El cofre habló claro: tu próximo movimiento es pequeño, constante y valiente.",
];

/** Probabilidades mostradas al revelar (suman ~100%; premio real: siempre galleta). */
export const COFRES_ODDS_DISPLAY: { label: string; pct: number; ico: string }[] = [
  { ico: "🥠", label: "Galleta de la fortuna", pct: 82.4 },
  { ico: "🔐", label: "Acceso VIP 60 días", pct: 8.2 },
  { ico: "🤖", label: "Bot de trading", pct: 4.5 },
  { ico: "🎁", label: "Caja misteriosa digital", pct: 2.8 },
  { ico: "💵", label: "$25 USD en efectivo", pct: 1.2 },
  { ico: "💵", label: "$50 USD en efectivo", pct: 0.45 },
  { ico: "💵", label: "$100 USD en efectivo", pct: 0.12 },
  { ico: "💰", label: "$500 USD jackpot", pct: 0.03 },
];

export interface CofreGalletaResult {
  phrase: string;
}

export function pickCofreGalleta(): CofreGalletaResult {
  const phrase =
    COFRE_GALLETAS[Math.floor(Math.random() * COFRE_GALLETAS.length)] ??
    COFRE_GALLETAS[0];
  return { phrase };
}

export function formatCofreOddsPct(pct: number): string {
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct >= 0.1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(2)}%`;
}
