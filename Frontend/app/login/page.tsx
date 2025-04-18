"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { GoogleButton } from "@/components/auth/google-button"
import Link from "next/link"
import Navbar from "@/components/navbar"
import SimpleBackgroundLayout from "@/components/layouts/SimpleBackgroundLayout"

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const { user, signIn, resetPassword, error, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Redirect to home page if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Handle password reset flow
    if (isPasswordReset) {
      await resetPassword(formData.email)
      setResetSent(true)
      return
    }

    // Handle login
    await signIn(formData.email, formData.password)
  }

  const togglePasswordReset = () => {
    setIsPasswordReset(!isPasswordReset)
    setResetSent(false)
  }

  return (
    <SimpleBackgroundLayout>
      <div className="min-h-screen">
        <Navbar />

        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign in to your SoundScape AI account
            </p>

            <Card className="w-full bg-black/60 backdrop-blur-md border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                  Access your personalized audio environments
                </CardDescription>
              </CardHeader>

              {isPasswordReset ? (
                <CardContent className="space-y-4">
                  {resetSent && (
                    <Alert className="bg-green-950 border-green-800">
                      <AlertDescription className="text-green-300">
                        If an account exists with that email, we've sent password reset instructions.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="bg-red-950 border-red-900">
                      <AlertDescription className="text-red-300">{error.message}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-gray-950 border-gray-800"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={togglePasswordReset}
                    >
                      Back to Login
                    </Button>
                  </form>
                </CardContent>
              ) : (
                <>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive" className="bg-red-950 border-red-900">
                        <AlertDescription className="text-red-300">{error.message}</AlertDescription>
                      </Alert>
                    )}

                    {/* Google Sign-in Button */}
                    <div className="space-y-2">
                      <GoogleButton
                        text="Sign in with Google"
                        className="bg-white text-black hover:bg-gray-100"
                        variant="outline"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full border-gray-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-gray-950 border-gray-800"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 text-xs text-indigo-400 hover:text-indigo-300"
                            onClick={togglePasswordReset}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="bg-gray-950 border-gray-800"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-4 pt-0">
                    <p className="text-sm text-gray-400 text-center">
                      Don't have an account?{' '}
                      <Link href="/register" className="text-indigo-400 hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </CardFooter>
                </>
              )}
            </Card>

            <div className="mt-8 text-center text-sm text-gray-400">
              <p>By signing in, you agree to our <Link href="/terms" className="text-indigo-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </SimpleBackgroundLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-indigo-500 text-2xl animate-pulse">Loading...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  )
}
