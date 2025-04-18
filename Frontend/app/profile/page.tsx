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
import { 
  User, 
  Mail, 
  Key, 
  Image, 
  Save, 
  Upload, 
  Loader2, 
  Globe, 
  MapPin, 
  Link as LinkIcon, 
  Twitter, 
  Instagram, 
  Music, 
  Headphones, 
  Shield, 
  Bell, 
  Camera, 
  Trash2, 
  CheckCircle2, 
  Heart, 
  Wand2 
} from "lucide-react"
// Import Spotify separately since it might not be included in the barrel optimization
import { Spotify } from "lucide-react"
import Navbar from "@/components/navbar"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import SimpleBackgroundLayout from "@/components/layouts/SimpleBackgroundLayout"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Rest of the file remains the same...