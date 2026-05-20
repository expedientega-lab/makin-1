import type { Metadata, Viewport } from 'next'
import { Cinzel, Cinzel_Decorative, Share_Tech_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

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
  description: 'Descubre tu fortuna y gana premios digitales de alto valor. $1,000 USD, Bitcoin, Bot de Trading, Caja Misteriosa y mas. Tu destino te espera.',
  keywords: ['mystika', 'fortuna', 'premios digitales', 'bitcoin', 'bot trading', 'caja misteriosa'],
}

export const viewport: Viewport = {
  themeColor: '#0a0612',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${cinzel.variable} ${cinzelDecorative.variable} ${shareTechMono.variable} bg-[var(--bg0)]`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
