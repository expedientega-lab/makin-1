export interface Prize {
  ico: string
  nm: string
  p: number
  v: number
  col: string
  jk?: boolean
}

export const prizes: Prize[] = [
  { ico: '🤖', nm: 'Bot de Trading', p: 25, v: 49, col: 'var(--neon)' },
  { ico: '🧠', nm: 'Pack 500 Prompts', p: 30, v: 29, col: 'var(--txt)' },
  { ico: '📊', nm: 'Template Notion', p: 20, v: 39, col: 'var(--green)' },
  { ico: '🔐', nm: 'Acceso VIP 60d', p: 15, v: 59, col: '#f0a05a' },
  { ico: '📚', nm: 'Curso Digital', p: 8, v: 79, col: 'var(--yellow)' },
  { ico: '💰', nm: 'JACKPOT BUNDLE', p: 2, v: 89, col: 'var(--pink)', jk: true },
]

export const tickerItems = [
  { type: 'brand', text: 'CLAWZONE' },
  { type: 'win', text: '🏆 @mateo_g agarró BOT TRADING' },
  { type: 'green', text: '✅ ENTREGA DIGITAL INMEDIATA' },
  { type: 'brand', text: 'JUGADAS HOY: 2.847' },
  { type: 'hot', text: '🔥 JACKPOT EN JUEGO' },
  { type: 'win', text: '🏆 @sofia_r agarró VIP 60 DÍAS' },
  { type: 'normal', text: '⚡ 60 SEGUNDOS Y LO TENÉS' },
  { type: 'brand', text: '+12.400 GANADORES' },
  { type: 'win', text: '🏆 @nico_f agarró PACK 500 PROMPTS' },
  { type: 'green', text: '📦 PRODUCTO DIGITAL · SIN ENVÍO' },
  { type: 'hot', text: '🔥 38 UNIDADES DISPONIBLES' },
]

export const fortunes = {
  amor: [
    'El amor que buscás ya está más cerca de lo que pensás. Solo necesitás bajar la guardia un poco.',
    'Alguien en tu círculo piensa en vos más de lo que imaginás. Prestá atención a los gestos pequeños.',
    'Esta semana llegará una conversación que puede cambiarlo todo. Estate presente.',
    'Tu energía amorosa está en su punto más alto. Cualquier conexión nueva tiene potencial enorme.',
    'Un reencuentro inesperado viene. Tu corazón va a saber exactamente qué hacer.',
  ],
  salud: [
    'Tu cuerpo te pide movimiento y luz solar. Una caminata de 20 minutos cambia toda tu energía.',
    'Dormís menos de lo que necesitás. Esta noche priorizá el descanso sobre las pantallas.',
    'Tenés más energía reservada de lo que creés. Tu límite real está más lejos de lo que pensás.',
    'Hidratación y respiración consciente: los dos secretos que ignorás que más te ayudarían.',
    'Un pequeño cambio en tu rutina matutina va a tener impacto enorme en las próximas semanas.',
  ],
  dinero: [
    'Una oportunidad financiera aparecerá de donde menos la esperás. Mantené ojos y mente abiertos.',
    'Esta semana es ideal para revisar tus gastos. Hay dinero escapando sin que lo notes.',
    'Algo que creaste antes va a generar ingresos que no esperabas. Confiá en tu trabajo pasado.',
    'El próximo mes trae una decisión financiera importante. Analizá bien antes de actuar.',
    'Tu instinto sobre esa oportunidad que dudás está siendo subestimado. Investigá más a fondo.',
  ],
  trabajo: [
    'Una idea que tenés desde hace tiempo finalmente va a encontrar su momento esta semana.',
    'Alguien en tu red puede abrirte una puerta que no sabías que existía. Conectá más.',
    'Tu mayor fortaleza laboral está siendo subvalorada. Es momento de hacerla más visible.',
    'Un proyecto difícil se va a simplificar. La claridad llega cuando menos la buscás.',
    'Una conversación que evitás va a resolver más de lo que creés si la tenés esta semana.',
  ],
  deporte: [
    'Tu rendimiento físico está a punto de dar un salto. El trabajo de estos días empieza a verse.',
    'Hay diferencia entre el dolor que te hace crecer y el que te frena. Escuchá tu cuerpo hoy.',
    'Tu preparación es mejor de lo que tu mente te dice. Confiá más en el proceso que seguiste.',
    'El descanso no es pereza: es parte del entrenamiento. Tu cuerpo lo necesita esta semana.',
    'Una técnica o metodología nueva puede cambiar completamente tus resultados. Buscala.',
  ],
  energia: [
    'Tu energía vibra alto esta semana. Las personas que lleguen serán un reflejo de eso.',
    'Soltá algo que ya cumplió su ciclo. El espacio que dejás atrae lo que realmente necesitás.',
    'Lo que plantés ahora germina fuerte. Momento ideal para nuevos comienzos con intención.',
    'Tu intuición está especialmente activa. Ese presentimiento merece mucha más atención.',
    'Rodéate de quienes te elevan. Tu energía es tu recurso más valioso y más escaso.',
  ],
}

export const wheelSegments = [
  { l: 'Éxito total', c: '#00d4ff', s: 'Todo fluye a tu favor esta semana. Aprovechá cada momento.' },
  { l: 'Amor intenso', c: '#ff2d78', s: 'Una conexión profunda te espera. Estate abierto a lo inesperado.' },
  { l: 'Abundancia', c: '#00ff9d', s: 'El dinero y la prosperidad buscan tu camino activamente.' },
  { l: 'Desafío', c: '#4488ff', s: 'Un obstáculo que al superarlo te hará mucho más fuerte.' },
  { l: 'Creatividad', c: '#cc44ff', s: 'Momento ideal para crear algo nuevo que transforme tu vida.' },
  { l: 'Viaje', c: '#ff9933', s: 'Un cambio de escenario o perspectiva se acerca rápidamente.' },
  { l: 'Salud plena', c: '#00ff9d', s: 'Tu energía vital está en su punto más alto del año.' },
  { l: 'Sorpresa', c: '#ffe033', s: 'Algo completamente inesperado y muy positivo está por llegar.' },
]

export const horoscopeCategories = [
  {
    ico: '❤️',
    nm: 'Amor',
    msgs: {
      S: 'Energía amorosa en su pico. Alguien busca activamente tu atención.',
      A: 'Semana muy favorable. Las conexiones que formes serán profundas.',
      B: 'Relaciones estables. Pequeños roces que se resuelven solos.',
      C: 'Semana de introspección. Enfocate en lo que realmente querés.',
      D: 'Protegé tu corazón. Evitá decisiones apresuradas en el amor.',
    },
  },
  {
    ico: '💪',
    nm: 'Salud',
    msgs: {
      S: 'Energía física en su punto máximo. Tu cuerpo responde increíble.',
      A: 'Vitalidad alta. Momento ideal para nuevos hábitos saludables.',
      B: 'Energía normal. Cuidá el sueño y la hidratación.',
      C: 'Cansancio acumulado. Priorizá el descanso sobre la productividad.',
      D: 'Tu cuerpo pide pausa. Escuchalo antes de que te frene.',
    },
  },
  {
    ico: '💰',
    nm: 'Dinero',
    msgs: {
      S: 'Semana de abundancia. Oportunidad financiera importante viene.',
      A: 'Ingresos inesperados posibles. Mantené los ojos bien abiertos.',
      B: 'Estabilidad económica. Buena semana para planificar.',
      C: 'Controlá gastos. No es momento para inversiones grandes.',
      D: 'Semana de austeridad. Revisá tus prioridades financieras.',
    },
  },
  {
    ico: '💼',
    nm: 'Trabajo',
    msgs: {
      S: 'Rendimiento legendario. Tu trabajo será reconocido públicamente.',
      A: 'Semana muy productiva. Ideas brillantes que generan impacto real.',
      B: 'Flujo normal. Completás tareas y mantenés buen ritmo.',
      C: 'Algo de traba en proyectos. Paciencia con procesos lentos.',
      D: 'Semana desafiante. Enfocate solo en lo esencial hoy.',
    },
  },
  {
    ico: '⚽',
    nm: 'Deporte',
    msgs: {
      S: 'Rendimiento de élite. Superás tus propios récords personales.',
      A: 'Muy buena forma. El entrenamiento fluye efectivamente.',
      B: 'Rendimiento sólido y consistente. Progreso constante.',
      C: 'Algo de rigidez. Estiramiento y descanso activo son clave.',
      D: 'Tu cuerpo necesita recuperación real esta semana.',
    },
  },
  {
    ico: '🧠',
    nm: 'Mente',
    msgs: {
      S: 'Claridad total. Ideas geniales que fluyen sin esfuerzo.',
      A: 'Foco y concentración muy altos. Momento de decidir.',
      B: 'Mente estable. Procesás bien sin saturarte.',
      C: 'Algo de dispersión. La meditación o caminata ayudan.',
      D: 'Mente saturada. Necesitás desconectarte para recargar.',
    },
  },
]

export const activityFeed = [
  { icon: '🤖', user: '@mateo.g', item: 'agarró Bot de Trading', time: 'hace 1 min' },
  { icon: '💎', user: '@sofia.r', item: 'agarró Acceso VIP 60d', time: 'hace 4 min' },
  { icon: '📊', user: '@lucas.p', item: 'agarró Template Notion', time: 'hace 7 min' },
  { icon: '💰', user: '@carolina', item: 'agarró JACKPOT $89', time: 'hace 11 min' },
  { icon: '🧠', user: '@nico.f', item: 'agarró Pack 500 Prompts', time: 'hace 15 min' },
  { icon: '📚', user: '@vale.m', item: 'agarró Curso Copywriting', time: 'hace 19 min' },
]

export const reviews = [
  {
    initial: 'M',
    name: 'Mateo G.',
    location: 'Buenos Aires',
    stars: '★★★★★',
    message: '"La garra agarró el bot de trading. Pensé que era una joda pero funciona perfecto en TradingView. Increíble lo que se consigue por $1."',
    prize: '🤖 Bot de Trading · $49',
    time: 'hace 2 minutos',
    avatarClass: 'av1',
  },
  {
    initial: 'S',
    name: 'Sofía R.',
    location: 'Montevideo',
    stars: '★★★★★',
    message: '"Acceso VIP 60 días por $1. Primera jugada y salió ese. Las señales del canal son de altísima calidad."',
    prize: '💎 Acceso VIP 60d · $59',
    time: 'hace 7 minutos',
    avatarClass: 'av2',
  },
  {
    initial: 'L',
    name: 'Lucas P.',
    location: 'Santiago',
    stars: '★★★★★',
    message: '"Jugué 5 veces. Cada vez un premio diferente y cada uno valió más de lo que pagué. Es genuinamente adictivo."',
    prize: '📊 Template Notion · $39',
    time: 'hace 13 minutos',
    avatarClass: 'av3',
  },
  {
    initial: 'V',
    name: 'Vale M.',
    location: 'CDMX',
    stars: '★★★★★',
    message: '"Salió el jackpot. El bundle completo. Dos horas revisando todo y cada cosa de altísima calidad. No puedo creerlo."',
    prize: '💰 JACKPOT Bundle · $89',
    time: 'hace 21 minutos',
    avatarClass: 'av4',
  },
]

export const fortuneCategories = [
  { key: 'amor', emoji: '❤️', name: 'AMOR' },
  { key: 'salud', emoji: '💚', name: 'SALUD' },
  { key: 'dinero', emoji: '💰', name: 'DINERO' },
  { key: 'trabajo', emoji: '💼', name: 'TRABAJO' },
  { key: 'deporte', emoji: '⚽', name: 'DEPORTE' },
  { key: 'energia', emoji: '✨', name: 'ENERGÍA' },
]

export const luckColors = ['Azul eléctrico', 'Verde neón', 'Magenta', 'Cian', 'Amarillo', 'Violeta']
