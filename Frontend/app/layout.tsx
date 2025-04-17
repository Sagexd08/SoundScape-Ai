'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { NetworkProvider } from '@/components/network-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

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
        <meta name="description" content="Your app description" />
        <title>Your App</title>
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NetworkProvider>
              {children}
              <Toaster position="bottom-right" />
            </NetworkProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}