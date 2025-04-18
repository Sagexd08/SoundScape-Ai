"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Settings as SettingsIcon, Bell, Moon, Sun, Laptop, Save, Palette, Heart, Wand2 } from "lucide-react"
import Navbar from "@/components/navbar"
import SimpleHeroBackground from "@/components/three/SimpleHeroBackground"
import { motion } from "framer-motion"

// Original SettingsPage component
function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    themePreference: "dark",
    themeColor: "indigo",
    notifications: {
      email: true,
      push: false,
      marketing: false
    },
    preferences: {
      autoplay: true,
      highQuality: true,
      saveHistory: true
    }
  })

  // Initialize theme preference from system
  useEffect(() => {
    if (theme) {
      setSettings(prev => ({
        ...prev,
        themePreference: theme
      }))
    }
  }, [theme])

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !(prev[category as keyof typeof prev] as any)[setting]
      }
    }))
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Apply theme change
      setTheme(settings.themePreference)
      
      // Here you would save settings to user profile or database
      // For example:
      // await supabase.auth.updateUser({
      //   data: {
      //     settings: settings
      //   }
      // })
      
      // Show success message
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (err: any) {
      setError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <SimpleHeroBackground />
      </div>
      
      <Navbar />

      <div className="container relative z-10 mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Settings
          </h1>

          {success && (
            <Alert className="mb-6 bg-green-900/20 border-green-600">
              <AlertDescription>Settings saved successfully!</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="appearance" className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-1">
                <SettingsIcon className="h-4 w-4" />
                <span>Preferences</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="mr-2 h-5 w-5 text-indigo-400" />
                      Appearance Settings
                    </CardTitle>
                    <CardDescription>
                      Customize how SoundScape looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Button
                          variant={settings.themePreference === "light" ? "default" : "outline"} 
                          className={`flex flex-col items-center justify-center h-24 ${
                            settings.themePreference === "light" 
                              ? "bg-indigo-600 hover:bg-indigo-700" 
                              : "bg-gray-800/50 hover:bg-gray-700/50"
                          }`}
                          onClick={() => setSettings(prev => ({ ...prev, themePreference: "light" }))}
                        >
                          <Sun className="h-8 w-8 mb-2" />
                          <span>Light</span>
                        </Button>
                        
                        <Button
                          variant={settings.themePreference === "dark" ? "default" : "outline"}
                          className={`flex flex-col items-center justify-center h-24 ${
                            settings.themePreference === "dark" 
                              ? "bg-indigo-600 hover:bg-indigo-700" 
                              : "bg-gray-800/50 hover:bg-gray-700/50"
                          }`}
                          onClick={() => setSettings(prev => ({ ...prev, themePreference: "dark" }))}
                        >
                          <Moon className="h-8 w-8 mb-2" />
                          <span>Dark</span>
                        </Button>
                        
                        <Button
                          variant={settings.themePreference === "system" ? "default" : "outline"}
                          className={`flex flex-col items-center justify-center h-24 ${
                            settings.themePreference === "system" 
                              ? "bg-indigo-600 hover:bg-indigo-700" 
                              : "bg-gray-800/50 hover:bg-gray-700/50"
                          }`}
                          onClick={() => setSettings(prev => ({ ...prev, themePreference: "system" }))}
                        >
                          <Laptop className="h-8 w-8 mb-2" />
                          <span>System</span>
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-gray-800" />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Theme Color</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {['indigo', 'purple', 'blue', 'green'].map((color) => (
                          <button
                            key={color}
                            className={`h-12 rounded-md transition-all ${
                              settings.themeColor === color 
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105' 
                                : ''
                            }`}
                            style={{ 
                              backgroundColor: `var(--${color}-500)`,
                              opacity: settings.themeColor === color ? 1 : 0.7
                            }}
                            onClick={() => setSettings(prev => ({ ...prev, themeColor: color }))}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={saveSettings}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-indigo-400" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifs" className="text-base">Email Notifications</Label>
                          <p className="text-sm text-gray-400">Receive updates via email</p>
                        </div>
                        <Switch
                          id="email-notifs"
                          checked={settings.notifications.email}
                          onCheckedChange={() => handleToggle('notifications', 'email')}
                        />
                      </div>

                      <Separator className="bg-gray-800" />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifs" className="text-base">Push Notifications</Label>
                          <p className="text-sm text-gray-400">Receive notifications in your browser</p>
                        </div>
                        <Switch
                          id="push-notifs"
                          checked={settings.notifications.push}
                          onCheckedChange={() => handleToggle('notifications', 'push')}
                        />
                      </div>

                      <Separator className="bg-gray-800" />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketing-notifs" className="text-base">Marketing Emails</Label>
                          <p className="text-sm text-gray-400">Receive news about new features and updates</p>
                        </div>
                        <Switch
                          id="marketing-notifs"
                          checked={settings.notifications.marketing}
                          onCheckedChange={() => handleToggle('notifications', 'marketing')}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={saveSettings}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="preferences">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SettingsIcon className="mr-2 h-5 w-5 text-indigo-400" />
                      App Preferences
                    </CardTitle>
                    <CardDescription>
                      Configure how SoundScape behaves
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoplay" className="text-base">Autoplay</Label>
                          <p className="text-sm text-gray-400">Automatically play tracks when loaded</p>
                        </div>
                        <Switch
                          id="autoplay"
                          checked={settings.preferences.autoplay}
                          onCheckedChange={() => handleToggle('preferences', 'autoplay')}
                        />
                      </div>

                      <Separator className="bg-gray-800" />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="high-quality" className="text-base">High Quality Audio</Label>
                          <p className="text-sm text-gray-400">Use more bandwidth for better sound</p>
                        </div>
                        <Switch
                          id="high-quality"
                          checked={settings.preferences.highQuality}
                          onCheckedChange={() => handleToggle('preferences', 'highQuality')}
                        />
                      </div>

                      <Separator className="bg-gray-800" />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="save-history" className="text-base">Save History</Label>
                          <p className="text-sm text-gray-400">Keep track of your listening history</p>
                        </div>
                        <Switch
                          id="save-history"
                          checked={settings.preferences.saveHistory}
                          onCheckedChange={() => handleToggle('preferences', 'saveHistory')}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={saveSettings}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-indigo-600 text-indigo-400 hover:bg-indigo-950"
            >
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Export the simplified page for now
export { default } from './simple-page';