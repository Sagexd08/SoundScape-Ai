'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

// Global error page for the Next.js app router
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App router error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We're sorry, but we encountered an error while loading this page.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => reset()}
            variant="default"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go to homepage
          </Button>
        </div>
      </div>
    </div>
  )
}