import type { Metadata } from 'next'
import { Montserrat, Rajdhani } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
})

const rajdhani = Rajdhani({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Gran Turismo Taxi - Réservation à Marseille',
  description: 'Service de taxi premium à Marseille. Réservez votre course en ligne 24/7.',
  keywords: ['taxi', 'marseille', 'réservation', 'gran turismo', 'transport', 'vtc'],
  openGraph: {
    title: 'Gran Turismo Taxi - Service Premium à Marseille',
    description: 'Réservez votre taxi en ligne 24/7 à Marseille',
    type: 'website',
    locale: 'fr_FR',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gran Turismo Taxi - Service Premium à Marseille',
    description: 'Réservez votre taxi en ligne 24/7 à Marseille',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/logo.png" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${montserrat.variable} ${rajdhani.variable} font-sans`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
