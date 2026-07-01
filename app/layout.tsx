import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Cinzel, Cinzel_Decorative, Share_Tech_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { RenderKeepAlive } from '@/components/render-keep-alive'
import { BlockedCutoffFlow } from '@/components/security/blocked-cutoff-flow'
import { GuardianBot } from '@/components/security/guardian-bot'
import { getClientIp } from '@/lib/client-ip'
import { isIpBlocked } from '@/lib/ip-block-store'
import { isIpBlockExempt } from '@/lib/ip-security'
import './globals.css'

const guardianBotEnabled = process.env.ENABLE_GUARDIAN_BOT === 'true'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-tech',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MYSTIKA · Portal de Destino Digital',
  description:
    'Descubre tu fortuna y gana premios digitales de alto valor. $1,000 USD, Bitcoin, Bot de Trading, Caja Misteriosa y mas. Tu destino te espera.',
  keywords: ['mystika', 'fortuna', 'premios digitales', 'bitcoin', 'bot trading', 'caja misteriosa'],
}

export const viewport: Viewport = {
  themeColor: '#0a0612',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerStore = await headers()
  const clientIp = getClientIp(headerStore)
  const blocked = !isIpBlockExempt(clientIp) && (await isIpBlocked(clientIp))

  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${shareTechMono.variable} bg-[var(--bg0)]`}
    >
      <body className="font-sans antialiased">
        {blocked ? (
          <BlockedCutoffFlow ip={clientIp} />
        ) : (
          <>
            {children}
            <RenderKeepAlive />
            {guardianBotEnabled ? <GuardianBot /> : null}
          </>
        )}
        {!blocked && process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
