"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Key, Image, Save, Upload, Loader2, Globe, MapPin, Link as LinkIcon, Twitter, Instagram, Spotify, Music, Headphones, Shield, Bell, Camera, Trash2, CheckCircle2 } from "lucide-react"
import Navbar from "@/components/navbar"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import SimpleBackgroundLayout from "@/components/layouts/SimpleBackgroundLayout"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function ProfilePage() {
  const { user, updatePassword, isLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState({
    displayName: "",
    bio: "",
    website: "",
    location: "",
    preferences: {
      emailNotifications: true,
      darkMode: true,
      publicProfile: false
    },
    social: {
      twitter: "",
      instagram: "",
      spotify: ""
    },
    stats: {
      tracksCreated: 0,
      listeningTime: 0,
      aiGenerations: 0,
      favorites: 0
    }
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      // Load user profile data
      setProfileData({
        displayName: user.user_metadata?.display_name || "",
        bio: user.user_metadata?.bio || "",
        website: user.user_metadata?.website || "",
        location: user.user_metadata?.location || "",
        preferences: {
          emailNotifications: user.user_metadata?.preferences?.emailNotifications ?? true,
          darkMode: user.user_metadata?.preferences?.darkMode ?? true,
          publicProfile: user.user_metadata?.preferences?.publicProfile ?? false
        },
        social: {
          twitter: user.user_metadata?.social?.twitter || "",
          instagram: user.user_metadata?.social?.instagram || "",
          spotify: user.user_metadata?.social?.spotify || ""
        },
        stats: {
          tracksCreated: user.user_metadata?.stats?.tracksCreated || 3,
          listeningTime: user.user_metadata?.stats?.listeningTime || 2.5,
          aiGenerations: user.user_metadata?.stats?.aiGenerations || 5,
          favorites: user.user_metadata?.stats?.favorites || 2
        }
      })

      // Set avatar URL if available
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url)
      }
    }
  }, [user, router])

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    )
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle nested fields
    if (name.includes('.')) {
      const [section, field] = name.split('.')
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value
        }
      }))
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleToggleChange = (section: string, field: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 2MB.')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }

    setAvatarFile(file)

    // Create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarUrl(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      setError(null)

      // Upload avatar if changed
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        setUploadingAvatar(true)
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, avatarFile)

        if (uploadError) {
          throw new Error(`Error uploading avatar: ${uploadError.message}`)
        }

        // Get public URL
        const { data } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath)

        newAvatarUrl = data.publicUrl
        setUploadingAvatar(false)
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: profileData.displayName,
          bio: profileData.bio,
          website: profileData.website,
          location: profileData.location,
          avatar_url: newAvatarUrl,
          social: profileData.social,
          preferences: profileData.preferences,
          stats: profileData.stats
        }
      })

      if (error) throw error

      toast.success('Profile updated successfully!')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
      toast.error(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validate passwords
      if (passwords.new !== passwords.confirm) {
        throw new Error("New passwords don't match")
      }

      if (passwords.new.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      await updatePassword(passwords.new)

      setPasswords({
        current: "",
        new: "",
        confirm: "",
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update password")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Your Profile
          </h1>

          {success && (
            <Alert className="mb-6 bg-green-900/20 border-green-600">
              <AlertDescription>Changes saved successfully!</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Social</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span>Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-indigo-400" />
                    Profile Details
                  </CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-indigo-500/50">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={profileData.displayName || user.email || "User"} />
                        ) : (
                          <AvatarFallback className="bg-indigo-900 text-indigo-200 text-xl">
                            {profileData.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md"
                        onClick={handleAvatarClick}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Click the icon to upload a profile picture</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="bg-gray-800"
                    />
                    <p className="text-xs text-gray-400">
                      Your email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleProfileChange}
                      className="bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="bg-gray-800 min-h-[100px]"
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4 text-indigo-400" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        value={profileData.website}
                        onChange={handleProfileChange}
                        className="bg-gray-800"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-indigo-400" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        className="bg-gray-800"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={saveProfile}
                    disabled={saving || uploadingAvatar}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <Save className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="social">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-indigo-400" />
                      Social Profiles
                    </CardTitle>
                    <CardDescription>
                      Connect your social media accounts
                    </CardDescription>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-1">
                      <Twitter className="h-4 w-4 text-indigo-400" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      name="social.twitter"
                      value={profileData.social.twitter}
                      onChange={handleProfileChange}
                      className="bg-gray-800"
                      placeholder="@username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-1">
                      <Instagram className="h-4 w-4 text-indigo-400" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      name="social.instagram"
                      value={profileData.social.instagram}
                      onChange={handleProfileChange}
                      className="bg-gray-800"
                      placeholder="@username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spotify" className="flex items-center gap-1">
                      <Spotify className="h-4 w-4 text-indigo-400" />
                      Spotify
                    </Label>
                    <Input
                      id="spotify"
                      name="social.spotify"
                      value={profileData.social.spotify}
                      onChange={handleProfileChange}
                      className="bg-gray-800"
                      placeholder="spotify:user:username"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <Save className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-indigo-400" />
                      Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notifications</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                          <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={profileData.preferences.emailNotifications}
                          onCheckedChange={(checked) => handleToggleChange('preferences', 'emailNotifications', checked)}
                        />
                      </div>

                      <Separator className="bg-gray-800" />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="public-profile" className="text-base">Public Profile</Label>
                          <p className="text-sm text-gray-400">Allow others to see your profile and activity</p>
                        </div>
                        <Switch
                          id="public-profile"
                          checked={profileData.preferences.publicProfile}
                          onCheckedChange={(checked) => handleToggleChange('preferences', 'publicProfile', checked)}
                        />
                      </div>
                    </div>

                    <Separator className="bg-gray-800" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Your Stats</h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">Tracks Created</p>
                            <Music className="h-4 w-4 text-indigo-400" />
                          </div>
                          <p className="text-2xl font-bold">{profileData.stats.tracksCreated}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">Listening Time</p>
                            <Headphones className="h-4 w-4 text-purple-400" />
                          </div>
                          <p className="text-2xl font-bold">{profileData.stats.listeningTime}h</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">AI Generations</p>
                            <Wand2 className="h-4 w-4 text-blue-400" />
                          </div>
                          <p className="text-2xl font-bold">{profileData.stats.aiGenerations}</p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">Favorites</p>
                            <Heart className="h-4 w-4 text-pink-400" />
                          </div>
                          <p className="text-2xl font-bold">{profileData.stats.favorites}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={saveProfile}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Changes
                          <Save className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-indigo-400" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      name="current"
                      type="password"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      className="bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      name="new"
                      type="password"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      className="bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      name="confirm"
                      type="password"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      className="bg-gray-800"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={changePassword}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? "Updating..." : "Update Password"}
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
