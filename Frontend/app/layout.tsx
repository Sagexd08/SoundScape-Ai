'use client'

import './globals.css'
import { Inter, Montserrat } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { NetworkProvider } from '@/components/network-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { AuthProvider } from '@/components/auth/auth-provider'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Track and log any client-side navigation errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Client-side error:', event.error)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="AI-powered audio environments that adapt to your surroundings and mood in real-time" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <title>SoundScape AI</title>
      </head>
      <body className={`${inter.className} ${montserrat.variable}`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            storageKey="soundscape-theme"
          >
            <NetworkProvider>
              <AuthProvider>
                {children}
                <Toaster position="bottom-right" />
              </AuthProvider>
            </NetworkProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}