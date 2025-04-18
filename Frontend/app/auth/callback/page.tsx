'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session } = useAuth()
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (session) {
      router.push('/dashboard')
    }
    
    // Process OAuth callback
    const handleCallback = async () => {
      // Check for error in URL - this happens if user cancels OAuth flow
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (error) {
        console.error('OAuth error:', error, errorDescription)
        router.push('/login?error=' + encodeURIComponent(errorDescription || 'Authentication failed'))
        return
      }
      
      try {
        // No error, proceed with callback processing
        // Authentication is handled by the auth provider, we just need to redirect the user
        router.push('/dashboard')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=Authentication failed')
      }
    }
    
    handleCallback()
  }, [router, searchParams, session])
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-4 text-2xl font-bold text-white">Completing login...</div>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}