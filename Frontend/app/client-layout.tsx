'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { NetworkProvider } from '@/components/network-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { GlobalErrorHandler } from '@/components/global-error-handler'
import { AuthProvider } from '@/components/auth/auth-provider'
import { useEffect, useState } from 'react'
import { ClientOnly } from '@/components/client-only'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use useState to ensure consistent hook count between server and client renders
  // This helps prevent React Error #310 by maintaining the same hook call sequence
  const [mounted, setMounted] = useState(false)

  // Track and log any client-side navigation errors
  useEffect(() => {
    // Set mounted to true on client-side
    setMounted(true)

    const handleError = (event: ErrorEvent) => {
      console.error('Client-side error:', event.error)
    }

    window.addEventListener('error', handleError)
    return () => {
      window.removeEventListener('error', handleError)
      setMounted(false)
    }
  }, [])

  return (
    <ErrorBoundary>
      <GlobalErrorHandler>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="soundscape-theme"
        >
          <NetworkProvider>
            {/*
              Use ClientOnly component which handles client-side only rendering properly
              This prevents React Error #310 by ensuring consistent hook execution
            */}
            <ClientOnly fallback={
              // Simple fallback for server-side rendering
              <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-t-2 border-indigo-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg">Loading application...</p>
                </div>
              </div>
            }>
              {/* Only render the full app when mounted on client-side */}
              <AuthProvider>
                {children}
                <Toaster position="bottom-right" />
              </AuthProvider>
            </ClientOnly>
          </NetworkProvider>
        </ThemeProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  )
}