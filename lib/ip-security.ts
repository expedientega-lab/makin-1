/** IPs locales / LAN y lista blanca del dueño — no se bloquean. */

function isPrivateLanIpv4(ip: string): boolean {
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(ip)) return true
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return true
  const m = ip.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/)
  if (m) {
    const second = Number(m[1])
    return second >= 16 && second <= 31
  }
  return false
}

export function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip || ip === 'desconocida') return false

  let normalized = ip.trim().toLowerCase()
  if (normalized.startsWith('::ffff:')) {
    normalized = normalized.slice(7)
  }

  if (
    normalized === '127.0.0.1' ||
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized === '0:0:0:0:0:0:0:1'
  ) {
    return true
  }

  return isPrivateLanIpv4(normalized)
}

function ownerWhitelist(): string[] {
  const raw =
    process.env.SECURITY_IP_WHITELIST?.trim() ||
    process.env.MYSTIKA_OWNER_IP?.trim() ||
    ''
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

/** True = mostrar susto pero no bloquear (local en dev o IP del dueño en env). */
export function isIpBlockExempt(ip: string): boolean {
  if (ownerWhitelist().includes(ip)) return true
  if (process.env.NODE_ENV === 'production') return false
  // `next dev` en localhost suele no enviar IP real → "desconocida"
  if (!ip || ip === 'desconocida') return true
  return isPrivateOrLocalIp(ip)
}
