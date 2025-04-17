"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Headphones, Settings, User, Heart, Clock, Plus } from "lucide-react"
import Navbar from "@/components/navbar"
import Link from "next/link"

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white">
      <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user.user_metadata?.display_name || user.email}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={() => signOut()} variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950">
              Sign Out
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="mr-2 h-5 w-5 text-indigo-400" />
                    Recent Tracks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">You haven't created any tracks yet.</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Create New Track
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Headphones className="mr-2 h-5 w-5 text-indigo-400" />
                    Listening Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Start listening to see your stats.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-indigo-600 text-indigo-400 hover:bg-indigo-950">
                    Explore Sounds
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-indigo-400" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Complete your profile to get personalized recommendations.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/profile" className="w-full">
                    <Button variant="outline" className="w-full border-indigo-600 text-indigo-400 hover:bg-indigo-950">
                      Edit Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with SoundScape AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 h-auto py-4 flex flex-col items-center justify-center">
                    <Music className="h-6 w-6 mb-2" />
                    <span>Create New Sound</span>
                  </Button>
                  <Button variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 h-auto py-4 flex flex-col items-center justify-center">
                    <Headphones className="h-6 w-6 mb-2" />
                    <span>Browse Library</span>
                  </Button>
                  <Button variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 h-auto py-4 flex flex-col items-center justify-center">
                    <Settings className="h-6 w-6 mb-2" />
                    <span>Customize Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Your Sound Library</CardTitle>
                <CardDescription>Manage your created and saved sounds</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 py-8 text-center">Your library is empty. Create or save sounds to see them here.</p>
              </CardContent>
              <CardFooter>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="mr-2 h-4 w-4" /> Create New Sound
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Your Favorites</CardTitle>
                <CardDescription>Sounds you've marked as favorites</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 py-8 text-center">You haven't added any favorites yet.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950">
                  <Heart className="mr-2 h-4 w-4" /> Browse Sounds
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Email</h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Profile</h3>
                  <Link href="/profile" className="text-indigo-400 hover:underline">Edit your profile</Link>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Password</h3>
                  <Link href="/reset-password" className="text-indigo-400 hover:underline">Change your password</Link>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => signOut()} variant="destructive">
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
