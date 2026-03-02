import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'Cene Nepremičnin | Interaktivni zemljevid cen nepremičnin v Sloveniji',
  description: 'Raziskujte cene nepremičnin v Sloveniji na interaktivnem zemljevidu. Podatki o prodajah stanovanj, hiš in zemljišč od 2007 do danes.',
  metadataBase: new URL('https://cenenepremicnin.com'),
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  openGraph: {
    title: 'Cene Nepremičnin | Interaktivni zemljevid cen nepremičnin v Sloveniji',
    description: 'Raziskujte cene nepremičnin v Sloveniji na interaktivnem zemljevidu. Podatki o prodajah stanovanj, hiš in zemljišč od 2007 do danes.',
    url: 'https://cenenepremicnin.com',
    siteName: 'Cene Nepremičnin',
    locale: 'sl_SI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cene Nepremičnin | Interaktivni zemljevid cen nepremičnin v Sloveniji',
    description: 'Raziskujte cene nepremičnin v Sloveniji na interaktivnem zemljevidu.',
  },
  alternates: {
    canonical: 'https://cenenepremicnin.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sl">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
