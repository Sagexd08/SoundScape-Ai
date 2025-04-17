'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SimpleHeroBackground from '@/components/three/SimpleHeroBackground'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <SimpleHeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

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
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
