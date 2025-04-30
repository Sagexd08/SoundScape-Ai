'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { NetworkProvider } from '@/components/network-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { GlobalErrorHandler } from '@/components/global-error-handler'
// import { AuthProvider } from '@/components/auth/auth-provider' // Remove static import
import { useEffect } from 'react'
import dynamic from 'next/dynamic' // Import dynamic

// Dynamically import AuthProvider, disable SSR
const DynamicAuthProvider = dynamic(
  () => import('@/components/auth/auth-provider').then((mod) => mod.AuthProvider),
  { ssr: false } // Ensure it only renders on the client
)

export default function ClientLayout({
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
            {/* Use the dynamically imported provider */}
            <DynamicAuthProvider>
              {children}
              <Toaster position="bottom-right" />
            </DynamicAuthProvider>
          </NetworkProvider>
        </ThemeProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  )
}