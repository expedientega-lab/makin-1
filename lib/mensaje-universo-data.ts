export type UniversalResponse = {
  title: string
  message: string
  extra: string
}

export const UNIVERSAL_RESPONSES: UniversalResponse[] = [
  {
    title: "✨ El Universo te escuchó",
    message:
      "Tu deseo fue recibido por el cosmos. Las fuerzas del universo ya están en movimiento para manifestar lo que pediste. Confía en el proceso y permanece atento a las señales.",
    extra: "Las mejores cosas llegan cuando menos las esperas. Tu momento está cerca.",
  },
  {
    title: "🌟 Mensaje enviado a las estrellas",
    message:
      "Las constelaciones registraron tu intención. Cuando el corazón habla con autenticidad, el universo conspira para hacerlo realidad. Tu energía ya está atrayendo lo que mereces.",
    extra: "Todo lo que deseas con convicción, el universo trabaja para entregártelo.",
  },
  {
    title: "💫 Tu vibración fue captada",
    message:
      "El universo opera en frecuencias, y la tuya acaba de resonar con fuerza. Lo que sembraste hoy en el cosmos germina en silencio y florecerá en el momento perfecto.",
    extra: "Sigue pensando en positivo. Tu energía es tu mayor imán.",
  },
  {
    title: "🔮 Portal abierto",
    message:
      "Tu mensaje cruzó el velo entre el mundo visible e invisible. Los maestros del destino tomaron nota de tu intención. Prepárate: los cambios que buscas ya comenzaron.",
    extra: "El primer paso siempre es declarar lo que querés. Ya lo diste.",
  },
  {
    title: "🌙 La Luna recibió tu mensaje",
    message:
      "En la quietud del cosmos, tu voz fue escuchada. La Luna, guardiana de los deseos más profundos, lleva tu mensaje a los astros. Lo que pediste ya está en camino.",
    extra: "Confía, descansa y permite que el universo haga su trabajo.",
  },
  {
    title: "💜 El cosmos responde",
    message:
      "Cada deseo genuino crea ondas en el universo. Las tuyas ya viajan hacia su destino. No es casualidad que estés aquí hoy. El timing es perfecto.",
    extra: "Mereces todo lo bueno que está por llegar. El universo lo sabe.",
  },
  {
    title: "⭐ Registrado en las estrellas",
    message:
      "Tu intención quedó grabada en la energía del universo. Ahora el cosmos tiene una misión: hacer que suceda. Tu única tarea es creer que es posible. Porque lo es.",
    extra: "La fe mueve montañas. Tu mensaje ya movió las primeras.",
  },
  {
    title: "🌌 Mensaje en el infinito",
    message:
      "El universo infinito recibió tu petición y la amplificó a través de las galaxias. Lo que deseas ya existe en algún plano de la realidad. Solo es cuestión de tiempo que llegue al tuyo.",
    extra: "El universo nunca dice nunca. Solo dice: en el momento correcto.",
  },
]

export function pickUniversalResponse(): UniversalResponse {
  const idx = Math.floor(Math.random() * UNIVERSAL_RESPONSES.length)
  return UNIVERSAL_RESPONSES[idx] ?? UNIVERSAL_RESPONSES[0]
}
