"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Settings as SettingsIcon, Bell, Moon, Globe, Save } from "lucide-react"
import Navbar from "@/components/navbar"
import SimpleHeroBackground from "@/components/three/SimpleHeroBackground"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    darkMode: true,
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

      // Simulate API call
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
                <Card className="bg-gray-900/80 backdrop-blur-md border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Moon className="mr-2 h-5 w-5 text-indigo-400" />
                      Appearance Settings
                    </CardTitle>
                    <CardDescription>
                      Customize how SoundScape looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                        <p className="text-sm text-gray-400">Use dark theme throughout the application</p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={settings.darkMode}
                        onCheckedChange={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                      />
                    </div>

                    <Separator className="bg-gray-800" />

                    <div>
                      <p className="text-sm text-gray-400">
                        More appearance settings coming soon...
                      </p>
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
