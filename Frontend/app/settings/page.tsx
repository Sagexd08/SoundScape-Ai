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

      // Apply theme changes
      setTheme(settings.themePreference)

      // Simulate API call to save other settings
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-indigo-500 text-2xl animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <SimpleHeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
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
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gray-900/80 backdrop-blur-md border-gray-800">
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
                        <Label className="text-base mb-2 block">Theme Mode</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <Button
                            type="button"
                            variant={settings.themePreference === "light" ? "default" : "outline"}
                            className={`flex flex-col items-center justify-center h-24 ${settings.themePreference === "light" ? "bg-indigo-600" : "border-indigo-600/30 bg-gray-800/50"}`}
                            onClick={() => setSettings(prev => ({ ...prev, themePreference: "light" }))}
                          >
                            <Sun className="h-8 w-8 mb-2" />
                            <span>Light</span>
                          </Button>

                          <Button
                            type="button"
                            variant={settings.themePreference === "dark" ? "default" : "outline"}
                            className={`flex flex-col items-center justify-center h-24 ${settings.themePreference === "dark" ? "bg-indigo-600" : "border-indigo-600/30 bg-gray-800/50"}`}
                            onClick={() => setSettings(prev => ({ ...prev, themePreference: "dark" }))}
                          >
                            <Moon className="h-8 w-8 mb-2" />
                            <span>Dark</span>
                          </Button>

                          <Button
                            type="button"
                            variant={settings.themePreference === "system" ? "default" : "outline"}
                            className={`flex flex-col items-center justify-center h-24 ${settings.themePreference === "system" ? "bg-indigo-600" : "border-indigo-600/30 bg-gray-800/50"}`}
                            onClick={() => setSettings(prev => ({ ...prev, themePreference: "system" }))}
                          >
                            <Laptop className="h-8 w-8 mb-2" />
                            <span>System</span>
                          </Button>
                        </div>
                      </div>

                      <Separator className="bg-gray-800" />

                      <div>
                        <Label className="text-base mb-2 block">Theme Color</Label>
                        <div className="grid grid-cols-4 gap-4">
                          <Button
                            type="button"
                            variant={settings.themeColor === "indigo" ? "default" : "outline"}
                            className={`flex items-center justify-center h-12 ${settings.themeColor === "indigo" ? "bg-indigo-600" : "border-indigo-600/30 bg-gray-800/50"}`}
                            onClick={() => setSettings(prev => ({ ...prev, themeColor: "indigo" }))}
                          >
                            <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></div>
                            <span>Indigo</span>
                          </Button>

                          <Button
                            type="button"
                            variant={settings.themeColor === "purple" ? "default" : "outline"}
                            className={`flex items-center justify-center h-12 ${settings.themeColor === "purple" ? "bg-purple-600" : "border-purple-600/30 bg-gray-800/50"}`}
                            onClick={() => setSettings(prev => ({ ...prev, themeColor: "purple" }))}
                          >
                            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                            <span>Purple</span>
                          </Button>

                          <Button
                            type="button"
                            variant={settings.themeColor === "blue" ? "default" : "outline"}
                            className={`flex items-center justify-center h-12 ${settings.themeColor === "blue" ? "bg-blue-600" : "border-blue-600/30 bg-gray-800/50"}`}
                            onClick={() => setSettings(prev => ({ ...prev, themeColor: "blue" }))}
                          >
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                            <span>Blue</span>
                          </Button>

                          <Button
                            type="button"
                            variant={settings.themeColor === "teal" ? "default" : "outline"}
                            className={`flex items-center justify-center h-12 ${settings.themeColor === "teal" ? "bg-teal-600" : "border-teal-600/30 bg-gray-800/50"}`}
                            onClick={() => setSettings(prev => ({ ...prev, themeColor: "teal" }))}
                          >
                            <div className="w-4 h-4 rounded-full bg-teal-500 mr-2"></div>
                            <span>Teal</span>
                          </Button>
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
                      {!saving && <Save className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="bg-gray-900/80 backdrop-blur-md border-gray-800">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                        <p className="text-sm text-gray-400">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.notifications.email}
                        onCheckedChange={() => handleToggle('notifications', 'email')}
                      />
                    </div>

                    <Separator className="bg-gray-800" />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                        <p className="text-sm text-gray-400">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={settings.notifications.push}
                        onCheckedChange={() => handleToggle('notifications', 'push')}
                      />
                    </div>

                    <Separator className="bg-gray-800" />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-notifications" className="text-base">Marketing Emails</Label>
                        <p className="text-sm text-gray-400">Receive updates about new features and offers</p>
                      </div>
                      <Switch
                        id="marketing-notifications"
                        checked={settings.notifications.marketing}
                        onCheckedChange={() => handleToggle('notifications', 'marketing')}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={saveSettings}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                      {!saving && <Save className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card className="bg-gray-900/80 backdrop-blur-md border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SettingsIcon className="mr-2 h-5 w-5 text-indigo-400" />
                      Audio Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your audio experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoplay" className="text-base">Autoplay</Label>
                        <p className="text-sm text-gray-400">Automatically play audio when loaded</p>
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
                        <p className="text-sm text-gray-400">Stream audio at highest quality (uses more data)</p>
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
                        <Label htmlFor="save-history" className="text-base">Save Listening History</Label>
                        <p className="text-sm text-gray-400">Keep track of your listening history</p>
                      </div>
                      <Switch
                        id="save-history"
                        checked={settings.preferences.saveHistory}
                        onCheckedChange={() => handleToggle('preferences', 'saveHistory')}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={saveSettings}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                      {!saving && <Save className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
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
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the simplified page for now
export { default } from './simple-page';