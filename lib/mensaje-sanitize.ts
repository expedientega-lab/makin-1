import { MENSAJE_MAX_LENGTH } from "@/lib/mensaje-constants"

/** Normaliza y valida el mensaje del usuario (solo en servidor). */
export function sanitizeMensajeUniverso(raw: unknown): string | null {
  if (typeof raw !== "string") return null

  let text = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()

  if (text.length < 1) return null
  if (text.length > MENSAJE_MAX_LENGTH) {
    text = text.slice(0, MENSAJE_MAX_LENGTH)
  }

  // Colapsar espacios excesivos sin borrar saltos de línea únicos
  text = text.replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n")

  if (text.length < 1) return null
  return text
}
