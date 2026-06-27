/** Atajos de captura de pantalla en PC (Windows / Mac / Linux). */

export function isScreenshotKeyboardEvent(e: KeyboardEvent): boolean {
  const key = e.key?.toLowerCase() ?? ''
  const code = e.code?.toLowerCase() ?? ''

  if (
    code === 'printscreen' ||
    key === 'printscreen' ||
    key === 'snapshot' ||
    key === 'prtsc'
  ) {
    return true
  }

  if (e.altKey && (code === 'printscreen' || key === 'printscreen')) {
    return true
  }

  if (e.metaKey && e.shiftKey) {
    if (['3', '4', '5', '6', 's'].includes(key)) return true
  }

  if (e.ctrlKey && e.shiftKey && key === 's') {
    return true
  }

  if ((e.metaKey || e.getModifierState?.('Meta')) && e.shiftKey && key === 's') {
    return true
  }

  return false
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

/** Android/iOS: flash breve al capturar — heurística agresiva solo en móvil. */
export function isLikelyMobileScreenshotBlink(hiddenMs: number): boolean {
  return hiddenMs >= 60 && hiddenMs <= 550
}

/** Pegaron una imagen (p. ej. captura recién hecha). */
export function pasteContainsImage(data: DataTransfer | null): boolean {
  if (!data?.items) return false
  for (const item of data.items) {
    if (item.type.startsWith('image/')) return true
  }
  return false
}
