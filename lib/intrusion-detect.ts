/** Teclas de extracción / inspección no cubiertas por DevTools básico. */

export function isExtractionKeyboardEvent(e: KeyboardEvent): boolean {
  const key = e.key?.toLowerCase() ?? ''

  if (e.ctrlKey && !e.shiftKey && !e.altKey && ['u', 's', 'p'].includes(key)) {
    return true
  }

  if (e.metaKey && !e.shiftKey && key === 's') {
    return true
  }

  if (e.ctrlKey && e.shiftKey && ['k', 'e', 'c'].includes(key)) {
    return true
  }

  if (e.metaKey && e.altKey && ['u', 'i'].includes(key)) {
    return true
  }

  return false
}

export function isDevToolsKeyboardEvent(e: KeyboardEvent): boolean {
  const key = e.key?.toLowerCase() ?? ''
  return (
    key === 'f12' ||
    (e.ctrlKey &&
      e.shiftKey &&
      (key === 'i' || key === 'j' || key === 'c')) ||
    (e.metaKey && e.altKey && key === 'i')
  )
}

/** Bots / Selenium / Puppeteer headless. */
export function isAutomatedBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { webdriver?: boolean }
  if (nav.webdriver) return true
  if (/HeadlessChrome|PhantomJS|SlimerJS|Puppeteer|Playwright/i.test(navigator.userAgent)) {
    return true
  }
  return false
}
