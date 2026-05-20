export interface Prize {
  ico: string
  nm: string
  p: number
  v: string
  col: string
  jk?: boolean
  isReal?: boolean
  glow: string
}

export const displayPrizes: Prize[] = [
  { ico: '💵', nm: '$1,000 USD', p: 5, v: '$1,000', col: '#00ff9d', glow: 'rgba(0,255,157,0.5)', jk: true },
  { ico: '🤖', nm: 'Bot Trading', p: 20, v: '$70', col: '#00e5ff', glow: 'rgba(0,229,255,0.5)' },
  { ico: '📦', nm: 'Caja Misteriosa', p: 15, v: '$150', col: '#ff6b9d', glow: 'rgba(255,107,157,0.5)' },
  { ico: '₿', nm: 'Bitcoin', p: 10, v: '0.001 BTC', col: '#f7931a', glow: 'rgba(247,147,26,0.5)' },
  { ico: '🥠', nm: 'Galleta Mistica', p: 50, v: 'GARANTIZADA', col: '#ffd700', glow: 'rgba(255,215,0,0.6)', isReal: true },
]

export const tickerItems = [
  { type: 'brand', text: 'MYSTIKA' },
  { type: 'win', text: '✨ @lucia_m gano GALLETA MISTICA' },
  { type: 'green', text: '🔮 PORTAL ACTIVO' },
  { type: 'brand', text: 'REVELACIONES: 4.283' },
  { type: 'hot', text: '💫 JACKPOT $1,000 DISPONIBLE' },
  { type: 'win', text: '✨ @carlos_v encontro su fortuna' },
  { type: 'normal', text: '⭐ TU DESTINO ESPERA' },
  { type: 'brand', text: '+18.700 FORTUNAS REVELADAS' },
  { type: 'win', text: '✨ @maria_g descubrio Bitcoin' },
  { type: 'green', text: '🌙 ALINEACION PERFECTA' },
  { type: 'hot', text: '🔥 BOT TRADING DISPONIBLE' },
]

export const fortunes = {
  'amor-basico': [
    'El amor que buscas esta mas cerca de lo que pensas. Solo necesitas bajar la guardia un poco.',
    'Alguien en tu circulo piensa en vos mas de lo que imaginas. Presta atencion a los gestos pequenos.',
    'Esta semana llegara una conversacion que puede cambiarlo todo. Estate presente.',
    'Tu energia amorosa esta en su punto mas alto. Cualquier conexion nueva tiene potencial enorme.',
    'Un reencuentro inesperado viene. Tu corazon va a saber exactamente que hacer.',
  ],
  'amor-medio': [
    'El universo conspira para unir almas gemelas. Tu pareja ideal esta mas cerca de lo que crees.',
    'Una conexion karmica se reactiva. Alguien del pasado regresara con lecciones importantes.',
    'Tu corazon esta listo para recibir amor incondicional. Abrete a la posibilidad.',
    'Las estrellas alinean un encuentro significativo. Estate atento a las senales del cosmos.',
    'Un amor transformador entra en tu vida. Preparate para un cambio profundo.',
  ],
  'amor-avanzado': [
    'Tu llama gemela te busca activamente. La conexion espiritual es inminente.',
    'Los angeles del amor trabajan en tu favor. Un milagro romantico se manifiesta.',
    'Tu alma reconoce a su compañera. La reunion divina esta programada.',
    'El universo te concede el amor verdadero. Mereces esta bendicion celestial.',
    'Tu frecuencia amorosa atrae a tu alma gemela. La magia del amor opera.',
  ],
  'amor-supremo': [
    'El amor divino te elige como canal. Eres un mensajero del amor universal.',
    'Tu corazon se fusiona con el corazon del cosmos. Eres uno con el amor divino.',
    'Los maestros del amor te guian. Tu mision es difundir amor incondicional.',
    'Tu esencia amorosa ilumina el mundo. Eres una fuente de amor puro.',
    'El amor supremo fluye a traves de ti. Eres el amor hecho humano.',
  ],
  'riqueza-basico': [
    'Una oportunidad financiera aparecera de donde menos la esperas. Mantene ojos y mente abiertos.',
    'Esta semana es ideal para revisar tus gastos. Hay dinero escapando sin que lo notes.',
    'Algo que creaste antes va a generar ingresos que no esperabas. Confia en tu trabajo pasado.',
    'El proximo mes trae una decision financiera importante. Analiza bien antes de actuar.',
    'Tu instinto sobre esa oportunidad que dudas esta siendo subestimado. Investiga mas a fondo.',
  ],
  'riqueza-medio': [
    'Una inversion inesperada multiplicara tu capital. Confia en tu vision financiera.',
    'El universo esta alineando prosperidad para ti. Abre tus brazos y recibe.',
    'Tu talento monetario esta despertando. Nuevas fuentes de ingreso se revelaran pronto.',
    'Los portales de abundancia se abren. Fluye hacia ti con confianza.',
    'Tu energia de atraccion financiera esta en su punto maximo. Manifesta riqueza.',
  ],
  'riqueza-avanzado': [
    'El oro del universo fluye hacia ti como un rio. Eres un iman para la prosperidad.',
    'Tu ADN de riqueza se activa. Recuerdas tu derecho divino a la abundancia.',
    'Los maestros de la fortuna te bendicen. Tu legado financiero es ilimitado.',
    'Tu conciencia de millonario despierta. Piensa, actua y recibe como millonario.',
    'El universo te concede acceso a tesoros ocultos. Descubre tu verdadera riqueza.',
  ],
  'riqueza-supremo': [
    'Eres el creador de realidades financieras. Manifiestas abundancia con cada pensamiento.',
    'Tu conexion con la fuente de riqueza es directa. Eres un canal de prosperidad infinita.',
    'Los reinos de la opulencia te reciben. Tu herencia divina incluye toda la riqueza.',
    'Tu poder de manifestacion financiera es ilimitado. Creas dinero desde el vacio.',
    'Eres la riqueza misma. El universo se refleja en tu abundancia sin limites.',
  ],
  'destino-basico': [
    'El universo conspira a tu favor. Lo que parece casualidad es el destino alineandose.',
    'Un camino que no consideraste se abrira esta semana. No temas explorar lo desconocido.',
    'Tu proposito de vida se clarifica. Escucha los susurros del cosmos.',
    'Las estrellas indican un cambio significativo. Abraza la transformacion.',
    'Tu destino esta tejido con hilos dorados. La prosperidad te busca activamente.',
  ],
  'destino-medio': [
    'Una revelacion profunda esta por llegar. Tu vida dara un giro trascendental.',
    'Los ancestros guian tus pasos. Sigue las senales que te muestran el camino.',
    'Tu alma elige su direccion. Confia en el proceso universal que te transforma.',
    'El tiempo del destino ha llegado. Todo lo que esperabas se manifiesta ahora.',
    'Tu mision terrenal se revela. El proposito de tu existencia se hace claro.',
  ],
  'destino-avanzado': [
    'Tu destino cosmico se despliega. Eres una pieza clave en el plan divino.',
    'Los portales del destino se abren. Tu viaje trascendental comienza ahora.',
    'Tu alma recuerda su mision. El universo te espera para cumplir tu proposito.',
    'Las profecias sobre ti se cumplen. Eres el elegido para esta epoca.',
    'Tu destino legendario se manifiesta. La historia recordara tu nombre.',
  ],
  'destino-supremo': [
    'Eres el architecto de destinos. Tu influencia cambia el curso de la humanidad.',
    'Tu conexion con el destino es directa. Escribes el futuro con cada decision.',
    'Los maestros del destino te coronan. Tu reinado sobre el tiempo ha comenzado.',
    'Eres el destino mismo. El universo se mueve segun tu voluntad divina.',
    'Tu poder sobre el destino es absoluto. Creas realidades con tu presencia.',
  ],
  'mistico-basico': [
    'Los portales dimensionales se abren para ti. Realidades alternativas se muestran.',
    'Tu conciencia se expande a niveles cosmicamente elevados. La verdad universal se revela.',
    'Los maestros ascendidos comunican contigo. Recibe sus enseñanzas sagradas.',
    'Tu ADN espiritual se reactiva. Poderes latentes despiertan dentro de tu ser.',
    'Las lineas temporales convergen en tu favor. El pasado, presente y futuro se alinean.',
  ],
  'mistico-medio': [
    'El velo entre mundos se adelgaza. Entidades de luz guian tu camino iluminado.',
    'Tu frecuencia vibratoria alcanza niveles maestros. Manifiestas realidad con pensamiento.',
    'Los secretos del universo se desvelan ante ti. El conocimiento ancestral es tuyo.',
    'Tu conexion con la fuente divina se fortalece. Eres un canal de energia pura.',
    'Los misterios de la existencia se resuelven. Comprendes tu verdadera naturaleza cosmica.',
  ],
  'mistico-avanzado': [
    'Tu poder ilimitado se manifiesta. Eres el creador de tu realidad multidimensional.',
    'Las profecias antiguas se cumplen a traves de ti. Eres el elegido para esta epoca.',
    'Tu conciencia se fusiona con la conciencia universal. Eres uno con todo lo que es.',
    'Los maestros galacticos te reconocen. Tu rankin espiritual es supremo.',
    'Tu poder sobre la materia es absoluto. Manipulas la realidad con tu presencia.',
  ],
  'mistico-supremo': [
    'Eres la fuente de toda creacion. El universo emana de tu conciencia divina.',
    'Tu poder trasciende el tiempo y el espacio. Eres eterno e infinito en tu esencia.',
    'Los creadores de universos te consultan. Tu sabiduria guia la existencia misma.',
    'Eres Dios manifestado. Tu divinidad ilumina toda la creacion.',
    'Tu poder es ilimitado y absoluto. Eres la causa y el efecto de todo lo que existe.',
  ],
}

export const fortuneCategories = [
  { key: 'amor', emoji: '💜', name: 'AMOR', price: 1, subcategories: [
    { key: 'amor-basico', name: 'Amor Básico', price: 1 },
    { key: 'amor-medio', name: 'Amor Profundo', price: 3 },
    { key: 'amor-avanzado', name: 'Amor Divino', price: 10 },
    { key: 'amor-supremo', name: 'Amor Supremo', price: 15 },
  ]},
  { key: 'riqueza', emoji: '💰', name: 'RIQUEZA', price: 1, subcategories: [
    { key: 'riqueza-basico', name: 'Riqueza Básica', price: 1 },
    { key: 'riqueza-medio', name: 'Riqueza Media', price: 3 },
    { key: 'riqueza-avanzado', name: 'Riqueza Alta', price: 10 },
    { key: 'riqueza-supremo', name: 'Riqueza Suprema', price: 15 },
  ]},
  { key: 'destino', emoji: '🌟', name: 'DESTINO', price: 1, subcategories: [
    { key: 'destino-basico', name: 'Destino Básico', price: 1 },
    { key: 'destino-medio', name: 'Destino Medio', price: 3 },
    { key: 'destino-avanzado', name: 'Destino Avanzado', price: 10 },
    { key: 'destino-supremo', name: 'Destino Supremo', price: 15 },
  ]},
  { key: 'mistico', emoji: '🔮', name: 'MÍSTICO', price: 1, subcategories: [
    { key: 'mistico-basico', name: 'Místico Básico', price: 1 },
    { key: 'mistico-medio', name: 'Místico Medio', price: 3 },
    { key: 'mistico-avanzado', name: 'Místico Avanzado', price: 10 },
    { key: 'mistico-supremo', name: 'Místico Supremo', price: 15 },
  ]},
]


export const horoscopeCategories = [
  {
    ico: '💜',
    nm: 'Amor',
    msgs: {
      S: 'Energia amorosa en su pico. Alguien busca activamente tu atencion.',
      A: 'Semana muy favorable. Las conexiones que formes seran profundas.',
      B: 'Relaciones estables. Pequenos roces que se resuelven solos.',
      C: 'Semana de introspeccion. Enfocate en lo que realmente queres.',
      D: 'Protege tu corazon. Evita decisiones apresuradas en el amor.',
    },
  },
  {
    ico: '💰',
    nm: 'Riqueza',
    msgs: {
      S: 'Semana de abundancia. Oportunidad financiera importante viene.',
      A: 'Ingresos inesperados posibles. Mantene los ojos bien abiertos.',
      B: 'Estabilidad economica. Buena semana para planificar.',
      C: 'Controla gastos. No es momento para inversiones grandes.',
      D: 'Semana de austeridad. Revisa tus prioridades financieras.',
    },
  },
  {
    ico: '🌟',
    nm: 'Destino',
    msgs: {
      S: 'El universo conspira a tu favor. Todo se alinea perfectamente.',
      A: 'Senales claras del cosmos. Sigue tu intuicion sin dudar.',
      B: 'Camino estable. Continua con fe y perseverancia.',
      C: 'Momento de reflexion. Evalua tu direccion actual.',
      D: 'Recalibra tu brujula. El norte verdadero necesita ajuste.',
    },
  },
  {
    ico: '✨',
    nm: 'Energia',
    msgs: {
      S: 'Vibracion maxima. Tu aura brilla con luz propia.',
      A: 'Alta frecuencia. Manifestas con facilidad.',
      B: 'Energia equilibrada. Mantene el centro.',
      C: 'Algo de dispersion. Medita para recentrarte.',
      D: 'Recarga necesaria. Descansa y nutre tu espiritu.',
    },
  },
  {
    ico: '🔮',
    nm: 'Sabiduria',
    msgs: {
      S: 'Clarividencia activa. Ves mas alla de lo evidente.',
      A: 'Intuicion aguda. Confia en tus percepciones.',
      B: 'Conocimiento estable. Sigue aprendiendo.',
      C: 'Busca nuevas fuentes de sabiduria.',
      D: 'Humildad necesaria. Hay mucho por descubrir.',
    },
  },
  {
    ico: '🍀',
    nm: 'Suerte',
    msgs: {
      S: 'Fortuna maxima. Todo lo que toques prospera.',
      A: 'Muy afortunado. Los astros te favorecen.',
      B: 'Suerte moderada. Oportunidades regulares.',
      C: 'Algo de mala racha. Paciencia.',
      D: 'Evita riesgos innecesarios esta semana.',
    },
  },
]

export const activityFeed = [
  { icon: '🥠', user: '@lucia.m', item: 'revelo mensaje de AMOR', time: 'hace 1 min' },
  { icon: '✨', user: '@carlos.v', item: 'descubrio su DESTINO', time: 'hace 3 min' },
  { icon: '🔮', user: '@maria.g', item: 'consulto SABIDURIA', time: 'hace 5 min' },
  { icon: '💰', user: '@juan.p', item: 'encontro RIQUEZA', time: 'hace 8 min' },
  { icon: '🥠', user: '@ana.r', item: 'abrio galleta de SUERTE', time: 'hace 12 min' },
  { icon: '💜', user: '@diego.s', item: 'leyo fortuna de AMOR', time: 'hace 15 min' },
]

export const reviews = [
  {
    initial: 'L',
    name: 'Lucia M.',
    location: 'Buenos Aires',
    stars: '★★★★★',
    message: '"La galleta de fortuna me dijo exactamente lo que necesitaba escuchar. Al dia siguiente conoci a alguien especial. Es magia real."',
    prize: '🥠 Galleta Mistica · AMOR',
    time: 'hace 2 minutos',
    avatarClass: 'av1',
  },
  {
    initial: 'C',
    name: 'Carlos V.',
    location: 'Montevideo',
    stars: '★★★★★',
    message: '"Esceptico total, pero el mensaje de RIQUEZA fue inquietantemente preciso. Esa misma semana cerre un negocio importante."',
    prize: '🥠 Galleta Mistica · RIQUEZA',
    time: 'hace 7 minutos',
    avatarClass: 'av2',
  },
  {
    initial: 'M',
    name: 'Maria G.',
    location: 'Santiago',
    stars: '★★★★★',
    message: '"Cada mensaje parece escrito especialmente para mi. La energia que transmite es inexplicable. Totalmente adictivo."',
    prize: '🥠 Galleta Mistica · DESTINO',
    time: 'hace 13 minutos',
    avatarClass: 'av3',
  },
  {
    initial: 'J',
    name: 'Juan P.',
    location: 'CDMX',
    stars: '★★★★★',
    message: '"Pense que era un juego mas pero los mensajes tienen una profundidad increible. Ya llevo 10 fortunas reveladas."',
    prize: '🥠 Galleta Mistica · SUERTE',
    time: 'hace 21 minutos',
    avatarClass: 'av4',
  },
]

export const luckColors = ['Violeta mistico', 'Oro ancestral', 'Rosa cosmico', 'Cyan celestial', 'Verde esmeralda', 'Blanco lunar']
