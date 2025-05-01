"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import SimpleBackgroundLayout from "@/components/layouts/SimpleBackgroundLayout"

function ProfileContent() {
  return (
    <SimpleBackgroundLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile Page</h1>
        <p>This is the profile page content.</p>
      </div>
    </SimpleBackgroundLayout>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}