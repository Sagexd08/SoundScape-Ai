"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { GoogleButton } from "@/components/auth/google-button"
import Link from "next/link"
import SimpleBackgroundLayout from "@/components/layouts/SimpleBackgroundLayout"

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

function RegisterForm() {
  const { user, signUp, error, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Redirect to home page if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {}

    if (!formData.displayName.trim()) {
      errors.displayName = "Name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await signUp(formData.email, formData.password, {
        display_name: formData.displayName
      })
      setRegistrationSuccess(true)
    } catch (err) {
      console.error("Registration error:", err)
    }
  }

  return (
    <SimpleBackgroundLayout>
      <div className="min-h-screen">
        {/* Navbar removed */}

        <div className="container mx-auto px-4 py-12 flex flex-col items-center">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Join SoundScape AI
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Create your account and start exploring AI-powered audio environments
            </p>

            <Card className="w-full bg-black/60 backdrop-blur-md border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">Create an Account</CardTitle>
                <CardDescription className="text-center">
                  Sign up to access all features
                </CardDescription>
              </CardHeader>

              {registrationSuccess ? (
                <CardContent className="space-y-4">
                  <Alert className="bg-green-950 border-green-800">
                    <AlertDescription className="text-green-300">
                      Registration successful! Please check your email to verify your account.
                    </AlertDescription>
                  </Alert>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => router.push('/login')}
                  >
                    Go to Login
                  </Button>
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
                        text="Sign up with Google"
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
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input
                          id="displayName"
                          name="displayName"
                          placeholder="Your name"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="bg-gray-950 border-gray-800"
                        />
                        {formErrors.displayName && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.displayName}</p>
                        )}
                      </div>

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
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="bg-gray-950 border-gray-800"
                        />
                        {formErrors.password && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Password must be at least 6 characters long
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="bg-gray-950 border-gray-800"
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-4 pt-0">
                    <p className="text-sm text-gray-400 text-center">
                      Already have an account?{' '}
                      <Link href="/login" className="text-indigo-400 hover:underline">
                        Sign in
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      By signing up, you agree to our{' '}
                      <Link href="/terms" className="text-indigo-400 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-indigo-400 hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </CardFooter>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </SimpleBackgroundLayout>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-indigo-500 text-2xl animate-pulse">Loading...</div>
    </div>}>
      <RegisterForm />
    </Suspense>
  )
}
