"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

// Main component that only returns Suspense wrapper
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold mb-4">Loading</h1>
        <p>Please wait while we process your authentication...</p>
      </div>
    </div>
  )
}

// Component with the actual auth logic, wrapped in Suspense
function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract the code from the URL
    const code = searchParams.get("code")

    // If there's no code, something went wrong
    if (!code) {
      setError("No code provided in the callback URL")
      return
    }

    // Exchange the code for a session
    const handleAuthCallback = async () => {
      try {
        // This will automatically handle the token exchange
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          throw error
        }

        // Redirect to dashboard on success
        router.push("/dashboard")
      } catch (err: any) {
        console.error("Error during auth callback:", err)
        setError(err.message || "An error occurred during authentication")

        // Redirect to login after a delay if there's an error
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="w-full max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
            <p className="mb-4">{error}</p>
            <p>Redirecting you to the login page...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-4">Completing Authentication</h1>
            <p>Please wait while we sign you in...</p>
          </>
        )}
      </div>
    </div>
  )
}
