import { NextResponse } from 'next/server'
import { generatePaypalClientToken } from '@/lib/paypal-api'
import { blockedIpResponse } from '@/lib/security-guard'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const blocked = await blockedIpResponse(req.headers)
  if (blocked) return blocked

  try {
    const data = await generatePaypalClientToken()
    return NextResponse.json({ clientToken: data.client_token })
  } catch (error) {
    console.error('PayPal client token error:', error)
    return NextResponse.json({ error: 'No se pudo inicializar PayPal' }, { status: 500 })
  }
}
