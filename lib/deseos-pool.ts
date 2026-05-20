export type Deseo = {
  icon: string
  area: string
  color: string
  glow: string
  message: string
}

const DESEOS_POOL = [
  {
    icon: '💜',
    area: 'AMOR',
    color: '#b388ff',
    glow: 'rgba(179,136,255,0.3)',
    messages: [
      'El amor que mereces ya está en camino hacia vos, {nombre}. Las personas correctas siempre llegan en el momento justo.',
      'Tu corazón tiene una capacidad enorme de dar y recibir amor, {nombre}. Algo hermoso se aproxima en ese terreno.',
      'El universo tiene reservado para vos, {nombre}, una conexión que va a sorprenderte por su profundidad y sinceridad.',
      'Alguien que te admira en silencio está a punto de dar el primer paso, {nombre}. Estate atento a las señales.',
    ],
  },
  {
    icon: '💰',
    area: 'PROSPERIDAD',
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.3)',
    messages: [
      'Una oportunidad económica se está alineando para vos, {nombre}. Mantené los ojos abiertos esta semana.',
      'Tu esfuerzo acumulado, {nombre}, está a punto de traducirse en resultados concretos. La abundancia te está buscando.',
      'El universo conspira para abrir nuevas fuentes de ingresos en tu vida, {nombre}. Confiá en el proceso.',
      'Algo que sembraste tiempo atrás, {nombre}, está próximo a florecer en forma de prosperidad inesperada.',
    ],
  },
  {
    icon: '⚡',
    area: 'ENERGÍA',
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.3)',
    messages: [
      'Tu energía vital está en ascenso, {nombre}. Es un momento ideal para comenzar lo que venías postergando.',
      'El cosmos está potenciando tu aura, {nombre}. Tu presencia tiene un impacto más grande del que imaginás.',
      'Atravesás un ciclo de renovación profunda, {nombre}. Todo lo viejo que ya no te sirve se está yendo para siempre.',
      'Tu vibración es alta hoy, {nombre}. Las personas y situaciones que se acerquen van a elevar tu vida.',
    ],
  },
  {
    icon: '🌟',
    area: 'DESTINO',
    color: '#00ff9d',
    glow: 'rgba(0,255,157,0.3)',
    messages: [
      'El camino que elegiste, {nombre}, es el correcto. Lo que parece demora es en realidad preparación para algo grande.',
      'Tu propósito de vida se está volviendo más claro, {nombre}. Escuchá tu intuición: te está guiando bien.',
      'Un cambio positivo que vas a valorar mucho está próximo a manifestarse en tu vida, {nombre}.',
      'Las piezas de tu historia, {nombre}, están encajando de una forma que pronto vas a poder ver con claridad total.',
    ],
  },
  {
    icon: '🧘',
    area: 'PAZ INTERIOR',
    color: '#ff6b9d',
    glow: 'rgba(255,107,157,0.3)',
    messages: [
      'Mereces descanso y tranquilidad, {nombre}. El universo te invita hoy a soltar lo que no podés controlar.',
      'Tu mente y tu cuerpo están pidiendo equilibrio, {nombre}. Escucharte a vos mismo es el primer paso a la paz.',
      'La serenidad que buscás, {nombre}, ya existe dentro tuyo. Hoy es un buen día para conectar con esa calma.',
      'Algo que te preocupaba va a resolverse mejor de lo que esperabas, {nombre}. Respirá profundo y confiá.',
    ],
  },
  {
    icon: '🔮',
    area: 'SABIDURÍA',
    color: '#b388ff',
    glow: 'rgba(179,136,255,0.3)',
    messages: [
      'Tu intuición es una herramienta poderosa, {nombre}. Esa sensación que tenes sobre algo importante... es correcta.',
      'Una revelación o aprendizaje clave llega a tu vida esta semana, {nombre}. Prestá atención a lo que aparezca.',
      'El universo te habla a través de las coincidencias, {nombre}. Los patrones que notaste tienen un mensaje.',
      'Tenés más sabiduría de la que te reconocés, {nombre}. Confiá en lo que ya sabés sin buscar validación externa.',
    ],
  },
  {
    icon: '🌱',
    area: 'CRECIMIENTO',
    color: '#00ff9d',
    glow: 'rgba(0,255,157,0.3)',
    messages: [
      'Estás en un momento de transformación real, {nombre}. Todo lo que viviste te preparó para lo que viene.',
      'El crecimiento que buscás, {nombre}, requiere exactamente lo que estás haciendo hoy. Seguí adelante.',
      'Las raíces que plantaste en momentos difíciles, {nombre}, están dando frutos que pronto vas a ver.',
      'Sos más fuerte de lo que creés, {nombre}. Cada desafío que superaste te dio algo que nadie puede quitarte.',
    ],
  },
  {
    icon: '🎯',
    area: 'LOGROS',
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.3)',
    messages: [
      'Una meta que parece lejana, {nombre}, está más cerca de lo que imaginas. Un paso más y vas a verlo.',
      'Tu dedicación no pasa desapercibida, {nombre}. El reconocimiento que mereces está llegando.',
      'El universo tiene preparado un logro para vos, {nombre}, que va a superar tus propias expectativas.',
      'Este es tu momento, {nombre}. Las condiciones se están alineando para que alcances lo que te propusiste.',
    ],
  },
] as const

export function pickThreeDeseos(name: string): Deseo[] {
  const shuffled = [...DESEOS_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map((d) => ({
    icon: d.icon,
    area: d.area,
    color: d.color,
    glow: d.glow,
    message: d.messages[Math.floor(Math.random() * d.messages.length)].replace(
      /\{nombre\}/g,
      name,
    ),
  }))
}
