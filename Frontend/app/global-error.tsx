'use client'

import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'

// Global error page for the Next.js app router
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950 text-white relative overflow-hidden">
          {/* Static background for server-side rendering */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/40 to-black">
            <div className="absolute inset-0 opacity-20 mix-blend-soft-light"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <div className="max-w-md w-full p-6 bg-black/60 backdrop-blur-md rounded-lg border border-gray-800 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 text-red-400">
                  <RefreshCcw size={28} />
                </div>
                
                <h2 className="text-2xl font-bold mb-2 text-center">Something went wrong</h2>
                
                <p className="text-gray-400 mb-6 text-center">
                  We're sorry for the inconvenience. Please try again.
                </p>
                
                <div className="flex justify-center">
                  <Button
                    onClick={() => reset()}
                    className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <RefreshCcw size={16} />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
