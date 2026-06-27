import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { isIpBlockExempt } from '@/lib/ip-security'
import { getPaypalAccessToken, getPaypalRuntimeConfig } from '@/lib/paypal-api'
import { blockedIpResponse } from '@/lib/security-guard'

export const runtime = 'nodejs'

type PaypalHealth = {
  ok: boolean
  mode: 'sandbox' | 'live'
  apiBase: string
  nodeEnv: string
  hasClientId: boolean
  hasSecret: boolean
  clientIdMatchesPublic: boolean
  tokenReachable: boolean
  hints: string[]
  error?: string
}

export async function GET(req: NextRequest) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  if (process.env.NODE_ENV === 'production' && !isIpBlockExempt(getClientIp(req.headers))) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  const cfg = getPaypalRuntimeConfig()
  const hints: string[] = []

  if (!cfg.hasClientId) hints.push('Falta PAYPAL_CLIENT_ID (o NEXT_PUBLIC_PAYPAL_CLIENT_ID).')
  if (!cfg.hasSecret) hints.push('Falta PAYPAL_SECRET.')
  if (!cfg.clientIdMatchesPublic) {
    hints.push('PAYPAL_CLIENT_ID y NEXT_PUBLIC_PAYPAL_CLIENT_ID deberían ser iguales.')
  }
  if (cfg.mode === 'live' && cfg.nodeEnv !== 'production') {
    hints.push('Estás probando en local contra LIVE: revisá que el Secret sea LIVE, no Sandbox.')
  }
  if (cfg.mode === 'sandbox' && cfg.nodeEnv === 'production') {
    hints.push('Producción está en Sandbox: válido para pruebas, no para cobro real.')
  }

  try {
    await getPaypalAccessToken()
    const response: PaypalHealth = {
      ok: true,
      mode: cfg.mode,
      apiBase: cfg.apiBase,
      nodeEnv: cfg.nodeEnv,
      hasClientId: cfg.hasClientId,
      hasSecret: cfg.hasSecret,
      clientIdMatchesPublic: cfg.clientIdMatchesPublic,
      tokenReachable: true,
      hints,
    }
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const response: PaypalHealth = {
      ok: false,
      mode: cfg.mode,
      apiBase: cfg.apiBase,
      nodeEnv: cfg.nodeEnv,
      hasClientId: cfg.hasClientId,
      hasSecret: cfg.hasSecret,
      clientIdMatchesPublic: cfg.clientIdMatchesPublic,
      tokenReachable: false,
      hints,
      error: message.length > 500 ? `${message.slice(0, 500)}...` : message,
    }
    return NextResponse.json(response, { status: 500 })
  }
}

