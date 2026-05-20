import { NextResponse } from 'next/server'
import { generatePaypalClientToken } from '@/lib/paypal-api'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const data = await generatePaypalClientToken()
    return NextResponse.json({ clientToken: data.client_token })
  } catch (error) {
    console.error('PayPal client token error:', error)
    return NextResponse.json({ error: 'No se pudo inicializar PayPal' }, { status: 500 })
  }
}
