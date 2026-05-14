import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import StatusBanner from './components/StatusBanner'

export const metadata: Metadata = {
  title: 'ALE — The Brewery',
  description: 'Brewmaster dashboard for the Authenticity Logic Engine',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#E8A020" />
      </head>
      <body className="min-h-screen font-serif">
        <StatusBanner />
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}</Script>
      </body>
    </html>
  )
}
