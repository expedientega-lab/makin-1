import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'

export const MK_CLIENT_COOKIE = 'mk_client_id'

/** Cookie estable para relacionar cobros NOWPayments/PayPal con el cliente actual. */
export async function getOrCreateMkClientId(): Promise<string> {
  const cookieStore = await cookies()
  let clientId = cookieStore.get(MK_CLIENT_COOKIE)?.value
  if (!clientId) {
    clientId = randomUUID()
    cookieStore.set(MK_CLIENT_COOKIE, clientId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
    })
  }
  return clientId
}
