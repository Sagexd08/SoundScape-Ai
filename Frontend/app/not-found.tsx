import Link from 'next/link'
import { Button } from '@/components/ui/button'

// This is a server component version of the not-found page
// It doesn't use any client-side hooks to avoid build errors
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950 text-white relative overflow-hidden">
      {/* Static background for server-side rendering */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/40 to-black">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center relative">
          <div className="relative z-10 max-w-md w-full p-8 bg-black/60 backdrop-blur-md rounded-lg border border-gray-800 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              404
            </h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-gray-300 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">
                  Return Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go Back</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
