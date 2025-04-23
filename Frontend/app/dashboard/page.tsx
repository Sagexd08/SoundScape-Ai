"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Headphones, Settings, User, Heart, Clock, Plus, Wand2, BarChart, Activity, Calendar, Zap, Sparkles, FileAudio, Download, Mic, Share2, PlusCircle, Play } from "lucide-react"
import Navbar from "@/components/navbar"
import Link from "next/link"
import SimpleBackgroundLayout from "@/components/layouts/SimpleBackgroundLayout"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [progressValue, setProgressValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTracks: 0,
    listeningTime: 0,
    aiGenerations: 0,
    favorites: 0,
    aiCredits: 10,
    storage: 0,
    apiCalls: 0
  });

  // Ref for chart animation
  const chartRef = useRef(null);

  // Simulate loading progress and data fetching
  useEffect(() => {
    // Simulate progress animation
    const progressTimer = setTimeout(() => setProgressValue(100), 500);

    // Simulate data loading
    const dataTimer = setTimeout(() => {
      setStats({
        totalTracks: 3,
        listeningTime: 2.5,
        aiGenerations: 5,
        favorites: 2,
        aiCredits: 8,
        storage: 0.2,
        apiCalls: 12
      });
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(dataTimer);
    };
  }, []);
  return (
    <ProtectedRoute>
      {user && (
        <SimpleBackgroundLayout>
          <div className="min-h-screen">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user.user_metadata?.display_name || user.email}</p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link href="/ai-studio">
              <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                AI Studio
              </Button>
            </Link>
            <Button onClick={() => signOut()} variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950">
              Sign Out
            </Button>
          </div>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>Library</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Tracks</p>
                        <h3 className="text-2xl font-bold mt-1 text-white">
                          {isLoading ? (
                            <span className="inline-block w-8 h-8 bg-gray-800 rounded animate-pulse"></span>
                          ) : stats.totalTracks}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
                        <Music className="h-6 w-6 text-indigo-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={progressValue} className="h-1 bg-gray-800" indicatorClassName="bg-indigo-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Listening Time</p>
                        <h3 className="text-2xl font-bold mt-1 text-white">
                          {isLoading ? (
                            <span className="inline-block w-8 h-8 bg-gray-800 rounded animate-pulse"></span>
                          ) : `${stats.listeningTime}h`}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={progressValue} className="h-1 bg-gray-800" indicatorClassName="bg-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">AI Generations</p>
                        <h3 className="text-2xl font-bold mt-1 text-white">
                          {isLoading ? (
                            <span className="inline-block w-8 h-8 bg-gray-800 rounded animate-pulse"></span>
                          ) : stats.aiGenerations}
                        </h3>
                        {!isLoading && stats.aiGenerations > 0 && (
                          <Badge className="mt-1 bg-blue-600 text-white">New</Badge>
                        )}
                      </div>
                      <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Wand2 className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={progressValue} className="h-1 bg-gray-800" indicatorClassName="bg-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Favorites</p>
                        <h3 className="text-2xl font-bold mt-1 text-white">
                          {isLoading ? (
                            <span className="inline-block w-8 h-8 bg-gray-800 rounded animate-pulse"></span>
                          ) : stats.favorites}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-pink-500/10 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-pink-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={progressValue} className="h-1 bg-gray-800" indicatorClassName="bg-pink-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="mr-2 h-5 w-5 text-indigo-400" />
                    Recent Tracks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3 py-2">
                      <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
                    </div>
                  ) : stats.totalTracks > 0 ? (
                    <div className="space-y-3">
                      {[...Array(Math.min(3, stats.totalTracks))].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-indigo-900/50 flex items-center justify-center">
                              <FileAudio className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Track {i + 1}</p>
                              <p className="text-xs text-gray-400">AI Generated • {new Date().toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Play</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Download</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">You haven't created any tracks yet.</p>
                  )}
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="col-span-1 md:col-span-3"
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Get started with SoundScape AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/ai-studio" className="w-full">
                      <Button className="bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-auto py-4 flex flex-col items-center justify-center w-full shadow-lg shadow-indigo-900/20 border-0">
                        <Wand2 className="h-6 w-6 mb-2" />
                        <span>AI Studio</span>
                      </Button>
                    </Link>
                    <Button className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-auto py-4 flex flex-col items-center justify-center w-full shadow-lg shadow-blue-900/20 border-0">
                      <Mic className="h-6 w-6 mb-2" />
                      <span>Voice to Music</span>
                    </Button>
                    <Button className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-auto py-4 flex flex-col items-center justify-center w-full shadow-lg shadow-purple-900/20 border-0">
                      <Sparkles className="h-6 w-6 mb-2" />
                      <span>AI Remix</span>
                    </Button>
                    <Link href="/settings" className="w-full">
                      <Button variant="outline" className="border-indigo-600/50 text-indigo-400 hover:bg-indigo-950 h-auto py-4 flex flex-col items-center justify-center w-full">
                        <Settings className="h-6 w-6 mb-2" />
                        <span>Settings</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="col-span-1 md:col-span-2"
            >
              <Card className="bg-gray-900 border-gray-800 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 border-b border-gray-800 pb-4">
                      <div className="bg-indigo-500/10 p-2 rounded-full">
                        <Wand2 className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Welcome to SoundScape AI</p>
                        <p className="text-xs text-gray-400">Get started by exploring the AI Studio</p>
                        <p className="text-xs text-gray-500 mt-1">Just now</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-800 p-2 rounded-full">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Account Created</p>
                        <p className="text-xs text-gray-400">Your account has been successfully set up</p>
                        <p className="text-xs text-gray-500 mt-1">Today</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="col-span-1"
            >
              <Card className="bg-gray-900 border-gray-800 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-indigo-400" />
                    Usage Stats
                  </CardTitle>
                  <CardDescription>Your platform usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray-400">AI Credits</p>
                        <p className="text-xs font-medium text-white">{stats.aiCredits}/10</p>
                      </div>
                      <Progress value={stats.aiCredits * 10} className="h-1 bg-gray-800" indicatorClassName="bg-indigo-500" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray-400">Storage</p>
                        <p className="text-xs font-medium text-white">{stats.storage.toFixed(1)}/1GB</p>
                      </div>
                      <Progress value={stats.storage * 100} className="h-1 bg-gray-800" indicatorClassName="bg-purple-500" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray-400">API Calls</p>
                        <p className="text-xs font-medium text-white">{stats.apiCalls}/100</p>
                      </div>
                      <Progress value={stats.apiCalls} className="h-1 bg-gray-800" indicatorClassName="bg-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
        </SimpleBackgroundLayout>
      )}
    </ProtectedRoute>
  )
}
