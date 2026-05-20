import 'server-only'

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim()
  return v?.length ? v : undefined
}

/** Mismo valor público si no definís servidor aparte — evita desajustes. */
function getPaypalClientId(): string | undefined {
  return trimEnv('PAYPAL_CLIENT_ID') || trimEnv('NEXT_PUBLIC_PAYPAL_CLIENT_ID')
}

function getPaypalSecret(): string | undefined {
  return trimEnv('PAYPAL_SECRET')
}

function getPublicPaypalClientId(): string | undefined {
  return trimEnv('NEXT_PUBLIC_PAYPAL_CLIENT_ID')
}

/**
 * Live: https://api-m.paypal.com · Sandbox: https://api-m.sandbox.paypal.com
 * - En `next dev` usamos Sandbox por defecto (credenciales típicas de prueba).
 * - Producción usa Live salvo que pongas PAYPAL_SANDBOX=true (p. ej. preview con Sandbox).
 * - Local con credenciales LIVE: PAYPAL_LIVE_DEV=true o PAYPAL_SANDBOX=false.
 */
function getPaypalBaseUrl(): string {
  const custom = trimEnv('PAYPAL_BASE_URL')
  if (custom) return custom

  const explicitSandbox =
    process.env.PAYPAL_SANDBOX === 'true' || process.env.PAYPAL_ENV === 'sandbox'
  const explicitLive =
    process.env.PAYPAL_SANDBOX === 'false' ||
    process.env.PAYPAL_ENV === 'live' ||
    process.env.PAYPAL_LIVE_DEV === 'true'

  if (explicitSandbox) return 'https://api-m.sandbox.paypal.com'
  if (explicitLive || process.env.NODE_ENV === 'production') {
    return 'https://api-m.paypal.com'
  }
  return 'https://api-m.sandbox.paypal.com'
}

/** Siempre resolver en tiempo de ejecución: no congelar al importar el módulo (evita mezclas build/dev/Turbopack). */
function paypalApiBase(): string {
  return getPaypalBaseUrl()
}

export function getPaypalRuntimeConfig() {
  const apiBase = paypalApiBase()
  const mode = apiBase.includes('sandbox') ? 'sandbox' : 'live'
  const clientId = getPaypalClientId()
  const publicClientId = getPublicPaypalClientId()
  return {
    mode,
    apiBase,
    hasClientId: Boolean(clientId),
    hasSecret: Boolean(getPaypalSecret()),
    clientIdMatchesPublic: Boolean(clientId && publicClientId && clientId === publicClientId),
    nodeEnv: process.env.NODE_ENV || 'unknown',
    explicitSandbox: process.env.PAYPAL_SANDBOX === 'true' || process.env.PAYPAL_ENV === 'sandbox',
    explicitLive:
      process.env.PAYPAL_SANDBOX === 'false' ||
      process.env.PAYPAL_ENV === 'live' ||
      process.env.PAYPAL_LIVE_DEV === 'true',
  } as const
}

function assertPaypalEnv() {
  const id = getPaypalClientId()
  const secret = getPaypalSecret()
  if (!id || !secret) {
    throw new Error('Faltan PAYPAL_CLIENT_ID (o NEXT_PUBLIC_PAYPAL_CLIENT_ID) o PAYPAL_SECRET en el servidor')
  }
  const publicId = getPublicPaypalClientId()
  if (publicId && publicId !== id) {
    throw new Error(
      'PAYPAL_CLIENT_ID y NEXT_PUBLIC_PAYPAL_CLIENT_ID no coinciden. Deben ser el mismo Client ID del entorno activo.',
    )
  }
}

export async function getPaypalAccessToken(): Promise<string> {
  assertPaypalEnv()
  const clientId = getPaypalClientId()!
  const secret = getPaypalSecret()!
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64')
  const requestToken = async (baseUrl: string): Promise<{ access_token: string }> => {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(err)
    }
    return (await response.json()) as { access_token: string }
  }

  const primaryBase = paypalApiBase()
  try {
    const primary = await requestToken(primaryBase)
    return primary.access_token
  } catch (primaryError) {
    const err = primaryError instanceof Error ? primaryError.message : String(primaryError)
    const lower = err.toLowerCase()
    const invalidClient =
      lower.includes('invalid_client') ||
      lower.includes('client authentication failed') ||
      lower.includes('unauthorized')

    // En local, si forzaron LIVE pero pusieron credenciales Sandbox (o viceversa), probamos la otra API.
    const allowDevFallback = process.env.NODE_ENV === 'development' && process.env.PAYPAL_AUTO_FALLBACK !== 'false'
    if (invalidClient && allowDevFallback) {
      const fallbackBase = primaryBase.includes('sandbox')
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
      try {
        const fallback = await requestToken(fallbackBase)
        console.warn(
          `[paypal] INVALID_CLIENT en ${primaryBase}; se usó fallback ${fallbackBase} (solo desarrollo). ` +
            'Revisá que Client ID/Secret sean del mismo entorno.',
        )
        return fallback.access_token
      } catch {
        // Si también falla fallback, seguimos con error detallado original.
      }
    }

    const usingSandboxApi = primaryBase.includes('sandbox')
    let hint = ''
    if (invalidClient) {
      hint = usingSandboxApi
        ? process.env.NODE_ENV === 'development'
          ? ' Revisá PAYPAL_SECRET (misma app Sandbox en developer.paypal.com, sin espacios). Si en realidad usás claves LIVE, agregá PAYPAL_LIVE_DEV=true y reiniciá el servidor.'
          : ' Revisá PAYPAL_SECRET (Sandbox) sin espacios; debe ser pareja exacta del Client ID de la app Sandbox.'
        : process.env.NODE_ENV === 'production'
          ? ' Estás usando la API LIVE: el Client ID y Secret tienen que ser los de developer.paypal.com con Sandbox DESACTIVADO. Si tus claves son solo de Sandbox, poné PAYPAL_SANDBOX=true en Vercel (o localhost con PAYPAL_LIVE_DEV sin Live real falla igual). Regenerá el Secret Live si sigue igual.'
          : ` Estás usando la API LIVE (${primaryBase}): copiá Client ID + Secret desde la app con Sandbox APAGADO. Si ese Client ID sólo existe en Sandbox, quitá PAYPAL_LIVE_DEV o usá PAYPAL_SECRET de la pareja LIVE.`
    }
    throw new Error(`No se pudo obtener access token de PayPal: ${err}${hint}`)
  }
}

export async function createPaypalOrder(amount: number, description: string, productId?: string) {
  const accessToken = await getPaypalAccessToken()
  const safeDescription = description.slice(0, 120)
  const apiBase = paypalApiBase()

  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: 'default',
          custom_id: productId ? productId.slice(0, 127) : undefined,
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
          description: safeDescription,
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Error creando orden PayPal: ${err}`)
  }

  return response.json()
}

export async function capturePaypalOrder(orderId: string) {
  const accessToken = await getPaypalAccessToken()
  const apiBase = paypalApiBase()
  const response = await fetch(`${apiBase}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Error capturando orden PayPal: ${err}`)
  }

  return response.json()
}

export async function generatePaypalClientToken() {
  const accessToken = await getPaypalAccessToken()
  const apiBase = paypalApiBase()
  const response = await fetch(`${apiBase}/v1/identity/generate-token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Error generando client token PayPal: ${err}`)
  }

  return response.json() as Promise<{ client_token: string }>
}
